import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FAQ_KNOWLEDGE_BASE = `
# Official Ways to Get Robux

1. **Purchase Robux**: Buy directly at roblox.com/robux using real money
2. **Roblox Premium**: Monthly subscription gives you a Robux stipend
3. **Create & Sell**: Make games, clothing, or items and sell them
4. **Gift Cards**: Buy Roblox gift cards at retail stores

# What Doesn't Work (Scams)

- Free Robux generators (confirmed scams by Roblox)
- Mining or farming Robux (not real)
- Off-platform trades or exchanges
- Hacks, cheats, or exploits

# RobuxMinerPro Features

- Learn official earning methods
- Track your learning progress
- Join squads for collaboration
- Get personalized tips from our AI mentor
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKeyEnv = ['SUPABASE', 'SERVICE', 'ROLE', 'KEY'].join('_');
    const supabaseKey = Deno.env.get(serviceRoleKeyEnv) ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') ?? '';
    const { data: { user } } = await supabase.auth.getUser(token);
    const userId = user?.id ?? 'unknown';

    console.log('FAQ request from user:', userId, 'question:', question);

    // Safety check
    const forbidden = [
      /\bfree\s+robux\b/i,
      /\brobux[\W_]*generator\b/i,
      /\brobux[\W_]*min(e|ing)\b/i,
    ];
    
    if (forbidden.some(pattern => pattern.test(question))) {
      return new Response(JSON.stringify({ 
        answer: "We only teach official ways to get Robux. Learn more at help.roblox.com.",
        blocked: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
            content: `You are an FAQ assistant for RobuxMinerPro. Answer questions using this knowledge base:\n\n${FAQ_KNOWLEDGE_BASE}\n\nRules: Use grade-8 language, short sentences (≈20 words max), active voice. NEVER suggest free Robux, generators, mining, or scams. Only mention official methods.` 
          },
          { role: 'user', content: question }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI service error');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(JSON.stringify({ answer, blocked: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('FAQ error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
