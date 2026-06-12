CREATE TABLE IF NOT EXISTS organization_charts (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_chart_nodes (
  id SERIAL PRIMARY KEY,
  chart_id INTEGER NOT NULL,
  parent_id INTEGER,
  floor INTEGER NOT NULL,
  slot_key VARCHAR NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  organization_id INTEGER,
  position_id INTEGER,
  member_id INTEGER,
  image_url VARCHAR,
  display_name VARCHAR,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT fk_organization_chart_nodes_chart_id
    FOREIGN KEY (chart_id)
    REFERENCES organization_charts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_organization_chart_nodes_parent_id
    FOREIGN KEY (parent_id)
    REFERENCES organization_chart_nodes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_organization_chart_nodes_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id),
  CONSTRAINT fk_organization_chart_nodes_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id),
  CONSTRAINT fk_organization_chart_nodes_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_charts_active
  ON organization_charts (is_active)
  WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_chart_nodes_chart_slot
  ON organization_chart_nodes (chart_id, slot_key);

CREATE INDEX IF NOT EXISTS idx_organization_chart_nodes_chart_id
  ON organization_chart_nodes (chart_id);

CREATE INDEX IF NOT EXISTS idx_organization_chart_nodes_parent_id
  ON organization_chart_nodes (parent_id);

INSERT INTO organization_charts (name, is_active)
SELECT '기본 조직도', true
WHERE NOT EXISTS (SELECT 1 FROM organization_charts WHERE is_active = true);

WITH RECURSIVE active_chart AS (
  SELECT id
  FROM organization_charts
  WHERE is_active = true
  ORDER BY id
  LIMIT 1
),
position_tree AS (
  SELECT
    member_positions.id,
    member_positions.parent_id,
    member_positions.display_order,
    member_positions.id::text AS slot_key,
    3 AS floor
  FROM member_positions
  WHERE member_positions.parent_id IS NULL
    AND member_positions.is_active = true
    AND member_positions.is_login_visible = true
  UNION ALL
  SELECT
    child.id,
    child.parent_id,
    child.display_order,
    CONCAT(position_tree.slot_key, '-', child.id) AS slot_key,
    GREATEST(position_tree.floor - 1, 1) AS floor
  FROM member_positions child
  JOIN position_tree ON position_tree.id = child.parent_id
  WHERE child.is_active = true
    AND child.is_login_visible = true
)
INSERT INTO organization_chart_nodes (
  chart_id,
  floor,
  slot_key,
  display_order,
  is_enabled,
  position_id,
  display_name
)
SELECT
  active_chart.id,
  position_tree.floor,
  position_tree.slot_key,
  position_tree.display_order,
  true,
  position_tree.id,
  member_positions.name
FROM active_chart
JOIN position_tree ON true
JOIN member_positions ON member_positions.id = position_tree.id
WHERE NOT EXISTS (
  SELECT 1
  FROM organization_chart_nodes existing_node
  WHERE existing_node.chart_id = active_chart.id
    AND existing_node.position_id = position_tree.id
);

WITH active_chart AS (
  SELECT id
  FROM organization_charts
  WHERE is_active = true
  ORDER BY id
  LIMIT 1
)
UPDATE organization_chart_nodes child_node
SET parent_id = parent_node.id
FROM organization_chart_nodes parent_node,
     member_positions child_position,
     active_chart
WHERE child_node.chart_id = active_chart.id
  AND parent_node.chart_id = active_chart.id
  AND child_node.position_id = child_position.id
  AND parent_node.position_id = child_position.parent_id
  AND child_node.parent_id IS NULL;
