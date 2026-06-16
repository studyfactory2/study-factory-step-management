CREATE TYPE notification_type_enum AS ENUM (
  'TASK_ASSIGNED',
  'TASK_COMMENTED'
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  recipient_id INTEGER NOT NULL,
  actor_id INTEGER NOT NULL,
  task_id INTEGER NOT NULL,
  type notification_type_enum NOT NULL,
  comment_preview VARCHAR,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  CONSTRAINT fk_notifications_recipient_id
    FOREIGN KEY (recipient_id)
    REFERENCES member (id),
  CONSTRAINT fk_notifications_actor_id
    FOREIGN KEY (actor_id)
    REFERENCES member (id),
  CONSTRAINT fk_notifications_task_id
    FOREIGN KEY (task_id)
    REFERENCES tasks (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_notifications_recipient_id
  ON notifications (recipient_id);

CREATE INDEX idx_notifications_recipient_unread
  ON notifications (recipient_id, is_read);

CREATE INDEX idx_notifications_task_id
  ON notifications (task_id);
