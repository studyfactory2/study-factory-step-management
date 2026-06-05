CREATE TYPE member_role_type_enum AS ENUM (
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER',
  'FACTORY_MANAGER',
  'DEVELOPMENT_LEAD',
  'DESIGNER',
  'MARKETER',
  'DEVELOPER',
  'CONTENT_MANAGER',
  'EMPLOYEE',
  'STAFF'
);

CREATE TABLE member (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  avatar_url VARCHAR,
  branch VARCHAR,
  role_type member_role_type_enum NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX idx_member_name_role_type_password_hash
  ON member (name, role_type, password_hash);

CREATE TABLE member_pre_registration (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  role_type member_role_type_enum NOT NULL,
  branch VARCHAR NOT NULL,
  is_registered BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX idx_member_pre_registration_name_role_type_branch
  ON member_pre_registration (name, role_type, branch);

CREATE TABLE refresh_token (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  token VARCHAR NOT NULL UNIQUE,
  member_id INTEGER NOT NULL UNIQUE,
  CONSTRAINT fk_refresh_token_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
);

CREATE TYPE task_status_enum AS ENUM (
  'REGISTERED',
  'IN_PROGRESS',
  'REVIEW_REQUESTED',
  'COMPLETED'
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  status task_status_enum NOT NULL,
  assignee_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  due_at TIMESTAMP,
  completed_at TIMESTAMP,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT fk_tasks_assignee_id
    FOREIGN KEY (assignee_id)
    REFERENCES member (id),
  CONSTRAINT fk_tasks_created_by
    FOREIGN KEY (created_by)
    REFERENCES member (id)
);

CREATE INDEX idx_tasks_status_is_draft
  ON tasks (status, is_draft);

CREATE INDEX idx_tasks_completed_at
  ON tasks (completed_at);

CREATE TABLE task_attachments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  task_id INTEGER NOT NULL,
  image_url VARCHAR NOT NULL,
  original_name VARCHAR,
  CONSTRAINT fk_task_attachments_task_id
    FOREIGN KEY (task_id)
    REFERENCES tasks (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_task_attachments_task_id
  ON task_attachments (task_id);
