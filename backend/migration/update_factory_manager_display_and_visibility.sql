UPDATE member_positions
SET
  name = '공장장',
  subtitle = '관리/검토',
  is_login_visible = true
WHERE code = 'OPERATIONS_MANAGER';

UPDATE member_positions
SET is_login_visible = false
WHERE code IN ('CONTENT_MANAGER', 'MARKETER', 'DESIGNER');
