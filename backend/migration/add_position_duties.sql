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

INSERT INTO position_duties (position_id, duty)
SELECT member_positions.id, duties.duty::member_duty_enum
FROM member_positions
JOIN (
  VALUES
    ('CEO', 'GENERAL'),
    ('ADMIN', 'GENERAL'),
    ('OPERATIONS_MANAGER', 'GENERAL'),
    ('DEVELOPMENT_LEAD', 'DEVELOPMENT'),
    ('DEVELOPER', 'DEVELOPMENT'),
    ('CONTENT_MANAGER', 'DEVELOPMENT'),
    ('STAFF', 'BEVERAGE'),
    ('STAFF', 'FOOD'),
    ('STAFF', 'CLEANING'),
    ('EMPLOYEE', 'BEVERAGE'),
    ('EMPLOYEE', 'FOOD'),
    ('EMPLOYEE', 'CLEANING')
) AS duties(code, duty)
  ON member_positions.code = duties.code
ON CONFLICT DO NOTHING;

UPDATE member_positions
SET is_login_visible = false
WHERE code = 'ADMIN';

ALTER TABLE member_positions
  DROP COLUMN IF EXISTS duty;

ALTER TABLE member
  DROP COLUMN position;
