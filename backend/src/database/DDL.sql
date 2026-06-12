CREATE TYPE member_role_type_enum AS ENUM (
  'CEO',
  'ADMIN',
  'EMPLOYEE'
);

CREATE TYPE member_affiliation_enum AS ENUM (
  'DEVELOPMENT_TEAM',
  'STAFF',
  'ADMIN',
  'CEO'
);

CREATE TYPE member_duty_enum AS ENUM (
  'DEVELOPMENT',
  'BEVERAGE',
  'FOOD',
  'CLEANING',
  'GENERAL'
);

CREATE TYPE member_position_enum AS ENUM (
  'DEVELOPMENT_LEAD',
  'DEVELOPER',
  'STAFF',
  'EMPLOYEE',
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER'
);

CREATE TYPE member_pre_registration_role_type_enum AS ENUM (
  'CEO',
  'ADMIN',
  'EMPLOYEE'
);

CREATE TYPE member_pre_registration_affiliation_enum AS ENUM (
  'DEVELOPMENT_TEAM',
  'STAFF',
  'ADMIN',
  'CEO'
);

CREATE TYPE member_pre_registration_duty_enum AS ENUM (
  'DEVELOPMENT',
  'BEVERAGE',
  'FOOD',
  'CLEANING',
  'GENERAL'
);

CREATE TYPE member_pre_registration_position_enum AS ENUM (
  'DEVELOPMENT_LEAD',
  'DEVELOPER',
  'STAFF',
  'EMPLOYEE',
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER'
);

CREATE TABLE member_positions (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  subtitle VARCHAR,
  duty member_duty_enum,
  parent_id INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_login_visible BOOLEAN NOT NULL DEFAULT true,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_member_positions_parent_id
    FOREIGN KEY (parent_id)
    REFERENCES member_positions (id)
);

CREATE INDEX idx_member_positions_parent_id
  ON member_positions (parent_id);

CREATE INDEX idx_member_positions_display_order
  ON member_positions (display_order);

CREATE TABLE position_duties (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  position_id INTEGER NOT NULL,
  duty member_duty_enum NOT NULL,
  CONSTRAINT fk_position_duties_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_position_duties_position_id_duty
  ON position_duties (position_id, duty);

CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL UNIQUE,
  code VARCHAR NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  organization_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_branches_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id),
  CONSTRAINT uq_branches_organization_name
    UNIQUE (organization_id, name)
);

CREATE TABLE member (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  display_name VARCHAR,
  password_hash VARCHAR NOT NULL,
  avatar_url VARCHAR,
  age INTEGER,
  joined_at DATE,
  phone_number VARCHAR,
  duty_text VARCHAR,
  organization_id INTEGER,
  branch_id INTEGER,
  position_id INTEGER,
  position_duty_id INTEGER,
  role_type member_role_type_enum NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_member_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id),
  CONSTRAINT fk_member_branch_id
    FOREIGN KEY (branch_id)
    REFERENCES branches (id),
  CONSTRAINT fk_member_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id),
  CONSTRAINT fk_member_position_duty_id
    FOREIGN KEY (position_duty_id)
    REFERENCES position_duties (id)
);

CREATE INDEX idx_member_position_id
  ON member (position_id);

CREATE INDEX idx_member_organization_id
  ON member (organization_id);

CREATE INDEX idx_member_branch_id
  ON member (branch_id);

CREATE INDEX idx_member_position_duty_id
  ON member (position_duty_id);

CREATE UNIQUE INDEX idx_member_name_role_type_password_hash
  ON member (name, role_type, password_hash);

CREATE TABLE member_pre_registration (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  affiliation member_pre_registration_affiliation_enum,
  position member_pre_registration_position_enum,
  role_type member_pre_registration_role_type_enum NOT NULL,
  duty member_pre_registration_duty_enum,
  age INTEGER,
  joined_at DATE,
  phone_number VARCHAR,
  duty_text VARCHAR,
  branch VARCHAR,
  position_id INTEGER,
  position_duty_id INTEGER,
  organization_id INTEGER,
  branch_id INTEGER,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT fk_member_pre_registration_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id),
  CONSTRAINT fk_member_pre_registration_position_duty_id
    FOREIGN KEY (position_duty_id)
    REFERENCES position_duties (id),
  CONSTRAINT fk_member_pre_registration_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id),
  CONSTRAINT fk_member_pre_registration_branch_id
    FOREIGN KEY (branch_id)
    REFERENCES branches (id)
);

CREATE INDEX idx_member_pre_registration_organization_id
  ON member_pre_registration (organization_id);

CREATE INDEX idx_member_pre_registration_branch_id
  ON member_pre_registration (branch_id);

CREATE UNIQUE INDEX idx_member_pre_registration_name_branch_affiliation_position_duty
  ON member_pre_registration (name, branch, affiliation, position, duty);

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

CREATE TABLE favorite_members (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  owner_member_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT fk_favorite_members_owner_member_id
    FOREIGN KEY (owner_member_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorite_members_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
    ON DELETE CASCADE,
  CONSTRAINT uq_favorite_member_owner_member
    UNIQUE (owner_member_id, member_id)
);

CREATE INDEX idx_favorite_members_owner_member_id
  ON favorite_members (owner_member_id);

CREATE INDEX idx_favorite_members_display_order
  ON favorite_members (display_order);

CREATE TYPE task_status_enum AS ENUM (
  'REGISTERED',
  'IN_PROGRESS',
  'REVIEW_REQUESTED',
  'COMPLETED'
);

CREATE TYPE task_category_enum AS ENUM (
  'DEVELOPMENT',
  'OPERATION',
  'MEMBER',
  'ORDER'
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category task_category_enum NOT NULL DEFAULT 'OPERATION',
  one_line_comment VARCHAR,
  description_highlight_start INTEGER,
  description_highlight_end INTEGER,
  description_highlight_expires_at TIMESTAMP,
  status task_status_enum NOT NULL,
  assignee_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  completed_at TIMESTAMP,
  review_requested_at TIMESTAMP,
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

CREATE INDEX idx_tasks_category_is_draft
  ON tasks (category, is_draft);

CREATE INDEX idx_tasks_completed_at
  ON tasks (completed_at);

CREATE INDEX idx_tasks_review_requested_at
  ON tasks (review_requested_at);

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

CREATE TABLE task_read_statuses (
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

CREATE INDEX idx_task_read_statuses_member_id
  ON task_read_statuses (member_id);

CREATE TABLE task_comments (
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

CREATE TABLE task_comment_attachments (
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

CREATE INDEX idx_task_comments_task_id
  ON task_comments (task_id);

CREATE INDEX idx_task_comment_attachments_task_comment_id
  ON task_comment_attachments (task_comment_id);
