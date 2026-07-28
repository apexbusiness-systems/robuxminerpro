import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { embedText } from "../_shared/llm-clients.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const authHeader = req.headers.get("Authorization");
    // Require service_role key for ingestion
    const expectedAuth = "Bearer " + supabaseServiceKey;
    if (authHeader !== expectedAuth) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { documents } = await req.json();
    if (!documents || !Array.isArray(documents)) {
      return new Response("Invalid payload", { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let insertedCount = 0;

    for (const doc of documents) {
      if (!doc.title || !doc.content || !doc.category) continue;
      
      const embedding = await embedText(doc.content, geminiApiKey);
      
      const { error } = await supabase.from('knowledge_base').insert({
        title: doc.title,
        content: doc.content,
        category: doc.category,
        source_url: doc.source_url ?? null,
        embedding
      });

      if (!error) insertedCount++;
      else console.error("Insert error:", error);
    }

    return new Response(JSON.stringify({ success: true, insertedCount }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 500 });
  }
});
