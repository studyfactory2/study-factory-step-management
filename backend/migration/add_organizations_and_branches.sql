CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL UNIQUE,
  code VARCHAR NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  organization_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_branches_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id),
  CONSTRAINT uq_branches_organization_name
    UNIQUE (organization_id, name)
);

INSERT INTO organizations (name, code, display_order, is_active)
VALUES
  ('수험생연구소', 'EXAM_RESEARCH', 1, true),
  ('자격증공장', 'CERT_FACTORY', 2, true)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO branches (organization_id, name, display_order, is_active)
SELECT organization.id, branch.name, branch.display_order, true
FROM organizations organization
JOIN (
  VALUES
    ('EXAM_RESEARCH', '본사', 1),
    ('EXAM_RESEARCH', '부산', 2),
    ('EXAM_RESEARCH', '대구', 3),
    ('CERT_FACTORY', '본사', 1),
    ('CERT_FACTORY', '부산', 2),
    ('CERT_FACTORY', '대구', 3)
) AS branch(organization_code, name, display_order)
  ON branch.organization_code = organization.code
ON CONFLICT (organization_id, name) DO UPDATE
SET display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

ALTER TABLE member
  ADD COLUMN IF NOT EXISTS organization_id INTEGER,
  ADD COLUMN IF NOT EXISTS branch_id INTEGER;

ALTER TABLE member_pre_registration
  ADD COLUMN IF NOT EXISTS organization_id INTEGER,
  ADD COLUMN IF NOT EXISTS branch_id INTEGER;

ALTER TABLE member
  ADD CONSTRAINT fk_member_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id),
  ADD CONSTRAINT fk_member_branch_id
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

ALTER TABLE member_pre_registration
  ADD CONSTRAINT fk_member_pre_registration_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id),
  ADD CONSTRAINT fk_member_pre_registration_branch_id
    FOREIGN KEY (branch_id)
    REFERENCES branches (id);

WITH member_targets AS (
  SELECT
    member.id AS member_id,
    organization.id AS organization_id,
    branch.id AS branch_id,
    branch.name AS branch_name
  FROM member
  JOIN member_positions position
    ON member.position_id = position.id
  JOIN organizations organization
    ON organization.name = CASE
      WHEN position.name IN ('대표', '개발팀장', '개발자') THEN '수험생연구소'
      ELSE '자격증공장'
    END
  JOIN branches branch
    ON branch.organization_id = organization.id
   AND branch.name = CASE
      WHEN member.name LIKE '부산%' THEN '부산'
      WHEN member.name LIKE '대구%' THEN '대구'
      WHEN member.branch IN ('부산', '대구', '본사') THEN member.branch
      ELSE '본사'
    END
)
UPDATE member
SET
  organization_id = member_targets.organization_id,
  branch_id = member_targets.branch_id
FROM member_targets
WHERE member.id = member_targets.member_id;

WITH pre_registration_targets AS (
  SELECT
    pre_registration.id AS pre_registration_id,
    organization.id AS organization_id,
    branch.id AS branch_id,
    branch.name AS branch_name
  FROM member_pre_registration pre_registration
  JOIN member_positions position
    ON pre_registration.position_id = position.id
  JOIN organizations organization
    ON organization.name = CASE
      WHEN position.name IN ('대표', '개발팀장', '개발자') THEN '수험생연구소'
      ELSE '자격증공장'
    END
  JOIN branches branch
    ON branch.organization_id = organization.id
   AND branch.name = CASE
      WHEN pre_registration.branch IN ('부산', '대구', '본사') THEN pre_registration.branch
      ELSE '본사'
    END
)
UPDATE member_pre_registration
SET
  organization_id = pre_registration_targets.organization_id,
  branch_id = pre_registration_targets.branch_id,
  branch = pre_registration_targets.branch_name
FROM pre_registration_targets
WHERE member_pre_registration.id = pre_registration_targets.pre_registration_id;

CREATE INDEX IF NOT EXISTS idx_member_organization_id
  ON member (organization_id);

CREATE INDEX IF NOT EXISTS idx_member_branch_id
  ON member (branch_id);

CREATE INDEX IF NOT EXISTS idx_member_pre_registration_organization_id
  ON member_pre_registration (organization_id);

CREATE INDEX IF NOT EXISTS idx_member_pre_registration_branch_id
  ON member_pre_registration (branch_id);

DROP INDEX IF EXISTS idx_member_branch;

ALTER TABLE member
  DROP COLUMN IF EXISTS branch;
