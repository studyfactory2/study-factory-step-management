ALTER TABLE member
  ADD COLUMN position_duty_id INTEGER;

UPDATE member
SET position_duty_id = position_duties.id
FROM position_duties
WHERE member.position_id = position_duties.position_id
  AND member.duty = position_duties.duty;

ALTER TABLE member
  ADD CONSTRAINT fk_member_position_duty_id
    FOREIGN KEY (position_duty_id)
    REFERENCES position_duties (id);

CREATE INDEX idx_member_position_duty_id
  ON member (position_duty_id);

ALTER TABLE member
  DROP COLUMN affiliation,
  DROP COLUMN duty;

ALTER TYPE member_role_type_enum RENAME TO member_role_type_enum_old;

CREATE TYPE member_role_type_enum AS ENUM (
  'CEO',
  'ADMIN',
  'EMPLOYEE'
);

ALTER TABLE member
  ALTER COLUMN role_type TYPE member_role_type_enum
  USING (
    CASE
      WHEN role_type::text = 'CEO' THEN 'CEO'
      WHEN role_type::text = 'ADMIN' THEN 'ADMIN'
      ELSE 'EMPLOYEE'
    END
  )::member_role_type_enum;

DROP TYPE member_role_type_enum_old;

ALTER TYPE member_pre_registration_role_type_enum RENAME TO member_pre_registration_role_type_enum_old;

CREATE TYPE member_pre_registration_role_type_enum AS ENUM (
  'CEO',
  'ADMIN',
  'EMPLOYEE'
);

ALTER TABLE member_pre_registration
  ALTER COLUMN role_type TYPE member_pre_registration_role_type_enum
  USING (
    CASE
      WHEN role_type::text = 'CEO' THEN 'CEO'
      WHEN role_type::text = 'ADMIN' THEN 'ADMIN'
      ELSE 'EMPLOYEE'
    END
  )::member_pre_registration_role_type_enum;

DROP TYPE member_pre_registration_role_type_enum_old;
