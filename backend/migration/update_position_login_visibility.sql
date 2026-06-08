UPDATE member_positions
SET is_login_visible = CASE
  WHEN code = 'ADMIN' THEN false
  ELSE true
END;
