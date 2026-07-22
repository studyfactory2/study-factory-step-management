BEGIN;

WITH core_members(name, organization_name, position_name, role_type) AS (
  VALUES
    ('김지원', '수험생연구소', '대표', 'CEO'),
    ('김태환', '수험생연구소', '개발자', 'EMPLOYEE'),
    ('최민지', '자격증공장', '직원', 'EMPLOYEE')
)
INSERT INTO member (
  name,
  display_name,
  password_hash,
  organization_id,
  branch_id,
  position_id,
  role_type,
  is_active
)
SELECT
  core_members.name,
  core_members.name,
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  organization.id,
  branch.id,
  position.id,
  core_members.role_type::member_role_type_enum,
  true
FROM core_members
JOIN organizations organization
  ON organization.name = core_members.organization_name
JOIN branches branch
  ON branch.organization_id = organization.id
 AND branch.name = '본사'
JOIN member_positions position
  ON position.name = core_members.position_name
WHERE NOT EXISTS (
  SELECT 1
  FROM member existing_member
  WHERE existing_member.name = core_members.name
);

COMMIT;
