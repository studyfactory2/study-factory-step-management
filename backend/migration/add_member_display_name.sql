ALTER TABLE member
  ADD COLUMN IF NOT EXISTS display_name VARCHAR;

UPDATE member
SET display_name = name
WHERE display_name IS NULL;
