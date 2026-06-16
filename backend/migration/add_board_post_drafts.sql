CREATE TABLE IF NOT EXISTS board_post_drafts (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  title VARCHAR NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  one_line_comment VARCHAR,
  post_type board_post_type_enum NOT NULL DEFAULT 'EMPLOYEE',
  visibility board_visibility_enum NOT NULL DEFAULT 'ALL',
  created_by INTEGER NOT NULL REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS board_post_draft_categories (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  draft_id INTEGER NOT NULL REFERENCES board_post_drafts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES board_categories(id)
);

CREATE TABLE IF NOT EXISTS board_post_draft_attachments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  draft_id INTEGER NOT NULL REFERENCES board_post_drafts(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  original_name VARCHAR,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_board_post_drafts_created_by_updated_at
  ON board_post_drafts (created_by, "updatedAt" DESC);

CREATE INDEX IF NOT EXISTS idx_board_post_draft_categories_draft_id
  ON board_post_draft_categories (draft_id);

CREATE INDEX IF NOT EXISTS idx_board_post_draft_attachments_draft_id
  ON board_post_draft_attachments (draft_id);
