import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  age_bracket: z.enum(['13-15', '16-17', '18+']),
  preferences: z.object({
    favorite_games: z.array(z.string()).default([]),
    skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
    play_style: z.enum(['competitive', 'casual', 'creative', 'social']).default('casual'),
    preferred_topics: z.array(z.string()).default([])
  }).default({}),
  gamification: z.object({
    xp: z.number().default(0),
    level: z.string().default('Noob'),
    streak_days: z.number().default(0),
    streak_last_date: z.string().nullable().default(null),
    badges: z.array(z.string()).default([])
  }).default({})
});

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string()
});

export const ChatRequestSchema = z.object({
  message: z.string().max(2000),
  conversation_id: z.string().uuid().optional(),
  game_context: z.record(z.any()).optional()
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
