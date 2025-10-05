-- SECURITY & DATA PERSISTENCE HARDENING
-- This migration adds foreign keys, indexes, constraints, and validation triggers

-- 1. Add missing foreign key constraints for referential integrity
ALTER TABLE profiles 
  ADD CONSTRAINT fk_profiles_referred_by 
  FOREIGN KEY (referred_by) 
  REFERENCES profiles(user_id) 
  ON DELETE SET NULL;

ALTER TABLE referrals 
  ADD CONSTRAINT fk_referrals_referrer 
  FOREIGN KEY (referrer_id) 
  REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE referrals 
  ADD CONSTRAINT fk_referrals_referred 
  FOREIGN KEY (referred_id) 
  REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE mining_sessions 
  ADD CONSTRAINT fk_mining_sessions_user 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE transactions 
  ADD CONSTRAINT fk_transactions_user 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE user_task_completions 
  ADD CONSTRAINT fk_task_completions_user 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE user_task_completions 
  ADD CONSTRAINT fk_task_completions_task 
  FOREIGN KEY (task_id) 
  REFERENCES tasks(id) 
  ON DELETE CASCADE;

-- 2. Add unique constraint on referral_code to prevent duplicates
ALTER TABLE profiles 
  ADD CONSTRAINT unique_referral_code 
  UNIQUE (referral_code);

-- 3. Add performance indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_active ON mining_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_task_completions_user ON user_task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_completions_status ON user_task_completions(user_id, status);

-- 4. Add data validation constraints
ALTER TABLE profiles 
  ADD CONSTRAINT check_total_robux_non_negative 
  CHECK (total_robux >= 0);

ALTER TABLE profiles 
  ADD CONSTRAINT check_mining_power_positive 
  CHECK (mining_power > 0);

ALTER TABLE mining_sessions 
  ADD CONSTRAINT check_robux_earned_non_negative 
  CHECK (robux_earned >= 0);

ALTER TABLE mining_sessions 
  ADD CONSTRAINT check_mining_power_positive 
  CHECK (mining_power_used > 0);

ALTER TABLE transactions 
  ADD CONSTRAINT check_amount_not_zero 
  CHECK (amount != 0);

ALTER TABLE referrals 
  ADD CONSTRAINT check_bonus_earned_non_negative 
  CHECK (bonus_earned >= 0);

ALTER TABLE referrals 
  ADD CONSTRAINT check_no_self_referral 
  CHECK (referrer_id != referred_id);

ALTER TABLE tasks 
  ADD CONSTRAINT check_robux_reward_positive 
  CHECK (robux_reward > 0);

ALTER TABLE tasks 
  ADD CONSTRAINT check_daily_limit_positive 
  CHECK (daily_limit IS NULL OR daily_limit > 0);

-- 5. Add validation trigger for mining session end_time
CREATE OR REPLACE FUNCTION validate_mining_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure end_time is after start_time
  IF NEW.end_time IS NOT NULL AND NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'end_time must be after start_time';
  END IF;
  
  -- When session ends, ensure is_active is false
  IF NEW.end_time IS NOT NULL AND NEW.is_active = true THEN
    NEW.is_active = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_mining_session
  BEFORE INSERT OR UPDATE ON mining_sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_mining_session();

-- 6. Add validation trigger for user_task_completions
CREATE OR REPLACE FUNCTION validate_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure completed_at is after started_at
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL 
     AND NEW.completed_at <= NEW.started_at THEN
    RAISE EXCEPTION 'completed_at must be after started_at';
  END IF;
  
  -- When completed, ensure status is completed
  IF NEW.completed_at IS NOT NULL AND NEW.status != 'completed' THEN
    NEW.status = 'completed';
  END IF;
  
  -- Ensure robux_earned matches task reward when completed
  IF NEW.status = 'completed' AND NEW.completed_at IS NOT NULL THEN
    NEW.robux_earned = (SELECT robux_reward FROM tasks WHERE id = NEW.task_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_task_completion
  BEFORE INSERT OR UPDATE ON user_task_completions
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_completion();

-- 7. Add trigger to prevent referral_code modification after creation
CREATE OR REPLACE FUNCTION protect_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.referral_code IS NOT NULL AND NEW.referral_code != OLD.referral_code THEN
    RAISE EXCEPTION 'referral_code cannot be modified after creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_referral_code
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_referral_code();

-- 8. Add input validation for username and display_name
ALTER TABLE profiles 
  ADD CONSTRAINT check_username_length 
  CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 20));

ALTER TABLE profiles 
  ADD CONSTRAINT check_display_name_length 
  CHECK (display_name IS NULL OR (char_length(display_name) >= 1 AND char_length(display_name) <= 50));

ALTER TABLE profiles 
  ADD CONSTRAINT check_referral_code_format 
  CHECK (referral_code IS NULL OR (referral_code ~ '^[A-Z0-9]{8}$'));

-- 9. Add constraint to prevent duplicate active referrals
CREATE UNIQUE INDEX unique_active_referral 
  ON referrals(referrer_id, referred_id) 
  WHERE is_active = true;