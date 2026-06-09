CREATE TABLE IF NOT EXISTS help_request_attachments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  help_request_id INTEGER NOT NULL,
  image_url VARCHAR NOT NULL,
  original_name VARCHAR,
  CONSTRAINT fk_help_request_attachments_help_request_id
    FOREIGN KEY (help_request_id)
    REFERENCES help_requests (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_help_request_attachments_help_request_id
  ON help_request_attachments (help_request_id);
