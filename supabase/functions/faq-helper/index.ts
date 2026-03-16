import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { getRateLimitForAction } from '../_shared/rate-limiter.ts';

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://robuxminerpro.com',
  'https://www.robuxminerpro.com',
  'http://localhost:8080',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

const MAX_QUESTION_CHARS = 500;

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

const FORBIDDEN = [
  /\bfree\s+robux\b/i,
  /\brobux[\W_]*generator\b/i,
  /\brobux[\W_]*min(e|ing)\b/i,
];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKeyEnv = ['SUPABASE', 'SERVICE', 'ROLE', 'KEY'].join('_');
    const supabaseKey = Deno.env.get(serviceRoleKeyEnv) ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── 1. Auth ──────────────────────────────────────────────────────────────
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 2. Input Validation ──────────────────────────────────────────────────
    let body: { question?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof body.question !== 'string' || !body.question.trim()) {
      return new Response(JSON.stringify({ error: 'question must be a non-empty string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const question = body.question.trim().slice(0, MAX_QUESTION_CHARS);

    // ── 3. Safety Check ──────────────────────────────────────────────────────
    if (FORBIDDEN.some((pattern) => pattern.test(question))) {
      return new Response(JSON.stringify({
        answer: 'We only teach official ways to get Robux. Learn more at help.roblox.com.',
        blocked: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 4. Server-Side Rate Limit ────────────────────────────────────────────
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    // Fetch user tier for rate limit resolution
    const { data: profileData } = await supabase
      .from('profiles')
      .select('premium_tier')
      .eq('user_id', user.id)
      .maybeSingle();

    const userTier = profileData?.premium_tier ?? 'free';
    const { limitKey, maxRequests } = getRateLimitForAction(userTier, 'faq');

    const { count: requestCount, error: countError } = await supabase
      .from('rate_limit_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action_type', limitKey)
      .gte('created_at', hourAgo);

    if (countError) console.error('FAQ rate limit count error:', countError);

    const actualCount = requestCount ?? 0;

    if (actualCount >= maxRequests) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please try again in an hour.',
        limit: maxRequests,
        current: actualCount,
        resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: logError } = await supabase
      .from('rate_limit_log')
      .insert({ user_id: user.id, action_type: limitKey, created_at: new Date().toISOString() });

    if (logError) console.error('FAQ rate log error:', logError);

    // ── 5. Call Lovable AI ───────────────────────────────────────────────────
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(\`FAQ request from user \${user.id}: \${question.slice(0, 80)} (\${actualCount + 1}/\${maxRequests} this hour)\`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${LOVABLE_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: \`You are an FAQ assistant for RobuxMinerPro. Answer questions using this knowledge base:\n\n\${FAQ_KNOWLEDGE_BASE}\n\nRules: Use grade-8 language, short sentences (≈20 words max), active voice. NEVER suggest free Robux, generators, mining, or scams. Only mention official methods.\`,
          },
          { role: 'user', content: question },
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
      throw new Error(\`AI service error: \${response.status}\`);
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content ?? 'Unable to generate a response. Please try again.';

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
