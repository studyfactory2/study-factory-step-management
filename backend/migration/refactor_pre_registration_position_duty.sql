ALTER TABLE position_duties
  ADD COLUMN IF NOT EXISTS name VARCHAR;

ALTER TABLE position_duties
  ALTER COLUMN duty DROP NOT NULL;

UPDATE position_duties
SET name = duty::text
WHERE name IS NULL
  AND duty IS NOT NULL;

ALTER TABLE member_pre_registration
  ADD COLUMN IF NOT EXISTS position_id INTEGER;

ALTER TABLE member_pre_registration
  ADD COLUMN IF NOT EXISTS position_duty_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_member_pre_registration_position_id'
  ) THEN
    ALTER TABLE member_pre_registration
      ADD CONSTRAINT fk_member_pre_registration_position_id
      FOREIGN KEY (position_id)
      REFERENCES member_positions (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_member_pre_registration_position_duty_id'
  ) THEN
    ALTER TABLE member_pre_registration
      ADD CONSTRAINT fk_member_pre_registration_position_duty_id
      FOREIGN KEY (position_duty_id)
      REFERENCES position_duties (id);
  END IF;
END $$;

UPDATE member_pre_registration pre_registration
SET position_id = position.id
FROM member_positions position
WHERE pre_registration.position_id IS NULL
  AND pre_registration.position::text = position.code;

UPDATE member_pre_registration pre_registration
SET position_duty_id = position_duty.id
FROM position_duties position_duty
WHERE pre_registration.position_duty_id IS NULL
  AND pre_registration.position_id = position_duty.position_id
  AND pre_registration.duty::text = COALESCE(position_duty.name, position_duty.duty::text);
