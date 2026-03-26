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

    const { data, error } = await supabase
      .from("agent_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return jsonResponse(data, 200);
  } catch (error_: any) {
    return jsonResponse({ error: error_.message }, error_.message === "Unauthorized" ? 401 : 500);
  }
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const supabase = getSupabase(request, env);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const body = await request.json() as { preferences?: any, age_bracket?: string, parental_consent?: boolean };
    
    const updates: any = {};
    if (body.preferences) updates.preferences = body.preferences;
    if (body.age_bracket) updates.age_bracket = body.age_bracket;
    if (body.parental_consent !== undefined) updates.parental_consent = body.parental_consent;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("agent_profiles")
      .update(updates)
      .eq("id", user.id)
      .select().single();

    if (error) throw error;
    return jsonResponse(data, 200);
  } catch (error_: any) {
    return jsonResponse({ error: error_.message }, 500);
  }
};
