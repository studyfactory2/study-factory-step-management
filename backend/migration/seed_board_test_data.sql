INSERT INTO board_categories (name, icon, color_class_name, display_order)
VALUES
  ('점심후기', '🍜', 'pink', 1),
  ('자유', '🌱', 'green', 2),
  ('꿀팁', '💡', 'yellow', 3),
  ('축하', '🎂', 'pink', 4),
  ('운동', '🏃', 'blue', 5),
  ('점심메이트', '🍱', 'orange', 6),
  ('동호회', '🎨', 'purple', 7),
  ('모임', '⛰️', 'green', 8)
ON CONFLICT (name) DO UPDATE
SET
  icon = EXCLUDED.icon,
  color_class_name = EXCLUDED.color_class_name,
  display_order = EXCLUDED.display_order,
  is_active = true,
  "updatedAt" = now();

DELETE FROM board_posts
WHERE title LIKE '[공지] 테스트 공지 %'
   OR title LIKE '[테스트 게시글 %';

WITH active_members AS (
  SELECT
    id,
    row_number() OVER (ORDER BY id) AS rn,
    count(*) OVER () AS member_count
  FROM member
  WHERE is_active = true
),
notice_source AS (
  SELECT
    series,
    CASE series
      WHEN 1 THEN '[공지] 테스트 공지 1 - 6월 사내 일정 안내'
      WHEN 2 THEN '[공지] 테스트 공지 2 - 게시판 이용 규칙 안내'
      WHEN 3 THEN '[공지] 테스트 공지 3 - 신규 복지 제도 안내'
      WHEN 4 THEN '[공지] 테스트 공지 4 - 보안 점검 일정 안내'
      ELSE '[공지] 테스트 공지 5 - 사무실 환경 개선 안내'
    END AS title,
    CASE series
      WHEN 1 THEN '6월 사내 주요 일정과 워크샵 준비 내용을 공유합니다.'
      WHEN 2 THEN '서로 기분 좋게 게시판을 사용할 수 있도록 기본 규칙을 확인해주세요.'
      WHEN 3 THEN '새롭게 적용되는 복지 제도와 신청 방법을 안내드립니다.'
      WHEN 4 THEN '계정 보안 점검 일정과 협조 사항을 안내드립니다.'
      ELSE '사무실 환경 개선 작업 일정과 이용 제한 구역을 안내드립니다.'
    END AS content,
    (series <= 2) AS is_pinned,
    now() - (series || ' hours')::interval AS created_at
  FROM generate_series(1, 5) AS series
)
INSERT INTO board_posts (
  title,
  content,
  one_line_comment,
  post_type,
  visibility,
  created_by,
  is_pinned,
  is_active,
  "createdAt",
  "updatedAt"
)
SELECT
  notice_source.title,
  notice_source.content,
  '중요한 내용은 꼭 확인해주세요.',
  'NOTICE',
  'ALL',
  active_members.id,
  notice_source.is_pinned,
  true,
  notice_source.created_at,
  notice_source.created_at
FROM notice_source
JOIN active_members
  ON active_members.rn = ((notice_source.series - 1) % active_members.member_count) + 1;

WITH active_members AS (
  SELECT
    id,
    row_number() OVER (ORDER BY id) AS rn,
    count(*) OVER () AS member_count
  FROM member
  WHERE is_active = true
),
post_source AS (
  SELECT
    series,
    CASE ((series - 1) % 10)
      WHEN 0 THEN '오늘 점심 같이 드실 분 구해요'
      WHEN 1 THEN '회사 근처 조용한 카페 추천합니다'
      WHEN 2 THEN '업무 집중할 때 쓰는 작은 팁 공유해요'
      WHEN 3 THEN '신규 입사자분 환영 인사 남겨주세요'
      WHEN 4 THEN '퇴근 후 가볍게 산책하실 분'
      WHEN 5 THEN '점심메이트 모집합니다'
      WHEN 6 THEN '사내 그림 동호회 첫 모임 안내'
      WHEN 7 THEN '주말 등산 모임 같이 가요'
      WHEN 8 THEN '요즘 자주 쓰는 단축키 정리했어요'
      ELSE '팀 회고 때 좋았던 방식 공유합니다'
    END AS title,
    CASE ((series - 1) % 10)
      WHEN 0 THEN '12시 20분쯤 1층에서 출발하려고 합니다. 매운 메뉴도 괜찮으신 분 댓글 주세요.'
      WHEN 1 THEN '회의 전후로 잠깐 쉬기 좋은 곳이라 공유합니다. 콘센트 자리도 넉넉했어요.'
      WHEN 2 THEN '작업 목록을 나눠서 확인하니 놓치는 일이 줄었습니다. 필요하신 분 참고해주세요.'
      WHEN 3 THEN '이번 주부터 함께 일하게 된 동료분들이 잘 적응하실 수 있게 따뜻한 말 남겨주세요.'
      WHEN 4 THEN '가볍게 걷고 들어오면 오후 집중력이 좋아져서 같이하실 분 찾습니다.'
      WHEN 5 THEN '혼자 먹기 아쉬운 날 함께할 분들을 모아보려고 합니다.'
      WHEN 6 THEN '처음이라 부담 없이 낙서하듯 진행하려고 합니다. 관심 있는 분 환영해요.'
      WHEN 7 THEN '초보도 갈 수 있는 코스로 잡았습니다. 물과 간식만 챙겨오시면 됩니다.'
      WHEN 8 THEN '반복 작업 줄이는 단축키를 정리했습니다. 더 좋은 팁 있으면 댓글로 알려주세요.'
      ELSE '짧게 좋았던 점과 다음 액션을 나누니 회고가 훨씬 가벼워졌습니다.'
    END AS content,
    CASE ((series - 1) % 10)
      WHEN 0 THEN '매운맛 좋아하는 분 들어와요!'
      WHEN 1 THEN '점심시간 조용한 곳 찾는 분께 추천'
      WHEN 2 THEN '작업 흐름 정리 팁입니다'
      WHEN 3 THEN '환영 댓글 남겨주세요'
      WHEN 4 THEN '가볍게 걷고 오실 분'
      WHEN 5 THEN '혼밥 대신 같이 먹어요'
      WHEN 6 THEN '그림 좋아하는 분 누구나 환영'
      WHEN 7 THEN '초보도 환영하는 가벼운 코스'
      WHEN 8 THEN '업무 시간 아끼는 꿀팁'
      ELSE '회고가 편해지는 방법'
    END AS one_line_comment,
    now() - (series || ' hours')::interval AS created_at
  FROM generate_series(1, 30) AS series
)
INSERT INTO board_posts (
  title,
  content,
  one_line_comment,
  post_type,
  visibility,
  created_by,
  is_pinned,
  is_active,
  "createdAt",
  "updatedAt"
)
SELECT
  '[테스트 게시글 ' || post_source.series || '] ' || post_source.title,
  post_source.content,
  post_source.one_line_comment,
  'EMPLOYEE',
  (CASE WHEN post_source.series % 6 = 0 THEN 'TEAM' ELSE 'ALL' END)::board_visibility_enum,
  active_members.id,
  false,
  true,
  post_source.created_at,
  post_source.created_at
