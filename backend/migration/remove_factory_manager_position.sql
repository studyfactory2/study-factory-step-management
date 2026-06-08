UPDATE member
SET position_id = operations_manager.id
FROM member_positions AS factory_manager
JOIN member_positions AS operations_manager
  ON operations_manager.code = 'OPERATIONS_MANAGER'
WHERE factory_manager.code = 'FACTORY_MANAGER'
  AND member.position_id = factory_manager.id;

UPDATE member_positions AS child
SET parent_id = operations_manager.id
FROM member_positions AS factory_manager
JOIN member_positions AS operations_manager
  ON operations_manager.code = 'OPERATIONS_MANAGER'
WHERE factory_manager.code = 'FACTORY_MANAGER'
  AND child.parent_id = factory_manager.id;

DELETE FROM position_duties
WHERE position_id IN (
  SELECT id
  FROM member_positions
  WHERE code = 'FACTORY_MANAGER'
);

DELETE FROM member_positions
WHERE code = 'FACTORY_MANAGER';

UPDATE member_positions
SET
  name = '공장장',
  subtitle = '관리/검토',
  is_login_visible = true
WHERE code = 'OPERATIONS_MANAGER';

UPDATE member_positions
SET is_login_visible = false
WHERE code IN ('CONTENT_MANAGER', 'MARKETER', 'DESIGNER');

UPDATE member_positions
SET display_order = CASE code
  WHEN 'CEO' THEN 1
  WHEN 'ADMIN' THEN 2
  WHEN 'OPERATIONS_MANAGER' THEN 3
  WHEN 'DEVELOPMENT_LEAD' THEN 4
  WHEN 'DEVELOPER' THEN 5
  WHEN 'DESIGNER' THEN 6
  WHEN 'MARKETER' THEN 7
  WHEN 'CONTENT_MANAGER' THEN 8
  WHEN 'STAFF' THEN 9
  WHEN 'EMPLOYEE' THEN 10
  ELSE display_order
END;

ALTER TYPE member_position_enum RENAME TO member_position_enum_old;

CREATE TYPE member_position_enum AS ENUM (
  'DEVELOPMENT_LEAD',
  'DEVELOPER',
  'STAFF',
  'EMPLOYEE',
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER'
);

DROP TYPE member_position_enum_old;

ALTER TYPE member_pre_registration_position_enum RENAME TO member_pre_registration_position_enum_old;

CREATE TYPE member_pre_registration_position_enum AS ENUM (
  'DEVELOPMENT_LEAD',
  'DEVELOPER',
  'STAFF',
  'EMPLOYEE',
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER'
);

ALTER TABLE member_pre_registration
  ALTER COLUMN position TYPE member_pre_registration_position_enum
  USING (
    CASE
      WHEN position::text = 'FACTORY_MANAGER' THEN 'OPERATIONS_MANAGER'
      ELSE position::text
    END
  )::member_pre_registration_position_enum;

DROP TYPE member_pre_registration_position_enum_old;
