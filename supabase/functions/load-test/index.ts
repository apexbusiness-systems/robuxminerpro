import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface LoadTestError {
  userId: number;
  message: number;
  status?: number;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (Deno.env.get("ALLOW_LOAD_TEST") !== "true") {
    return new Response(JSON.stringify({ error: "not_found" }), { 
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { targetFunction, concurrentUsers, messagesPerUser } = await req.json();
    
    if (!targetFunction || !concurrentUsers || !messagesPerUser) {
      throw new Error('Missing required parameters: targetFunction, concurrentUsers, messagesPerUser');
    }

    console.log(`Starting load test: ${concurrentUsers} users × ${messagesPerUser} messages to ${targetFunction}`);

    const startTime = Date.now();
    const results = {
      totalRequests: 0,
      successful: 0,
      failed: 0,
      rateLimited: 0,
      errors: [] as LoadTestError[],
      avgResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
    };

    const testUser = async (userId: number) => {
      for (let i = 0; i < messagesPerUser; i++) {
        const reqStart = Date.now();
        try {
          const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/${targetFunction}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: `Test message ${i} from user ${userId}` }]
            }),
          });

          const responseTime = Date.now() - reqStart;
          results.totalRequests++;
          
          if (response.status === 429) {
            results.rateLimited++;
          } else if (response.ok) {
            results.successful++;
            results.avgResponseTime += responseTime;
            results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
            results.minResponseTime = Math.min(results.minResponseTime, responseTime);
          } else {
            results.failed++;
            results.errors.push({ userId, message: i, status: response.status });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({ userId, message: i, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
    };

    // Run concurrent users
    const userPromises = Array.from({ length: concurrentUsers }, (_, i) => testUser(i + 1));
    await Promise.all(userPromises);

    const totalTime = Date.now() - startTime;
    results.avgResponseTime = results.successful > 0 ? results.avgResponseTime / results.successful : 0;

    const report = {
      ...results,
      totalTimeMs: totalTime,
      requestsPerSecond: (results.totalRequests / (totalTime / 1000)).toFixed(2),
      successRate: ((results.successful / results.totalRequests) * 100).toFixed(2) + '%',
      rateLimitRate: ((results.rateLimited / results.totalRequests) * 100).toFixed(2) + '%',
    };

    console.log('Load test complete:', report);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Load test error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
