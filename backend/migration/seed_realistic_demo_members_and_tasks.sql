BEGIN;

WITH demo_members(name, organization_name, position_name, duty_name, role_type) AS (
  VALUES
    ('이서준', '수험생연구소', '개발팀장', '개발', 'EMPLOYEE'),
    ('박서연', '수험생연구소', '개발자', '개발', 'EMPLOYEE'),
    ('강민재', '수험생연구소', '개발자', '개발', 'EMPLOYEE'),
    ('정우진', '자격증공장', '공장장', '총괄', 'EMPLOYEE'),
    ('한지민', '자격증공장', '스텝', '음료', 'EMPLOYEE'),
    ('윤도현', '자격증공장', '직원', '음식', 'EMPLOYEE'),
    ('오수빈', '자격증공장', '직원', '청소', 'EMPLOYEE')
)
INSERT INTO member (
  name,
  display_name,
  password_hash,
  organization_id,
  branch_id,
  position_id,
  position_duty_id,
  role_type,
  is_active
)
SELECT
  demo_members.name,
  demo_members.name,
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  organization.id,
  branch.id,
  position.id,
  position_duty.id,
  demo_members.role_type::member_role_type_enum,
  true
FROM demo_members
JOIN organizations organization
  ON organization.name = demo_members.organization_name
JOIN branches branch
  ON branch.organization_id = organization.id
 AND branch.name = '본사'
JOIN member_positions position
  ON position.name = demo_members.position_name
LEFT JOIN position_duties position_duty
  ON position_duty.position_id = position.id
 AND position_duty.name = demo_members.duty_name
WHERE NOT EXISTS (
  SELECT 1
  FROM member existing_member
  WHERE existing_member.name = demo_members.name
);

WITH task_seed(
  title,
  description,
  category,
  one_line_comment,
  status,
  assignee_name,
  days_ago
) AS (
  VALUES
    ('[샘플] 회원가입 오류 로그 분석', '최근 접수된 회원가입 오류 로그를 확인하고 재현 조건을 정리해주세요.', 'DEVELOPMENT', '오류 발생 조건을 우선 확인 중입니다.', 'IN_PROGRESS', '김태환', 1),
    ('[샘플] 모바일 로그인 화면 최종 점검', '모바일 화면에서 입력창과 버튼의 간격, 접근성 항목을 최종 점검해주세요.', 'DEVELOPMENT', '검토 가능한 시안을 공유했습니다.', 'REVIEW_REQUESTED', '박서연', 2),
    ('[샘플] 이번 주 서버 백업 확인', '정기 백업 파일 생성 여부와 복구 가능 여부를 확인해주세요.', 'DEVELOPMENT', '백업 점검을 시작해주세요.', 'REGISTERED', '강민재', 0),
    ('[샘플] 신규 직원 온보딩 체크리스트', '신규 직원이 첫 주에 확인해야 할 항목을 체크리스트로 정리해주세요.', 'MEMBER', '온보딩 문서 정리를 완료했습니다.', 'COMPLETED', '이서준', 6),
    ('[샘플] 본사 운영 일정 정리', '이번 주 본사 운영 일정과 담당자별 준비 항목을 정리해주세요.', 'OPERATION', '담당자 일정을 취합하고 있습니다.', 'IN_PROGRESS', '정우진', 2),
    ('[샘플] 사무용품 재고 조사', '복사용지와 필기구 등 공용 사무용품의 현재 재고를 조사해주세요.', 'ORDER', '부족한 품목을 함께 표시해주세요.', 'REGISTERED', '한지민', 1),
    ('[샘플] 고객 문의 답변 템플릿', '반복적으로 접수되는 고객 문의 유형과 답변 템플릿을 작성해주세요.', 'MEMBER', '답변 문구 검토를 요청드립니다.', 'REVIEW_REQUESTED', '윤도현', 3),
    ('[샘플] 월간 주문 누락 내역 검수', '이번 달 주문 목록과 출고 목록을 비교해 누락 건을 확인해주세요.', 'ORDER', '누락 내역 검수를 완료했습니다.', 'COMPLETED', '오수빈', 8),
    ('[샘플] 공장 내부 청소 일정 조정', '공용 공간별 청소 시간과 담당자를 새 일정에 맞게 조정해주세요.', 'OPERATION', '변경 가능한 시간을 확인하고 있습니다.', 'IN_PROGRESS', '최민지', 1),
    ('[샘플] 결제 내역 대조', '주문서와 결제 완료 내역을 대조하고 불일치 항목을 표시해주세요.', 'ORDER', '오전 주문부터 순서대로 확인해주세요.', 'REGISTERED', '윤도현', 0),
    ('[샘플] 계정 권한 정책 점검', '직위별 접근 가능 메뉴가 현재 권한 정책과 일치하는지 점검해주세요.', 'DEVELOPMENT', '권한 정책 점검을 완료했습니다.', 'COMPLETED', '박서연', 5),
    ('[샘플] 신규 회원 현황 정리', '이번 주 신규 회원 수와 문의 유형을 분류해 간단히 요약해주세요.', 'MEMBER', '분류 결과 검토를 요청드립니다.', 'REVIEW_REQUESTED', '한지민', 2)
)
INSERT INTO tasks (
  title,
  description,
  category,
  one_line_comment,
  status,
  assignee_id,
  created_by,
  completed_at,
  review_requested_at,
  is_draft,
  "createdAt",
  "updatedAt"
)
SELECT
  task_seed.title,
  task_seed.description,
  task_seed.category::task_category_enum,
  task_seed.one_line_comment,
  task_seed.status::task_status_enum,
  assignee.id,
  creator.id,
  CASE
    WHEN task_seed.status = 'COMPLETED' THEN now() - (task_seed.days_ago || ' days')::interval - interval '30 minutes'
    ELSE NULL
  END,
  CASE
    WHEN task_seed.status = 'REVIEW_REQUESTED' THEN now() - (task_seed.days_ago || ' days')::interval - interval '30 minutes'
    ELSE NULL
  END,
  false,
  now() - (task_seed.days_ago || ' days')::interval - interval '6 hours',
  now() - (task_seed.days_ago || ' days')::interval - interval '1 hour'
