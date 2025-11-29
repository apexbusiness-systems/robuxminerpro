import type { EarningsSession, EarningsStreak } from '@/types';

type AnyObj = Record<string, unknown>;

const STUBS: Record<string, unknown> = {
  "/earnings/session/active": { balance: 0, perMinute: 0, elapsed: "00:00:00" } as EarningsSession,
  "/earnings/streak": { days: 0 } as EarningsStreak,
  "/earnings/milestones": [],
  "/ai/recommendations": ["Create & sell UGC items", "Increase session time safely"],
  "/squads/top": [],
  "/user/squad": null,
  "/achievements/user": [],
  "/learning-paths": [],
  "/learning-paths/user-progress": []
};

export async function get<T = unknown>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, { headers: { accept: "application/json" } });
    if (res.status === 204) return null;
    if (res.status === 404) return stub<T>(path);
    return await res.json().catch(() => ({} as T));
  } catch {
    return stub<T>(path);
  }
}

function stub<T = unknown>(path: string): T {
  const key = Object.keys(STUBS).find(k => path.includes(k));
  return (key ? STUBS[key] : {}) as T;
}