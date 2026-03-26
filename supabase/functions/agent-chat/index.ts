import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { ChatRequestSchema, ChatRequest } from "../_shared/types.ts";
import { scanInputSafety, scanOutputSafety } from "../_shared/safety.ts";
import { classifyQuery, ModelTier } from "../_shared/query-router.ts";
import { embedText, callGroq, callGemini } from "../_shared/llm-clients.ts";
import { AGENT_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";
import { MAX_CONTEXT_MESSAGES, XP_PER_MESSAGE, XP_PER_STRATEGY } from "../_shared/constants.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const groqApiKey = Deno.env.get("GROQ_API_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

async function authenticate(req: Request): Promise<{ supabase: SupabaseClient; user: User } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  return { supabase, user };
}

async function handleSafetyViolation(user: User, triggerType: string, conversationId?: string) {
  const systemSupabase = createClient(supabaseUrl, supabaseServiceKey);
  await systemSupabase.from("safety_logs").insert({
    user_id: user.id,
    conversation_id: conversationId ?? null,
    trigger_type: triggerType,
    input_hash: "REDACTED", 
    action_taken: "blocked_input"
  });

  return new Response(JSON.stringify({
    message: "I can't respond to that. Let's keep things safe and focused on gaming!",
    metadata: { safety_intercept: true }
  }), { headers: corsHeaders });
}

async function getOrCreateConversation(supabase: SupabaseClient, userId: string, payload: ChatRequest) {
  if (payload.conversation_id) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', payload.conversation_id)
      .order('created_at', { ascending: false })
      .limit(MAX_CONTEXT_MESSAGES);
    return { activeConvId: payload.conversation_id, messageHistory: msgs ? msgs.reverse() : [] };
  }

  const title = payload.message.slice(0, 50) + '...';
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, game_context: payload.game_context ?? {} })
    .select('id').single();
    
  if (convError) throw convError;
  return { activeConvId: newConv.id, messageHistory: [] };
}

async function executeLLMCall(tier: ModelTier, systemPrompt: string, allMessages: any[]) {
  const startTime = Date.now();
  let generatedText = "";
  let finalModel = "groq/llama-3.1-8b";

  try {
    if (tier === 'fast') {
      generatedText = await callGroq(systemPrompt, allMessages, groqApiKey);
    } else {
      finalModel = tier === 'smart' ? "gemini/2.5-pro" : "gemini/2.5-flash";
      generatedText = await callGemini(systemPrompt, allMessages, geminiApiKey, tier === 'smart');
    }
  } catch (error) {
    console.error("LLM Call Failed:", error);
    try {
      finalModel = "gemini/2.5-flash";
      generatedText = await callGemini(systemPrompt, allMessages, geminiApiKey, false);
    } catch (error_) {
      generatedText = "I'm having trouble connecting to the network right now. Give me a second and try again!";
    }
  }

  return { generatedText, finalModel, latency_ms: Date.now() - startTime };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const authResult = await authenticate(req);
    if (authResult instanceof Response) return authResult;
    const { supabase, user } = authResult;

    const rawBody = await req.json();
    const parseResult = ChatRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request payload", details: parseResult.error }), { status: 400, headers: corsHeaders });
    }
    const payload = parseResult.data;

    const safeInput = scanInputSafety(payload.message);
    if (safeInput.safe === false && safeInput.flags.length > 0) {
      return await handleSafetyViolation(user, safeInput.flags[0], payload.conversation_id);
    }
    const finalInputMessage = safeInput.redactedText;

    const { activeConvId, messageHistory } = await getOrCreateConversation(supabase, user.id, payload);

    const queryEmbedding = await embedText(payload.message, geminiApiKey);
    const [{ data: memories }, { data: knowledge }] = await Promise.all([
      supabase.rpc('match_memories', { query_embedding: queryEmbedding, match_user_id: user.id, match_count: 5, match_threshold: 0.7 }),
      supabase.rpc('match_knowledge', { query_embedding: queryEmbedding, match_category: null, match_count: 5, match_threshold: 0.65 })
    ]);

    const { data: profile } = await supabase.from('agent_profiles').select('*').eq('id', user.id).single();

    const tier = classifyQuery(payload.message, (knowledge !== null && knowledge.length > 0));

    let contextBlock = "\n\n<context>\n";
    if (profile) contextBlock += "<profile>" + JSON.stringify(profile.preferences) + "</profile>\n";
    if (payload.game_context) contextBlock += "<game_state>" + JSON.stringify(payload.game_context) + "</game_state>\n";
    if (memories && memories.length > 0) {
      contextBlock += "<memories>\n" + memories.map((m: any) => "- " + m.content).join('\n') + "\n</memories>\n";
    }
    if (knowledge && knowledge.length > 0) {
      contextBlock += "<knowledge>\n" + knowledge.map((k: any) => "[" + k.title + "]: " + k.content).join('\n') + "\n</knowledge>\n";
    }
    contextBlock += "</context>";

    const fullSystemPrompt = AGENT_SYSTEM_PROMPT + contextBlock;
    const allMessages = [...messageHistory, { role: 'user', content: finalInputMessage }];

    let { generatedText, finalModel, latency_ms } = await executeLLMCall(tier, fullSystemPrompt, allMessages);

    const safeOutput = scanOutputSafety(generatedText);
    if (safeOutput.safe === false) {
      generatedText = safeOutput.safeAlternative || "I can't provide that response.";
    }

    await supabase.from('messages').insert([
      { conversation_id: activeConvId, role: 'user', content: finalInputMessage },
      { 
        conversation_id: activeConvId, 
        role: 'assistant', 
        content: generatedText, 
        model: finalModel, 
        latency_ms,
        metadata: { tier, memories_used: memories?.length, knowledge_used: knowledge?.length }
      }
    ]);

    let xpEarned = XP_PER_MESSAGE;
    if (generatedText.includes("strategy") || generatedText.includes("guide")) xpEarned += XP_PER_STRATEGY;

    return new Response(JSON.stringify({
      message: generatedText,
      conversation_id: activeConvId,
      metadata: {
        model: finalModel,
        latency_ms,
        routing_tier: tier,
        xp_earned: xpEarned,
        gamification: profile?.gamification || {}
      }
    }), { headers: corsHeaders });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
