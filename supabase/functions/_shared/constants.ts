export const XP_PER_MESSAGE = 5;
export const XP_PER_STRATEGY = 10;

export const LEVEL_THRESHOLDS: Record<string, number> = {
  Noob: 0,
  Explorer: 500,
  Strategist: 1500,
  Master: 4000,
  Legend: 10000,
  Mythic: 25000
};

export const MAX_CONTEXT_MESSAGES = 10;
export const MAX_RAG_RESULTS = 5;
export const MAX_MEMORY_RESULTS = 5;

export const GROQ_TIMEOUT_MS = 10000;
export const GEMINI_TIMEOUT_MS = 30000;

export const RATE_LIMIT_FREE = { per_minute: 30, per_day: 500 };
export const RATE_LIMIT_PREMIUM = { per_minute: 200, per_day: 5000 };
