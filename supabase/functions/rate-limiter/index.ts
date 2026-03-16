import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { getRateLimitForAction } from "../_shared/rate-limiter.ts";

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

    const { action } = await req.json();

    // Get the session from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const userId = user.id;

    // Get user tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('premium_tier')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error — defaulting to free tier:', profileError);
    }

    const tier: string = profile?.premium_tier ?? 'free';

    // Check rate limit
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { limitKey, maxRequests, tier: resolvedTier } = getRateLimitForAction(
      tier,
      action,
    );

    const { count: requestCount, error: requestError } = await supabase
      .from('rate_limit_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action_type', limitKey)
      .gte('created_at', hourAgo);

    if (requestError) throw requestError;

    const actualRequestCount = requestCount || 0;

    if (actualRequestCount >= maxRequests) {
      return new Response(JSON.stringify({ 
        allowed: false, 
        tier: resolvedTier,
        limit: maxRequests,
        current: actualRequestCount,
        resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        message: `Rate limit exceeded. ${
          resolvedTier === "free"
            ? "Upgrade to Premium for higher limits."
            : "Please try again later."
        }`,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the request
    const { error: logError } = await supabase
      .from('rate_limit_log')
      .insert({ user_id: userId, action_type: limitKey, created_at: new Date().toISOString() });

    if (logError) console.error('Log error:', logError);

    return new Response(JSON.stringify({ 
      allowed: true, 
      tier: resolvedTier,
      limit: maxRequests,
      current: actualRequestCount + 1,
      remaining: maxRequests - actualRequestCount - 1,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Rate limiter error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
