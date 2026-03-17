import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from '../src/shared/api';
import { supabase } from '../src/integrations/supabase/client';

// Mock the Supabase client
vi.mock('../src/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('api.ts get() utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns stub data when user is not authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const result = await get('/earnings/session/active');
    expect(result).toEqual({ balance: 0, perMinute: 0, elapsed: "00:00:00" });
  });

  it('returns data from Supabase for /earnings/session/active when authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const mockData = {
      start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      robux_earned: 100,
      mining_power_used: 2,
    };

    const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const secondEqMock = vi.fn().mockReturnValue({ eq: eqMock });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: secondEqMock
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const result = await get('/earnings/session/active');
    expect(result).toMatchObject({
      balance: 100,
      perMinute: 1, // 2 * 0.5
    });

    const resultObj = result as { elapsed: string };
    expect(resultObj.elapsed).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('returns fallback stub when Supabase query fails with an error', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    // Mock query failure
    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const secondEqMock = vi.fn().mockReturnValue({ eq: eqMock });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: secondEqMock
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const result = await get('/earnings/session/active');
    // Should return stub
    expect(result).toEqual({ balance: 0, perMinute: 0, elapsed: "00:00:00" });
  });

  it('returns fallback stub when an exception occurs in the try-catch block', async () => {
    // Force an error in getSession to trigger the catch block in get()
    vi.mocked(supabase.auth.getSession).mockRejectedValue(new Error('Auth failed unexpectedly'));

    const result = await get('/earnings/session/active');
    // Should return stub due to catch block
    expect(result).toEqual({ balance: 0, perMinute: 0, elapsed: "00:00:00" });
  });

  it('handles /earnings/streak path correctly when authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const today = new Date().toISOString();
    const mockData = {
      current_streak: 5,
      last_streak_date: today,
    };

    const singleMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: eqMock
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const result = await get('/earnings/streak');
    expect(result).toEqual({ days: 5 });
  });

  it('returns default streak of 0 when streak is broken', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const longAgo = new Date('2020-01-01').toISOString();
    const mockData = {
      current_streak: 5,
      last_streak_date: longAgo,
    };

    const singleMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: eqMock
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const result = await get('/earnings/streak');
    expect(result).toEqual({ days: 0 });
  });
});
