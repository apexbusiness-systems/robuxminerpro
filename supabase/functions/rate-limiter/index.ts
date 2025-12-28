import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit configurations by tier
const RATE_LIMITS = {
  free: {
    chatRequestsPerHour: 20,
    faqRequestsPerHour: 10,
  },
  premium: {
    chatRequestsPerHour: 200,
    faqRequestsPerHour: 100,
  },
  enterprise: {
    chatRequestsPerHour: 1000,
    faqRequestsPerHour: 500,
  },
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

    const { userId, action } = await req.json();

    // Get user tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('premium_tier')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    const tier = profile?.premium_tier || 'free';
    const limits = RATE_LIMITS[tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;

    // Check rate limit
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    let limitKey: string;
    let maxRequests: number;

    if (action === 'chat') {
      limitKey = 'chat';
      maxRequests = limits.chatRequestsPerHour;
    } else if (action === 'faq') {
      limitKey = 'faq';
      maxRequests = limits.faqRequestsPerHour;
    } else {
      throw new Error('Invalid action');
    }

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
        tier,
        limit: maxRequests,
        current: requestCount,
        resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        message: `Rate limit exceeded. ${tier === 'free' ? 'Upgrade to Premium for higher limits.' : 'Please try again later.'}`,
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
      tier,
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
