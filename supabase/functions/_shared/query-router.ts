export type ModelTier = 'fast' | 'balanced' | 'smart';

export function classifyQuery(message: string, hasRagResults: boolean): ModelTier {
  const lowerMsg = message.toLowerCase();
  
  // FAST criteria:
  // - Short casual greeting/thanks
  // - Message length < 50 chars unless it has question marks or code symbols
  const isGreeting = /^hi|hello|hey|yo|thanks|ty|thx|bye|cya$/.test(lowerMsg.trim());
  
  if (isGreeting || (message.length < 50 && !message.includes('?') && !message.includes('{'))) {
    return 'fast'; // → Groq Llama 3
  }
  
  // SMART criteria:
  // - Contains Luau code blocks or scripting keywords
  // - Multi-part questions (e.g., "1.", "2.", "and then")
  // - Safety edge cases and complex trading value queries
  const isCode = lowerMsg.includes('local function') || lowerMsg.includes('game.workspace') || message.includes('```');
  if (isCode || message.length > 300) {
    return 'smart'; // → Gemini Pro
  }
  
  // BALANCED criteria:
  // Standard strategy questions, RAG lookups, etc.
  return 'balanced'; // → Gemini Flash
}
