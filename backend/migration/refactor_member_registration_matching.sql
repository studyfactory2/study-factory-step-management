DROP INDEX IF EXISTS idx_member_pre_registration_unique_pending;
DROP INDEX IF EXISTS "IDX_member_pre_registration_name_residence_position";

CREATE UNIQUE INDEX IF NOT EXISTS idx_member_pre_registration_unique_pending
  ON member_pre_registration (name, organization_id, position_id)
  WHERE is_registered = false;
