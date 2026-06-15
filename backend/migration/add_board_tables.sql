CREATE TYPE board_post_type_enum AS ENUM (
  'NOTICE',
  'EMPLOYEE'
);

CREATE TYPE board_visibility_enum AS ENUM (
  'ALL',
  'TEAM'
);

CREATE TABLE board_categories (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL UNIQUE,
  icon VARCHAR,
  color_class_name VARCHAR,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE board_posts (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  one_line_comment VARCHAR,
  post_type board_post_type_enum NOT NULL DEFAULT 'EMPLOYEE',
  visibility board_visibility_enum NOT NULL DEFAULT 'ALL',
  created_by INTEGER NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_board_posts_created_by
    FOREIGN KEY (created_by)
    REFERENCES member (id)
);

CREATE TABLE board_post_categories (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  post_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  CONSTRAINT fk_board_post_categories_post_id
    FOREIGN KEY (post_id)
    REFERENCES board_posts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_board_post_categories_category_id
    FOREIGN KEY (category_id)
    REFERENCES board_categories (id),
  CONSTRAINT uq_board_post_categories_post_category
    UNIQUE (post_id, category_id)
);

CREATE TABLE board_post_attachments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  post_id INTEGER NOT NULL,
  image_url VARCHAR NOT NULL,
  original_name VARCHAR,
  display_order INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT fk_board_post_attachments_post_id
    FOREIGN KEY (post_id)
    REFERENCES board_posts (id)
    ON DELETE CASCADE
);

CREATE TABLE board_comments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  post_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_board_comments_post_id
    FOREIGN KEY (post_id)
    REFERENCES board_posts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_board_comments_created_by
    FOREIGN KEY (created_by)
    REFERENCES member (id)
);

CREATE TABLE board_likes (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  post_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  CONSTRAINT fk_board_likes_post_id
    FOREIGN KEY (post_id)
    REFERENCES board_posts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_board_likes_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT uq_board_likes_post_member
    UNIQUE (post_id, member_id)
);

CREATE TABLE board_views (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  post_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  last_viewed_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_board_views_post_id
    FOREIGN KEY (post_id)
    REFERENCES board_posts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_board_views_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT uq_board_views_post_member
    UNIQUE (post_id, member_id)
);

CREATE INDEX idx_board_posts_type_active_created_at
  ON board_posts (post_type, is_active, "createdAt" DESC);

CREATE INDEX idx_board_posts_created_by
  ON board_posts (created_by);

CREATE INDEX idx_board_post_categories_category_id
  ON board_post_categories (category_id);

CREATE INDEX idx_board_post_attachments_post_id
  ON board_post_attachments (post_id);

CREATE INDEX idx_board_comments_post_id_created_at
  ON board_comments (post_id, "createdAt");

CREATE INDEX idx_board_likes_member_id
  ON board_likes (member_id);

CREATE INDEX idx_board_views_member_id
  ON board_views (member_id);

INSERT INTO board_categories (name, icon, color_class_name, display_order)
VALUES
  ('점심후기', '🍜', 'pink', 1),
  ('자유', '🌱', 'green', 2),
  ('꿀팁', '💡', 'yellow', 3),
  ('축하', '🎂', 'pink', 4),
  ('운동', '🏃', 'blue', 5),
  ('점심메이트', '🍱', 'orange', 6),
  ('동호회', '🎨', 'purple', 7),
  ('모임', '⛰️', 'green', 8);
