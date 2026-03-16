-- Add current_streak tracking to profiles
-- Streak is incremented server-side on each daily login.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date DATE;

-- Backfill: users with a recent last_login get streak = 1 as a starting point
UPDATE public.profiles
SET current_streak = 1
WHERE last_login IS NOT NULL
  AND last_login::date >= CURRENT_DATE - INTERVAL '1 day';

COMMENT ON COLUMN public.profiles.current_streak IS 'Number of consecutive daily login days.';
COMMENT ON COLUMN public.profiles.last_streak_date IS 'Date (UTC) of the last login that incremented the streak.';
