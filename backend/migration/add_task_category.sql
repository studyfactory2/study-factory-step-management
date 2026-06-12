CREATE TYPE task_category_enum AS ENUM (
  'DEVELOPMENT',
  'OPERATION',
  'MEMBER',
  'ORDER'
);

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS category task_category_enum NOT NULL DEFAULT 'OPERATION';

CREATE INDEX IF NOT EXISTS idx_tasks_category_is_draft
  ON tasks (category, is_draft);
