-- Study Factory latest initial schema
-- WARNING: This script resets application tables/types. Run on a fresh database or after backup.

DROP TABLE IF EXISTS help_request_attachments CASCADE;
DROP TABLE IF EXISTS help_requests CASCADE;
DROP TABLE IF EXISTS task_comment_attachments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_read_statuses CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS favorite_members CASCADE;
DROP TABLE IF EXISTS refresh_token CASCADE;
DROP TABLE IF EXISTS member_pre_registration CASCADE;
DROP TABLE IF EXISTS member CASCADE;
DROP TABLE IF EXISTS position_duties CASCADE;
DROP TABLE IF EXISTS member_positions CASCADE;

DROP TYPE IF EXISTS member_pre_registration_position_enum CASCADE;
DROP TYPE IF EXISTS member_pre_registration_duty_enum CASCADE;
DROP TYPE IF EXISTS member_pre_registration_affiliation_enum CASCADE;
DROP TYPE IF EXISTS member_pre_registration_role_type_enum CASCADE;
DROP TYPE IF EXISTS member_position_enum CASCADE;
DROP TYPE IF EXISTS member_duty_enum CASCADE;
DROP TYPE IF EXISTS member_affiliation_enum CASCADE;
DROP TYPE IF EXISTS member_role_type_enum CASCADE;
DROP TYPE IF EXISTS task_status_enum CASCADE;

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

CREATE TYPE member_position_enum AS ENUM (
  'DEVELOPMENT_LEAD',
  'DEVELOPER',
  'STAFF',
  'EMPLOYEE',
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER'
);

CREATE TYPE member_duty_enum AS ENUM (
  'DEVELOPMENT',
  'BEVERAGE',
  'FOOD',
  'CLEANING',
  'GENERAL'
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

CREATE TYPE member_pre_registration_position_enum AS ENUM (
  'DEVELOPMENT_LEAD',
  'DEVELOPER',
  'STAFF',
  'EMPLOYEE',
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER'
);

CREATE TYPE member_pre_registration_duty_enum AS ENUM (
  'DEVELOPMENT',
  'BEVERAGE',
  'FOOD',
  'CLEANING',
  'GENERAL'
);

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

CREATE TABLE member_positions (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  subtitle VARCHAR,
  parent_id INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_login_visible BOOLEAN NOT NULL DEFAULT true,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_member_positions_parent_id
    FOREIGN KEY (parent_id)
    REFERENCES member_positions (id)
    ON DELETE SET NULL
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
  duty member_duty_enum,
  name VARCHAR,
  CONSTRAINT fk_position_duties_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id)
    ON DELETE CASCADE,
  CONSTRAINT uq_position_duties_position_duty
    UNIQUE (position_id, duty)
);

CREATE INDEX idx_position_duties_position_id
  ON position_duties (position_id);

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
  residence_city VARCHAR,
  residence_district VARCHAR,
  organization_id INTEGER,
  branch_id INTEGER,
  position_id INTEGER,
  position_duty_id INTEGER,
  role_type member_role_type_enum NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_member_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_member_position_duty_id
    FOREIGN KEY (position_duty_id)
    REFERENCES position_duties (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_member_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_member_branch_id
    FOREIGN KEY (branch_id)
    REFERENCES branches (id)
    ON DELETE SET NULL
);

CREATE INDEX idx_member_position_id
  ON member (position_id);

CREATE INDEX idx_member_organization_id
  ON member (organization_id);

CREATE INDEX idx_member_branch_id
  ON member (branch_id);

CREATE INDEX idx_member_role_type
  ON member (role_type);

