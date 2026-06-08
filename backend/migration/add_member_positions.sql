CREATE TABLE member_positions (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  code VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  subtitle VARCHAR,
  parent_id INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_login_visible BOOLEAN NOT NULL DEFAULT true,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_member_positions_parent_id
    FOREIGN KEY (parent_id)
    REFERENCES member_positions (id)
);

CREATE INDEX idx_member_positions_parent_id
  ON member_positions (parent_id);

CREATE INDEX idx_member_positions_display_order
  ON member_positions (display_order);

INSERT INTO member_positions (code, name, subtitle, parent_id, display_order, is_login_visible, is_admin, is_active)
VALUES
  ('CEO', '대표', '최종 승인자', NULL, 1, true, true, true),
  ('ADMIN', '관리자', '관리자', NULL, 2, false, true, true),
  ('OPERATIONS_MANAGER', '운영관리자', '관리/검토', NULL, 3, true, false, true),
  ('DEVELOPMENT_LEAD', '개발팀장', '개발관리', NULL, 4, true, false, true),
  ('DEVELOPER', '개발자', '직원', NULL, 5, true, false, true),
  ('FACTORY_MANAGER', '공장장', '총괄', NULL, 6, true, false, true),
  ('DESIGNER', '디자이너', '직원', NULL, 7, true, false, true),
  ('MARKETER', '마케터', '직원', NULL, 8, true, false, true),
  ('CONTENT_MANAGER', '콘텐츠담당', '직원', NULL, 9, true, false, true),
  ('STAFF', '스텝', '직원', NULL, 10, true, false, true),
  ('EMPLOYEE', '직원', '직원', NULL, 11, true, false, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  display_order = EXCLUDED.display_order,
  is_login_visible = EXCLUDED.is_login_visible,
  is_admin = EXCLUDED.is_admin,
  is_active = EXCLUDED.is_active;

UPDATE member_positions AS child
SET parent_id = parent.id
FROM member_positions AS parent
WHERE
  (child.code = 'OPERATIONS_MANAGER' AND parent.code = 'CEO')
  OR (child.code = 'DEVELOPMENT_LEAD' AND parent.code = 'CEO')
  OR (child.code = 'FACTORY_MANAGER' AND parent.code = 'OPERATIONS_MANAGER')
  OR (child.code = 'DESIGNER' AND parent.code = 'OPERATIONS_MANAGER')
  OR (child.code = 'MARKETER' AND parent.code = 'OPERATIONS_MANAGER')
  OR (child.code = 'DEVELOPER' AND parent.code = 'DEVELOPMENT_LEAD')
  OR (child.code = 'CONTENT_MANAGER' AND parent.code = 'DEVELOPMENT_LEAD')
  OR (child.code = 'STAFF' AND parent.code = 'FACTORY_MANAGER')
  OR (child.code = 'EMPLOYEE' AND parent.code = 'FACTORY_MANAGER');