FROM post_source
JOIN active_members
  ON active_members.rn = ((post_source.series - 1) % active_members.member_count) + 1;

WITH category_order AS (
  SELECT
    id,
    row_number() OVER (ORDER BY display_order, id) AS rn,
    count(*) OVER () AS category_count
  FROM board_categories
  WHERE is_active = true
),
seed_posts AS (
  SELECT
    id,
    row_number() OVER (ORDER BY "createdAt" DESC) AS rn
  FROM board_posts
  WHERE title LIKE '[테스트 게시글 %'
)
INSERT INTO board_post_categories (post_id, category_id)
SELECT
  seed_posts.id,
  category_order.id
FROM seed_posts
JOIN category_order
  ON category_order.rn = ((seed_posts.rn - 1) % category_order.category_count) + 1
ON CONFLICT (post_id, category_id) DO NOTHING;

WITH active_members AS (
  SELECT
    id,
    row_number() OVER (ORDER BY id) AS rn
  FROM member
  WHERE is_active = true
),
seed_posts AS (
  SELECT
    id,
    row_number() OVER (ORDER BY "createdAt" DESC) AS rn
  FROM board_posts
  WHERE title LIKE '[테스트 게시글 %'
)
INSERT INTO board_comments (post_id, created_by, content, is_active, "createdAt", "updatedAt")
SELECT
  seed_posts.id,
  active_members.id,
  '좋은 공유 감사합니다. 저도 참고해서 활용해볼게요.',
  true,
  now() - ((seed_posts.rn + active_members.rn) || ' minutes')::interval,
  now() - ((seed_posts.rn + active_members.rn) || ' minutes')::interval
FROM seed_posts
JOIN active_members
  ON active_members.rn <= ((seed_posts.rn % 4) + 1);

WITH active_members AS (
  SELECT
    id,
    row_number() OVER (ORDER BY id) AS rn
  FROM member
  WHERE is_active = true
),
seed_posts AS (
  SELECT
    id,
    row_number() OVER (ORDER BY "createdAt" DESC) AS rn
  FROM board_posts
  WHERE title LIKE '[테스트 게시글 %'
)
INSERT INTO board_likes (post_id, member_id)
SELECT
  seed_posts.id,
  active_members.id
FROM seed_posts
JOIN active_members
  ON active_members.rn <= ((seed_posts.rn % 8) + 3)
ON CONFLICT (post_id, member_id) DO NOTHING;

WITH active_members AS (
  SELECT
    id,
    row_number() OVER (ORDER BY id) AS rn
  FROM member
  WHERE is_active = true
),
seed_posts AS (
  SELECT
    id,
    row_number() OVER (ORDER BY "createdAt" DESC) AS rn
  FROM board_posts
  WHERE title LIKE '[테스트 게시글 %'
)
INSERT INTO board_views (post_id, member_id, last_viewed_at)
SELECT
  seed_posts.id,
  active_members.id,
  now() - ((seed_posts.rn + active_members.rn) || ' minutes')::interval
FROM seed_posts
JOIN active_members
  ON active_members.rn <= ((seed_posts.rn % 12) + 8)
ON CONFLICT (post_id, member_id) DO UPDATE
SET
  last_viewed_at = EXCLUDED.last_viewed_at,
  "updatedAt" = now();
