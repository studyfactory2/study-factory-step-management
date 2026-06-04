CREATE TYPE member_role_type_enum AS ENUM (
  'CEO',
  'ADMIN',
  'OPERATIONS_MANAGER',
  'DEVELOPMENT_LEAD',
  'DESIGNER',
  'MARKETER',
  'DEVELOPER',
  'CONTENT_MANAGER',
  'STAFF'
);

CREATE TABLE member (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  avatar_url VARCHAR,
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
  is_registered BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX idx_member_pre_registration_name_role_type
  ON member_pre_registration (name, role_type);

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
