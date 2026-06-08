CREATE TABLE IF NOT EXISTS favorite_members (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  owner_member_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT fk_favorite_members_owner_member_id
    FOREIGN KEY (owner_member_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorite_members_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT uq_favorite_member_owner_member
    UNIQUE (owner_member_id, member_id)
);

INSERT INTO favorite_members (owner_member_id, member_id, display_order)
SELECT owner_member.id, favorite_member.id, favorite_members_to_seed.display_order
FROM member AS owner_member
JOIN (
  VALUES
    ('이서준', 1),
    ('김태환', 2),
    ('김도현', 3)
) AS favorite_members_to_seed(name, display_order)
  ON true
JOIN member AS favorite_member
  ON favorite_member.name = favorite_members_to_seed.name
WHERE owner_member.name = '김지원'
  AND owner_member.role_type IN ('CEO', 'ADMIN')
ON CONFLICT (owner_member_id, member_id) DO UPDATE SET
  display_order = EXCLUDED.display_order;

DO $$
BEGIN
  IF to_regclass('public.admin_favorite_members') IS NOT NULL THEN
    INSERT INTO favorite_members (owner_member_id, member_id, display_order)
    SELECT admin_favorite_members.admin_id, admin_favorite_members.member_id, admin_favorite_members.display_order
    FROM admin_favorite_members
    ON CONFLICT (owner_member_id, member_id) DO NOTHING;
  END IF;
END $$;

DROP TABLE IF EXISTS admin_favorite_members;

CREATE INDEX IF NOT EXISTS idx_favorite_members_owner_member_id
  ON favorite_members (owner_member_id);

CREATE INDEX IF NOT EXISTS idx_favorite_members_display_order
  ON favorite_members (display_order);
