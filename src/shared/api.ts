import { supabase } from '@/integrations/supabase/client';
import type { EarningsSession, EarningsStreak, Achievement } from '@/types';

type AnyObj = Record<string, unknown>;

// Fallback stubs for offline/unauthenticated mode
const STUBS: Record<string, unknown> = {
  "/earnings/session/active": { balance: 0, perMinute: 0, elapsed: "00:00:00" } as EarningsSession,
  "/earnings/streak": { days: 0 } as EarningsStreak,
  "/earnings/milestones": [],
  "/ai/recommendations": [
    "Complete daily tasks to boost mining power",
    "Join a squad to earn 10% bonus",
    "Verify your email for a one-time reward"
  ],
  "/squads/top": [],
  "/user/squad": null,
  "/achievements/user": [],
  "/achievements": [],
  "/learning-paths": [],
  "/learning-paths/user-progress": []
};

export async function get<T = unknown>(path: string): Promise<T | null> {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return stub<T>(path);
    }

    // Route requests to real Supabase queries
    if (path === '/earnings/session/active') {
      const { data, error } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) return stub<T>(path);

      const startTime = new Date(data.start_time).getTime();
      const now = new Date().getTime();
      const elapsedMs = now - startTime;

      // Format elapsed time as HH:MM:SS
      const hours = Math.floor(elapsedMs / 3600000);
      const minutes = Math.floor((elapsedMs % 3600000) / 60000);
      const seconds = Math.floor((elapsedMs % 60000) / 1000);
      const elapsed = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // Mock calculation for balance and perMinute based on mining_power usage
      // In a real app, this might come from the DB or a separate calculation
      const balance = data.robux_earned || 0;
      const perMinute = 0.5; // Base rate

      return { balance, perMinute, elapsed } as unknown as T;
    }

    if (path === '/earnings/streak') {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_login')
        .eq('user_id', userId)
        .single();

      if (error || !data) return { days: 0 } as unknown as T;

      // Simple streak logic: if last_login is today/yesterday, return 1 (mock)
      // Real implementation would need a login history table
      return { days: data.last_login ? 1 : 0 } as unknown as T;
    }

    if (path === '/achievements' || path === '/achievements/user') {
      // Return empty list to trigger default achievements in UI
      // or implement query to user_task_completions if applicable
      return [] as unknown as T;
    }

    // Default fallback for unmapped routes
    return stub<T>(path);

  } catch (error) {
    // Silent fail to stub
    return stub<T>(path);
  }
}

function stub<T = unknown>(path: string): T {
  const key = Object.keys(STUBS).find(k => path.includes(k));
  return (key ? STUBS[key] : {}) as T;
}
