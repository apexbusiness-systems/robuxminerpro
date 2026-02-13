import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { getRateLimitForAction } from "../_shared/rate-limiter.ts";

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
      console.error('Profile fetch error:', profileError);
    }

    const tier = profile?.premium_tier;

    // Check rate limit
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { limitKey, maxRequests, tier: resolvedTier } = getRateLimitForAction(
      tier,
      action,
    );

    const { data: recentRequests, error: requestError } = await supabase
      .from('rate_limit_log')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', limitKey)
      .gte('created_at', hourAgo);

    if (requestError) throw requestError;

    const requestCount = recentRequests?.length || 0;

    if (requestCount >= maxRequests) {
      return new Response(JSON.stringify({ 
        allowed: false, 
        tier: resolvedTier,
        limit: maxRequests,
        current: requestCount,
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
      current: requestCount + 1,
      remaining: maxRequests - requestCount - 1,
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
