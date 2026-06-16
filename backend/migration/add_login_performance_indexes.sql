CREATE INDEX IF NOT EXISTS idx_member_login_credentials
  ON member (name, password_hash)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_refresh_token_member_id
  ON refresh_token (member_id);
