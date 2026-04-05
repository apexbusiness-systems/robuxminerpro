import { PagesFunction } from "@cloudflare/workers-types";

// Type definition for Cloudflare environment variables
interface Env {
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  VITE_GROQ_API_KEY?: string;
}

type ChatRole = 'system' | 'user' | 'assistant' | 'model';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  activeFrameBase64?: string | null;
}

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.content === 'string' &&
    ['system', 'user', 'assistant', 'model'].includes(String(candidate.role))
  );
};

const isChatRequestBody = (value: unknown): value is ChatRequestBody => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  const { messages, activeFrameBase64 } = candidate;

  return (
    Array.isArray(messages) &&
    messages.every(isChatMessage) &&
    (activeFrameBase64 === undefined || activeFrameBase64 === null || typeof activeFrameBase64 === 'string')
  );
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as unknown;
    if (!isChatRequestBody(body) || body.messages.length === 0) {
      return jsonResponse({ error: 'Invalid chat request payload.' }, 400);
    }

    const { messages, activeFrameBase64 } = body;

    const GEMINI_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
    const GROQ_KEY = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY;

    if (!GEMINI_KEY && !GROQ_KEY) {
      return jsonResponse({ 
        error: 'Agent Ave: Neural link offline - API keys are missing from Cloudflare Server.' 
      }, 500);
    }

    // Try Gemini First
    if (GEMINI_KEY) {
      try {
        const systemMessage = messages.find((message) => message.role === 'system')?.content || '';
        const nonSystemMessages = messages.filter((message) => message.role !== 'system');

        if (nonSystemMessages.length > 0) {
          const geminiPayload: {
            contents: Array<{
               role: 'user' | 'model';
               parts: Array<
                 | { text: string }
                 | { inline_data: { mime_type: string; data: string } }
               >;
            }>;
            system_instruction?: { parts: Array<{ text: string }> };
          } = {
            contents: nonSystemMessages.map((msg) => ({
              role: (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user',
              parts: [{ text: msg.content }]
            }))
          };
          
          if (systemMessage) {
            geminiPayload.system_instruction = { parts: [{ text: systemMessage }] };
          }

          if (activeFrameBase64) {
             geminiPayload.contents[geminiPayload.contents.length - 1].parts.push({
               inline_data: { mime_type: "image/jpeg", data: activeFrameBase64 }
             });
          }

          const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json() as unknown;
            if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
              return jsonResponse({
                reply: geminiData.candidates[0].content.parts[0].text
              }, 200);
            }
          } else {
            console.warn(`Gemini Edge failed with ${geminiRes.status}:`, await geminiRes.text());
          }
        }
      } catch (err) {
        console.warn('Gemini edge failed. Falling back to Groq.', err);
      }
    }

    // Fallback exactly to Groq
    if (GROQ_KEY) {
      const groqModel = activeFrameBase64 ? 'llama-3.2-11b-vision-preview' : 'llama3-8b-8192';
      
      const groqPayload: {
        model: string;
        messages: Array<{
          role: 'system' | 'user' | 'assistant';
          content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
        }>;
        temperature: number;
        max_tokens: number;
      } = {
        model: groqModel,
        messages: messages.map((msg) => ({
          role: msg.role === 'model' ? 'assistant' : msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 500
      };

      if (activeFrameBase64 && groqPayload.messages.length > 0) {
        const lastMsg = groqPayload.messages[groqPayload.messages.length - 1];
        lastMsg.content = [
          { type: 'text', text: lastMsg.content as string },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${activeFrameBase64}` } }
        ];
      }

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groqPayload)
      });

      if (!groqRes.ok) {
        const text = await groqRes.text();
        throw new Error(`Groq HTTP Error: ${groqRes.status} - ${text}`);
      }

      const groqData = await groqRes.json() as unknown;
      return jsonResponse({
        reply: groqData.choices[0].message.content
      }, 200);
    }

    return jsonResponse({ 
      error: 'Agent Ave: Both neural networks failed to respond.' 
    }, 500);

  } catch (err: unknown) {
    return jsonResponse({ 
      error: `Agent Ave: Backend execution failed - ${getErrorMessage(err)}` 
    }, 500);
  }
};
