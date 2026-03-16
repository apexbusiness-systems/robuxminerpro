-- Add premium tier to profiles for rate limit enforcement
CREATE TYPE public.premium_tier AS ENUM ('free', 'premium', 'enterprise');

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_tier public.premium_tier NOT NULL DEFAULT 'free';

COMMENT ON COLUMN public.profiles.premium_tier IS 'User subscription tier. Controls rate limits and feature access.';
