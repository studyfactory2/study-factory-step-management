ALTER TABLE task_comments
ADD COLUMN IF NOT EXISTS status task_status_enum;

UPDATE task_comments comment
SET status = task.status
FROM tasks task
WHERE comment.task_id = task.id
  AND comment.status IS NULL;

ALTER TABLE task_comments
ALTER COLUMN status SET NOT NULL;
