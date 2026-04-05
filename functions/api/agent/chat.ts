import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
}

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }) as unknown;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const payload = await request.json();
    const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl) throw new Error("Missing Supabase URL config in environment.");

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/agent-chat`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return jsonResponse(data as Record<string, unknown>, response.status);

  } catch (error_: unknown) {
    return jsonResponse({ error: `Backend Error: ${error_.message}` }, 500);
  }
};
