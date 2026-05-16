-- =============================================================================
-- Migration: 20260515000001_rmp_hardening.sql
-- Purpose:   RLS, atomic server-side reward functions, streak column
-- Author:    APEX Business Systems Ltd.
-- Date:      2026-05-15
-- Safety:    Fully idempotent — safe to re-run
-- =============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_leaderboard_read" ON public.profiles;
CREATE POLICY "profiles_leaderboard_read" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "mining_sessions_own" ON public.mining_sessions;
CREATE POLICY "mining_sessions_own" ON public.mining_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "transactions_read_own" ON public.transactions;
CREATE POLICY "transactions_read_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "utc_own" ON public.user_task_completions;
CREATE POLICY "utc_own" ON public.user_task_completions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "tasks_read" ON public.tasks;
CREATE POLICY "tasks_read" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "referrals_own" ON public.referrals;
CREATE POLICY "referrals_own" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE OR REPLACE FUNCTION public.claim_mining_reward(p_power NUMERIC,p_duration_seconds INTEGER) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE v_user_id UUID := auth.uid(); v_reward INTEGER; v_session_id UUID; BEGIN IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED: Not authenticated'; END IF; IF EXISTS (SELECT 1 FROM mining_sessions WHERE user_id = v_user_id AND end_time > NOW() - INTERVAL '28 seconds') THEN RAISE EXCEPTION 'RATE_LIMIT: Mining claim too frequent — wait 30 seconds'; END IF; p_duration_seconds := GREATEST(5, LEAST(p_duration_seconds, 28800)); v_reward := GREATEST(1, FLOOR(p_power * p_duration_seconds::NUMERIC / 3600.0 * 100.0)::INTEGER); INSERT INTO mining_sessions (user_id, mining_power_used, robux_earned,is_active, start_time, end_time) VALUES (v_user_id, p_power, v_reward,false,NOW() - (p_duration_seconds || ' seconds')::INTERVAL,NOW()) RETURNING id INTO v_session_id; UPDATE profiles SET total_robux = total_robux + v_reward, updated_at = NOW() WHERE user_id = v_user_id; INSERT INTO transactions (user_id, amount, transaction_type, description, reference_id) VALUES (v_user_id, v_reward, 'mining_reward','Mining session reward', v_session_id); RETURN jsonb_build_object('reward',v_reward,'session_id',v_session_id,'power_used',p_power,'duration_s',p_duration_seconds); END; $$;
CREATE OR REPLACE FUNCTION public.record_daily_login() RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE v_user_id UUID := auth.uid(); v_last_login TIMESTAMPTZ; v_streak INTEGER; v_bonus INTEGER := 0; v_days_diff INTEGER; BEGIN IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED: Not authenticated'; END IF; SELECT last_login, streak_count INTO v_last_login, v_streak FROM profiles WHERE user_id = v_user_id; IF v_last_login IS NOT NULL AND v_last_login::DATE = CURRENT_DATE THEN RETURN jsonb_build_object('streak', v_streak, 'bonus', 0, 'already_claimed', true); END IF; v_days_diff := CASE WHEN v_last_login IS NULL THEN 999 ELSE CURRENT_DATE - v_last_login::DATE END; v_streak := CASE WHEN v_days_diff = 1 THEN v_streak + 1 ELSE 1 END; v_bonus := CASE WHEN v_streak >= 30 THEN 500 WHEN v_streak >= 14 THEN 250 WHEN v_streak >= 7 THEN 100 WHEN v_streak >= 3 THEN 30 ELSE 0 END; UPDATE profiles SET last_login = NOW(), streak_count = v_streak, total_robux = total_robux + v_bonus, updated_at = NOW() WHERE user_id = v_user_id; IF v_bonus > 0 THEN INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (v_user_id, v_bonus, 'task_completion', 'Daily streak bonus — day ' || v_streak); END IF; RETURN jsonb_build_object('streak', v_streak, 'bonus', v_bonus, 'already_claimed', false); END; $$;
GRANT EXECUTE ON FUNCTION public.claim_mining_reward(NUMERIC, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_daily_login() TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mining_sessions;
