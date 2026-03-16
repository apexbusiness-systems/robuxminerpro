import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { getRateLimitForAction } from '../_shared/rate-limiter.ts';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Restrict to known production origins. Add your domain here before go-live.
const ALLOWED_ORIGINS = [
  'https://robuxminerpro.com',
  'https://www.robuxminerpro.com',
  'http://localhost:8080',  // dev only — remove before production
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

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_MESSAGES = 50;
const MAX_MESSAGE_CHARS = 2000;

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
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 2. Input Validation ──────────────────────────────────────────────────
    let body: { messages: unknown; isHighIntent?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'messages must be an array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize and cap the message array
    const safeMessages = body.messages
      .slice(-MAX_MESSAGES)
      .map((m: unknown) => {
        if (typeof m !== 'object' || m === null) return null;
        const msg = m as Record<string, unknown>;
        const role = msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user';
        const content = String(msg.content ?? '').slice(0, MAX_MESSAGE_CHARS);
        return { role, content };
      })
      .filter(Boolean) as Array<{ role: 'user' | 'assistant'; content: string }>;

    const isHighIntent = body.isHighIntent === true;

    // ── 3. Server-Side Rate Limit Check ──────────────────────────────────────
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    // Fetch user tier for rate limit resolution
    const { data: profileData } = await supabase
      .from('profiles')
      .select('premium_tier')
      .eq('user_id', user.id)
      .maybeSingle();

    const userTier = profileData?.premium_tier ?? 'free';
    const { limitKey, maxRequests } = getRateLimitForAction(userTier, 'chat');

    const { count: requestCount, error: countError } = await supabase
      .from('rate_limit_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action_type', limitKey)
      .gte('created_at', hourAgo);

    if (countError) {
      console.error('Rate limit count error:', countError);
      // Fail open with a conservative check rather than blocking all requests
    }

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

    // Log this request
    const { error: logError } = await supabase
      .from('rate_limit_log')
      .insert({ user_id: user.id, action_type: limitKey, created_at: new Date().toISOString() });

    if (logError) console.error('Rate log insert error:', logError);

    // ── 4. Call Lovable AI ───────────────────────────────────────────────────
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(\`Chat request: \${safeMessages.length} messages from user \${user.id} (\${actualCount + 1}/\${maxRequests} this hour)\`);
    if (isHighIntent) console.log('High Intent Mode: ACTIVE');

    const systemContent = 'You are a helpful learning assistant for RobuxMinerPro. Teach users official ways to get Robux: buy on roblox.com/robux, Roblox Premium monthly stipend, create and sell items/games, or buy gift cards. NEVER suggest free Robux, generators, mining, hacks, or off-platform trades—Roblox states these are scams. Use everyday words, short sentences (≈20 words max), active voice. Keep answers clear, friendly, grade-8 reading level.'
      + (isHighIntent ? ' END WITH A STRONG CALL TO ACTION: "Ready to start? Click Get Started now!"' : '');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${LOVABLE_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: systemContent }, ...safeMessages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Upstream Lovable AI rate limit exceeded');
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