FROM task_seed
JOIN member assignee
  ON assignee.name = task_seed.assignee_name
JOIN member creator
  ON creator.name = '김지원'
WHERE NOT EXISTS (
  SELECT 1
  FROM tasks existing_task
  WHERE existing_task.title = task_seed.title
);

WITH task_times(title, days_ago) AS (
  VALUES
    ('[샘플] 회원가입 오류 로그 분석', 1),
    ('[샘플] 모바일 로그인 화면 최종 점검', 2),
    ('[샘플] 이번 주 서버 백업 확인', 0),
    ('[샘플] 신규 직원 온보딩 체크리스트', 6),
    ('[샘플] 본사 운영 일정 정리', 2),
    ('[샘플] 사무용품 재고 조사', 1),
    ('[샘플] 고객 문의 답변 템플릿', 3),
    ('[샘플] 월간 주문 누락 내역 검수', 8),
    ('[샘플] 공장 내부 청소 일정 조정', 1),
    ('[샘플] 결제 내역 대조', 0),
    ('[샘플] 계정 권한 정책 점검', 5),
    ('[샘플] 신규 회원 현황 정리', 2)
)
UPDATE tasks task
SET
  "createdAt" = now() - (task_times.days_ago || ' days')::interval - interval '6 hours',
  "updatedAt" = now() - (task_times.days_ago || ' days')::interval - interval '1 hour',
  completed_at = CASE
    WHEN task.status = 'COMPLETED' THEN now() - (task_times.days_ago || ' days')::interval - interval '30 minutes'
    ELSE NULL
  END,
  review_requested_at = CASE
    WHEN task.status = 'REVIEW_REQUESTED' THEN now() - (task_times.days_ago || ' days')::interval - interval '30 minutes'
    ELSE NULL
  END
FROM task_times
WHERE task.title = task_times.title;

COMMIT;
