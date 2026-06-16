WITH ranked_members AS (
  SELECT
    id,
    name,
    ROW_NUMBER() OVER (
      PARTITION BY organization_id, name
      ORDER BY "createdAt", id
    ) AS name_order
  FROM member
)
UPDATE member
SET display_name = CASE
  WHEN ranked_members.name_order = 1 THEN ranked_members.name
  ELSE ranked_members.name || ranked_members.name_order::text
END
FROM ranked_members
WHERE member.id = ranked_members.id;
