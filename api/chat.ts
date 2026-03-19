export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages, activeFrameBase64 } = await req.json();

    const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const GROQ_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

    if (!GEMINI_KEY && !GROQ_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Agent Ave: Neural link offline - API keys are missing from Vercel Server.' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Try Gemini First
    if (GEMINI_KEY) {
      try {
        const systemMessage = messages.find((m: any) => m.role === 'system')?.content || '';
        
        const geminiPayload: any = {
          contents: messages.filter((m: any) => m.role !== 'system').map((msg: any) => ({
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
          const geminiData = await geminiRes.json();
          if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
            return new Response(JSON.stringify({
              reply: geminiData.candidates[0].content.parts[0].text
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        } else {
          console.warn(`Gemini Edge failed with ${geminiRes.status}:`, await geminiRes.text());
        }
      } catch (err) {
        console.warn('Gemini edge failed. Falling back to Groq.', err);
      }
    }

    // Fallback exactly to Groq
    if (GROQ_KEY) {
      const groqModel = activeFrameBase64 ? 'llama-3.2-11b-vision-preview' : 'llama3-8b-8192';
      
      const groqPayload: any = {
        model: groqModel,
        messages: messages.map((msg: any) => ({
          role: msg.role === 'model' ? 'assistant' : msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 500
      };

      if (activeFrameBase64 && groqPayload.messages.length > 0) {
        const lastMsg = groqPayload.messages[groqPayload.messages.length - 1];
        lastMsg.content = [
          { type: 'text', text: lastMsg.content },
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

      const groqData = await groqRes.json();
      return new Response(JSON.stringify({
        reply: groqData.choices[0].message.content
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ 
      error: 'Agent Ave: Both neural networks failed to respond.' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ 
      error: `Agent Ave: Backend execution failed - ${err.message}` 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
