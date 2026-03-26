import { GROQ_TIMEOUT_MS, GEMINI_TIMEOUT_MS } from "./constants.ts";
import { Message } from "./types.ts";

// Utility for fetch timeouts
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export async function callGroq(systemPrompt: string, messages: Message[], apiKey: string): Promise<string> {
  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content
    }))
  ];

  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500
    })
  }, GROQ_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Groq Call Failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callGemini(systemPrompt: string, messages: Message[], apiKey: string, isPro = false): Promise<string> {
  const model = isPro ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  
  const contents = messages.map(m => ({
    role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      system_instruction: { parts: [{ text: systemPrompt }] }
    })
  }, GEMINI_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Gemini Call Failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini returned no candidates');
  }
  return data.candidates[0].content.parts[0].text;
}

export async function embedText(text: string, apiKey: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] }
    })
  }, GROQ_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Embed Call Failed: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding.values;
}
