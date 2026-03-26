import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { callGemini, embedText } from "../_shared/llm-clients.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const authHeader = req.headers.get("Authorization");
    const expectedAuth = "Bearer " + supabaseServiceKey;
    if (authHeader !== expectedAuth) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { conversation_id } = await req.json();
    if (!conversation_id) return new Response("Missing conversation_id", { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('*, messages (role, content)')
      .eq('id', conversation_id)
      .single();

    if (convError || !conv) throw new Error("Conversation not found");
    if (!conv.messages || conv.messages.length === 0) return new Response("Ok", { status: 200 });

    const chatLog = conv.messages.map((m: any) => m.role + ": " + m.content).join("\n");

    const prompt = "Extract key facts, preferences, and game events from this conversation that would be useful to remember for future interactions with this player. Return as JSON array:\n" +
      "[{\"memory_type\": \"fact|preference|game_event|skill_assessment\", \"content\": \"string\", \"importance\": 0.0-1.0}]\n" +
      "Return ONLY the JSON array. No other text.";

    let jsonResponse = await callGemini(prompt, [{ role: 'user', content: chatLog }], geminiApiKey, false);
    
    if (jsonResponse.startsWith("```json")) {
      jsonResponse = jsonResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    const memories = JSON.parse(jsonResponse);

    if (Array.isArray(memories)) {
      for (const m of memories) {
        if (!m.content || !m.memory_type) continue;
        const embedding = await embedText(m.content, geminiApiKey);
        
        await supabase.from('agent_memories').insert({
          user_id: conv.user_id,
          memory_type: m.memory_type,
          content: m.content,
          importance: m.importance ?? 0.5,
          source_conversation_id: conversation_id,
          embedding
        });
      }
    }

    return new Response(JSON.stringify({ success: true, count: memories.length }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
