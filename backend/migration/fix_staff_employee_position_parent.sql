UPDATE member_positions employee
SET
  parent_id = manager.id,
  display_order = GREATEST(employee.display_order, staff.display_order + 1),
  "updatedAt" = now()
FROM member_positions manager
JOIN member_positions staff
  ON staff.name = '스텝'
WHERE employee.name = '직원'
  AND manager.name = '공장장'
  AND employee.parent_id = staff.id;
