UPDATE position_duties
SET name = CASE duty
  WHEN 'GENERAL' THEN '총괄'
  WHEN 'DEVELOPMENT' THEN '개발'
  WHEN 'BEVERAGE' THEN '음료'
  WHEN 'FOOD' THEN '음식'
  WHEN 'CLEANING' THEN '청소'
  ELSE name
END
WHERE duty IS NOT NULL
  AND (name IS NULL OR name = duty::text);