CREATE TABLE member_pre_registration (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  age INTEGER,
  joined_at DATE,
  phone_number VARCHAR,
  duty_text VARCHAR,
  residence_city VARCHAR,
  residence_district VARCHAR,
  affiliation member_pre_registration_affiliation_enum,
  position member_pre_registration_position_enum,
  role_type member_pre_registration_role_type_enum NOT NULL,
  duty member_pre_registration_duty_enum,
  position_id INTEGER,
  position_duty_id INTEGER,
  branch VARCHAR,
  organization_id INTEGER,
  branch_id INTEGER,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT fk_member_pre_registration_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_member_pre_registration_position_duty_id
    FOREIGN KEY (position_duty_id)
    REFERENCES position_duties (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_member_pre_registration_organization_id
    FOREIGN KEY (organization_id)
    REFERENCES organizations (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_member_pre_registration_branch_id
    FOREIGN KEY (branch_id)
    REFERENCES branches (id)
    ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_member_pre_registration_unique_pending
  ON member_pre_registration (name, residence_city, residence_district, position_id, position_duty_id)
  WHERE is_registered = false;

CREATE INDEX idx_member_pre_registration_position_id
  ON member_pre_registration (position_id);

CREATE INDEX idx_member_pre_registration_organization_id
  ON member_pre_registration (organization_id);

CREATE INDEX idx_member_pre_registration_branch_id
  ON member_pre_registration (branch_id);

CREATE TABLE refresh_token (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  token VARCHAR NOT NULL UNIQUE,
  member_id INTEGER NOT NULL UNIQUE,
  CONSTRAINT fk_refresh_token_member_id
    FOREIGN KEY (member_id)
    REFERENCES member (id)
    ON DELETE CASCADE
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

CREATE INDEX idx_tasks_assignee_id
  ON tasks (assignee_id);

CREATE INDEX idx_tasks_created_by
  ON tasks (created_by);

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
  status task_status_enum NOT NULL,
  CONSTRAINT fk_task_comments_task_id
    FOREIGN KEY (task_id)
    REFERENCES tasks (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_task_comments_created_by
    FOREIGN KEY (created_by)
    REFERENCES member (id)
);

CREATE INDEX idx_task_comments_task_id
  ON task_comments (task_id);

CREATE INDEX idx_task_comments_created_by
  ON task_comments (created_by);

CREATE INDEX idx_task_comments_updated_at
  ON task_comments ("updatedAt");

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

CREATE INDEX idx_task_comment_attachments_task_comment_id
  ON task_comment_attachments (task_comment_id);

-- Default position tree and duties.
INSERT INTO member_positions (name, subtitle, parent_id, display_order, is_login_visible, is_admin, is_active)
VALUES
  ('대표', '최종 승인자', NULL, 1, true, true, true),
  ('관리자', '관리자', NULL, 2, false, true, true),
  ('개발팀장', '개발 관리', NULL, 3, true, false, true),
  ('개발자', '직원', NULL, 4, true, false, true),
  ('공장장', '관리/검토', NULL, 5, true, false, true),
  ('스텝', '직원', NULL, 6, true, false, true),
  ('직원', '직원', NULL, 7, true, false, true);

UPDATE member_positions child
SET parent_id = parent.id
FROM member_positions parent
WHERE
  (child.name = '개발팀장' AND parent.name = '대표') OR
  (child.name = '공장장' AND parent.name = '대표') OR
  (child.name = '개발자' AND parent.name = '개발팀장') OR
  (child.name IN ('스텝', '직원') AND parent.name = '공장장');

INSERT INTO position_duties (position_id, duty, name)
SELECT id, 'GENERAL'::member_duty_enum, '총괄' FROM member_positions WHERE name IN ('대표', '관리자', '공장장')
UNION ALL
SELECT id, 'DEVELOPMENT'::member_duty_enum, '개발' FROM member_positions WHERE name IN ('개발팀장', '개발자')
UNION ALL
SELECT id, 'BEVERAGE'::member_duty_enum, '음료' FROM member_positions WHERE name IN ('스텝', '직원')
UNION ALL
SELECT id, 'FOOD'::member_duty_enum, '음식' FROM member_positions WHERE name IN ('스텝', '직원')
UNION ALL
SELECT id, 'CLEANING'::member_duty_enum, '청소' FROM member_positions WHERE name IN ('스텝', '직원');

INSERT INTO organizations (name, code, display_order, is_active)
VALUES
  ('수험생연구소', 'EXAM_RESEARCH', 1, true),
  ('자격증공장', 'CERT_FACTORY', 2, true);

INSERT INTO branches (organization_id, name, display_order, is_active)
SELECT organization.id, branch.name, branch.display_order, true
FROM organizations organization
JOIN (
  VALUES
    ('EXAM_RESEARCH', '본사', 1),
    ('EXAM_RESEARCH', '부산', 2),
    ('EXAM_RESEARCH', '대구', 3),
    ('CERT_FACTORY', '본사', 1),
    ('CERT_FACTORY', '부산', 2),
    ('CERT_FACTORY', '대구', 3)
) AS branch(organization_code, name, display_order)
  ON branch.organization_code = organization.code;
