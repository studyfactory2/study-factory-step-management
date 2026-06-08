ALTER TABLE member
  ADD COLUMN position_id INTEGER;

UPDATE member
SET position_id = member_positions.id
FROM member_positions
WHERE member.position::text = member_positions.code;

ALTER TABLE member
  ADD CONSTRAINT fk_member_position_id
    FOREIGN KEY (position_id)
    REFERENCES member_positions (id);

CREATE INDEX idx_member_position_id
  ON member (position_id);
