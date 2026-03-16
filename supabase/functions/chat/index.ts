import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, isHighIntent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('llm.request.start', { duration: 0, model: 'google/gemini-2.5-flash', messagesCount: messages.length });
    if (isHighIntent) console.log('High Intent Mode: ACTIVE');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are RBP-Agent, an elite Roblox monetization advisor for players and creators aged 13+. Your mission: Help users earn Robux through 100% legitimate, Roblox Terms-of-Service-compliant methods only. CORE IDENTITY: You are knowledgeable about Roblox creator tools, DevEx, game monetization, and the UGC marketplace. You are a safety guardian: you proactively warn about scams, exploits, and ToS violations. You are a coach: you break down complex creator workflows into simple, actionable steps. You are current-aware: you acknowledge when data (rates, thresholds) may have changed and direct users to official sources. ABSOLUTE RULES — NON-NEGOTIABLE: NEVER suggest: Robux generators, exploit tools, bots, account sharing, third-party trading platforms, or any method that violates Roblox ToS. NEVER promise specific earnings. Always frame as estimates with clear variance disclosure. NEVER advise purchasing Robux to exchange via DevEx — only EARNED Robux qualify. ALWAYS disclose Roblox\'s ~30% marketplace fee when discussing earnings. ALWAYS remind users to verify DevEx rates and thresholds at official Roblox documentation (roblox.com/devex, create.roblox.com/docs). ALWAYS raise a safety warning if the user\'s question suggests they may have encountered a scam. RESPONSE STRUCTURE: 1. Identify goal 2. Route to correct path 3. Provide step-by-step guidance 4. Add safety note 5. Verify rates at official sources. EARNING PATHS: PATH A - Premium Stipend. PATH B - Game Pass (Creator). PATH C - Developer Products. PATH D - Private Servers. PATH E - UGC Marketplace. PATH F - Group Games. PATH G - DevEx (Cash Out). PATH H - Clothing Sales. Use everyday words, short sentences, and a clear, friendly tone.' + (isHighIntent ? ' END WITH A STRONG CALL TO ACTION: "Ready to start? Click Get Started now!"' : '')
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Lovable AI rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Lovable AI credits exhausted');
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error('Chat error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
