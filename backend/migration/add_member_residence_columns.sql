ALTER TABLE member_pre_registration
  ADD COLUMN IF NOT EXISTS residence_city VARCHAR,
  ADD COLUMN IF NOT EXISTS residence_district VARCHAR;

ALTER TABLE member
  ADD COLUMN IF NOT EXISTS residence_city VARCHAR,
  ADD COLUMN IF NOT EXISTS residence_district VARCHAR;

UPDATE member_pre_registration
SET
  residence_city = CASE
    WHEN branch LIKE '% %' THEN split_part(branch, ' ', 1)
    ELSE residence_city
  END,
  residence_district = CASE
    WHEN branch LIKE '% %' THEN trim(substr(branch, length(split_part(branch, ' ', 1)) + 1))
    ELSE COALESCE(residence_district, branch)
  END,
  branch = CASE
    WHEN branch LIKE '% %' THEN NULL
    ELSE branch
  END
WHERE branch IS NOT NULL
  AND (residence_city IS NULL OR residence_district IS NULL);

DROP INDEX IF EXISTS idx_member_pre_registration_unique_pending;

CREATE UNIQUE INDEX IF NOT EXISTS idx_member_pre_registration_unique_pending
  ON member_pre_registration (name, residence_city, residence_district, position_id, position_duty_id)
  WHERE is_registered = false;
