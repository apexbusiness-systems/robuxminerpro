-- Feature Flags Table for A/B Testing and Gradual Rollouts
-- Supports percentage-based rollout (5% -> 25% -> 100%)

CREATE TABLE IF NOT EXISTS feature_flags (
  name TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow public read access (flags are not sensitive)
CREATE POLICY "Feature flags are publicly readable"
  ON feature_flags FOR SELECT
  USING (true);

-- Only authenticated admins can modify
CREATE POLICY "Only admins can modify feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Insert initial feature flags
INSERT INTO feature_flags (name, enabled, rollout_percentage, description) VALUES
  ('LLM_MENTOR_ENABLED', false, 0, 'Enable AI-powered mentorship via Lovable AI Gateway'),
  ('LLM_FAQ_ENABLED', false, 0, 'Enable AI-powered FAQ assistance'),
  ('SQUADS_WRITE_ENABLED', true, 100, 'Enable squad creation and management'),
  ('ACHIEVEMENTS_ENABLED', true, 100, 'Enable achievement tracking system'),
  ('PAYMENTS_ENABLED', false, 0, 'Enable premium tier payments'),
  ('ANALYTICS_ENABLED', true, 100, 'Enable user analytics tracking')
ON CONFLICT (name) DO NOTHING;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_feature_flag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feature_flags_timestamp
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flag_timestamp();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Add audit logging table
CREATE TABLE IF NOT EXISTS feature_flag_audit (
  id BIGSERIAL PRIMARY KEY,
  flag_name TEXT NOT NULL,
  old_enabled BOOLEAN,
  new_enabled BOOLEAN,
  old_rollout_percentage INTEGER,
  new_rollout_percentage INTEGER,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit trigger
CREATE OR REPLACE FUNCTION audit_feature_flag_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feature_flag_audit (
    flag_name,
    old_enabled,
    new_enabled,
    old_rollout_percentage,
    new_rollout_percentage,
    changed_by
  ) VALUES (
    NEW.name,
    OLD.enabled,
    NEW.enabled,
    OLD.rollout_percentage,
    NEW.rollout_percentage,
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_feature_flags
  AFTER UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION audit_feature_flag_changes();

COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and A/B testing';
COMMENT ON COLUMN feature_flags.rollout_percentage IS 'Percentage of users who see this feature (0-100)';
