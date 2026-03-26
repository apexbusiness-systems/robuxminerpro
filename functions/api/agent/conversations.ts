import { PagesFunction } from "@cloudflare/workers-types";
import { createClient } from "@supabase/supabase-js";

interface Env {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

const jsonResponse = (body: any, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }) as any;

function getSupabase(request: Request<unknown, unknown>, env: Env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) throw new Error("Unauthorized");
  
  const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key) throw new Error("Missing Supabase config");
  
  return createClient(url, key, {
    global: { headers: { Authorization: authHeader } }
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const supabase = getSupabase(request, env);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const url = new Request(request.url).url; // workaround to parse URL
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("conversations")
      .select("*", { count: 'exact' })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return jsonResponse({ data, total: count, page, limit }, 200);
  } catch (error_: any) {
    return jsonResponse({ error: error_.message }, error_.message === "Unauthorized" ? 401 : 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const supabase = getSupabase(request, env);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const body = await request.json() as { title?: string, game_context?: any };
    
    const { data, error } = await supabase
      .from("conversations")
      .insert({ 
        user_id: user.id, 
        title: body.title || 'New Chat',
        game_context: body.game_context || {} 
      })
      .select().single();

    if (error) throw error;
    return jsonResponse(data, 201);
  } catch (error_: any) {
    return jsonResponse({ error: error_.message }, 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const supabase = getSupabase(request, env);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const url = new Request(request.url).url;
    const searchParams = new URL(url).searchParams;
    const id = searchParams.get("id");
    if (!id) return jsonResponse({ error: "Missing conversation id" }, 400);

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return jsonResponse({ success: true }, 200);
  } catch (error_: any) {
    return jsonResponse({ error: error_.message }, 500);
  }
};
