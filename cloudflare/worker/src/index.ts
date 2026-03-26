export interface Env {
  ENVIRONMENT: string;
  GROQ_API_KEY: string;
  GEMINI_API_KEY: string;
  AI_GATEWAY_TOKEN: string;
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_ID: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RATE_LIMIT: KVNamespace;
  RESPONSE_CACHE: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function checkRateLimit(ip: string, env: Env): Promise<{ allowed: boolean, remaining: number, retryAfter: number }> {
  // If RATE_LIMIT KV isn't bound, bypass
  if (!env.RATE_LIMIT) return { allowed: true, remaining: 30, retryAfter: 0 };

  const limit = 30; // 30 req / min free tier
  const windowMs = 60000;
  const key = `rate_limit:${ip}`;
  
  const currentCountText = await env.RATE_LIMIT.get(key);
  let currentCount = currentCountText ? parseInt(currentCountText, 10) : 0;
  
  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, retryAfter: 60 };
  }
  
  currentCount++;
  await env.RATE_LIMIT.put(key, currentCount.toString(), { expirationTtl: 60 });
  
  return { allowed: true, remaining: limit - currentCount, retryAfter: 0 };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
      const rlResult = await checkRateLimit(clientIp, env);
      
      if (!rlResult.allowed) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": rlResult.retryAfter.toString() } 
        });
      }

      const url = new URL(request.url);
      const isGroq = url.pathname.includes('/groq');
      const isGemini = url.pathname.includes('/gemini');
      
      if (!isGroq && !isGemini) {
        return new Response("Not Found", { status: 404, headers: corsHeaders });
      }

      const gatewayAccountId = env.AI_GATEWAY_ACCOUNT_ID || "unknown";
      const gatewayId = env.AI_GATEWAY_ID || "robuxminerpro-agent";
      const gatewayBase = `https://gateway.ai.cloudflare.com/v1/${gatewayAccountId}/${gatewayId}`;
      
      const targetUrl = isGroq 
        ? `${gatewayBase}/groq/openai/v1/chat/completions`
        : `${gatewayBase}/google-ai-studio/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      const apiKeyHeader = isGroq ? { "Authorization": `Bearer ${env.GROQ_API_KEY}` } : {};
      const gatewayAuthHeader = env.AI_GATEWAY_TOKEN ? { "cf-aig-authorization": `Bearer ${env.AI_GATEWAY_TOKEN}` } : {};
      
      const upstreamReq = new Request(targetUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          ...apiKeyHeader,
          ...gatewayAuthHeader
        },
        body: request.method === 'POST' ? await request.text() : undefined
      });

      const response = await fetch(upstreamReq);
      
      const finalHeaders = new Headers(response.headers);
      finalHeaders.set('Access-Control-Allow-Origin', '*');
      
      return new Response(response.body, {
        status: response.status,
        headers: finalHeaders
      });

    } catch (err: any) {
      return new Response(JSON.stringify({ error: "Gateway error", message: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
