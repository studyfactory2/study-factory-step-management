ALTER TABLE member
  DROP COLUMN IF EXISTS age;

ALTER TABLE member_pre_registration
  DROP COLUMN IF EXISTS age;
