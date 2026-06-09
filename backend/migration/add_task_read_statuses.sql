CREATE TABLE IF NOT EXISTS task_read_statuses (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  task_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  last_viewed_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_task_read_statuses_task_id
    FOREIGN KEY (task_id)
    REFERENCES tasks (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_task_read_statuses_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT uq_task_read_statuses_task_member
    UNIQUE (task_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_task_read_statuses_member_id
  ON task_read_statuses (member_id);
