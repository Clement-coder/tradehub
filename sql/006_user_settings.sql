-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  privy_user_id TEXT NOT NULL,
  
  -- Notification Settings
  notifications_enabled BOOLEAN DEFAULT true,
  price_alerts_enabled BOOLEAN DEFAULT true,
  email_updates_enabled BOOLEAN DEFAULT false,
  
  -- Display Settings
  dark_mode_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id),
  UNIQUE(privy_user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_privy_user_id ON user_settings(privy_user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can read their own settings
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR privy_user_id = current_setting('app.current_privy_user_id', true)
  );

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR privy_user_id = current_setting('app.current_privy_user_id', true)
  );

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR privy_user_id = current_setting('app.current_privy_user_id', true)
  );
