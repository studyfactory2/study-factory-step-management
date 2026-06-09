CREATE TABLE IF NOT EXISTS help_requests (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  task_id INTEGER NOT NULL,
  requester_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  CONSTRAINT fk_help_requests_task_id
    FOREIGN KEY (task_id)
    REFERENCES tasks (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_help_requests_requester_id
    FOREIGN KEY (requester_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_help_requests_receiver_id
    FOREIGN KEY (receiver_id)
    REFERENCES member (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_help_requests_receiver_id
  ON help_requests (receiver_id);

CREATE INDEX IF NOT EXISTS idx_help_requests_task_id
  ON help_requests (task_id);
