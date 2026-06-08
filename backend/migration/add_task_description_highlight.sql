ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS description_highlight_start INTEGER,
ADD COLUMN IF NOT EXISTS description_highlight_end INTEGER,
ADD COLUMN IF NOT EXISTS description_highlight_expires_at TIMESTAMP;
