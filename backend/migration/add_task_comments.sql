CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  task_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  content TEXT NOT NULL,
  one_line_comment VARCHAR,
  status task_status_enum NOT NULL DEFAULT 'REGISTERED',
  CONSTRAINT fk_task_comments_task_id
    FOREIGN KEY (task_id)
    REFERENCES tasks (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_task_comments_created_by
    FOREIGN KEY (created_by)
    REFERENCES member (id)
);

CREATE TABLE IF NOT EXISTS task_comment_attachments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  task_comment_id INTEGER NOT NULL,
  image_url VARCHAR NOT NULL,
  original_name VARCHAR,
  CONSTRAINT fk_task_comment_attachments_task_comment_id
    FOREIGN KEY (task_comment_id)
    REFERENCES task_comments (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id
  ON task_comments (task_id);

CREATE INDEX IF NOT EXISTS idx_task_comment_attachments_task_comment_id
  ON task_comment_attachments (task_comment_id);
