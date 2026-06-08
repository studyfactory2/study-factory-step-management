CREATE TABLE member_positions (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  code VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  subtitle VARCHAR,
  parent_id INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_login_visible BOOLEAN NOT NULL DEFAULT true,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_member_positions_parent_id
    FOREIGN KEY (parent_id)
    REFERENCES member_positions (id)
);

CREATE INDEX idx_member_positions_parent_id
  ON member_positions (parent_id);

CREATE INDEX idx_member_positions_display_order
  ON member_positions (display_order);
