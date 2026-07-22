BEGIN;

WITH notice_seed(title, content, one_line_comment, hours_ago, is_pinned) AS (
  VALUES
    (
      '7월 사내 워크숍 일정 안내',
      '7월 25일 금요일 오후 2시부터 본사 세미나실에서 사내 워크숍을 진행합니다. 상반기 업무를 돌아보고 하반기 목표를 함께 정리할 예정입니다. 참석이 어려운 분은 7월 22일까지 팀장에게 알려주세요.',
      '일정과 준비 사항을 확인해주세요.',
      30,
      true
    ),
    (
      '여름철 유연근무 운영 안내',
      '무더운 여름철 출퇴근 편의를 위해 7월 20일부터 8월 31일까지 유연근무제를 운영합니다. 오전 8시부터 10시 사이에 출근하고 8시간 근무 후 퇴근할 수 있습니다.',
      '7월 20일부터 유연근무제가 시작됩니다.',
      54,
      true
    ),
    (
      '공용 장비 정기 점검 안내',
      '이번 주 목요일 오후 6시부터 공용 프린터와 회의실 장비 정기 점검을 진행합니다. 점검 시간에는 일부 장비 사용이 제한될 수 있으니 필요한 출력물은 미리 준비해주세요.',
      '목요일 오후 6시부터 공용 장비를 점검합니다.',
      78,
      false
    )
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
  notice_seed.title,
  notice_seed.content,
  notice_seed.one_line_comment,
  'NOTICE'::board_post_type_enum,
  'ALL'::board_visibility_enum,
  author.id,
  notice_seed.is_pinned,
  true,
  now() - (notice_seed.hours_ago || ' hours')::interval,
  now() - (notice_seed.hours_ago || ' hours')::interval
FROM notice_seed
JOIN member author ON author.name = '김지원'
WHERE NOT EXISTS (
  SELECT 1 FROM board_posts existing_post WHERE existing_post.title = notice_seed.title
);

WITH employee_seed(
  title,
  content,
  one_line_comment,
  author_name,
  category_name,
  hours_ago
) AS (
  VALUES
    (
      '오늘 점심 국수집 같이 가실 분',
      '오늘 12시 20분쯤 회사 근처 새로 생긴 국수집에 가보려고 합니다. 메뉴는 잔치국수와 비빔국수가 있고 대기 시간이 길지 않다고 해요. 같이 가실 분은 댓글 남겨주세요!',
      '12시 20분에 1층에서 만나요.',
      '한지민',
      '점심메이트',
      2
    ),
    (
      '업무 집중에 도움 된 작은 습관 공유해요',
      '오전에는 메신저 알림을 잠시 끄고 25분 집중, 5분 휴식으로 일해봤는데 생각보다 효과가 좋았습니다. 해야 할 일을 세 개만 적어두는 것도 도움이 됐어요.',
      '25분 집중 루틴을 추천합니다.',
      '박서연',
      '꿀팁',
      5
    ),
    (
      '최민지 님의 입사를 환영합니다',
      '이번 주부터 자격증공장 본사에서 함께 일하게 된 최민지 님을 환영합니다. 새로운 환경에 편하게 적응할 수 있도록 마주치면 따뜻하게 인사해주세요!',
      '새로운 동료를 함께 환영해주세요.',
      '정우진',
      '축하',
      9
    ),
    (
      '퇴근 후 가볍게 러닝하실 분',
      '수요일 저녁 7시에 근처 시민공원에서 30분 정도 가볍게 달리려고 합니다. 속도보다 꾸준히 뛰는 게 목표라 초보자도 부담 없이 참여하실 수 있어요.',
      '수요일 저녁 7시, 초보자도 환영해요.',
      '강민재',
      '운동',
      21
    ),
    (
      '회의실 예약할 때 알아두면 좋은 팁',
      '회의실을 예약할 때 제목에 팀명과 예상 인원을 함께 적어두면 다른 분들이 공간을 선택하기 편합니다. 사용 후에는 화이트보드와 케이블도 한 번 확인해주세요.',
      '팀명과 인원을 함께 적어주세요.',
      '이서준',
      '꿀팁',
      28
    ),
    (
      '주말 가벼운 등산 모임 열어요',
      '이번 주 토요일 오전에 초보자도 갈 수 있는 둘레길 코스로 다녀오려고 합니다. 두 시간 정도 천천히 걷고 근처에서 점심을 먹을 예정이에요.',
      '토요일 오전, 가벼운 둘레길 코스입니다.',
      '윤도현',
      '모임',
      34
    ),
    (
      '회사 근처 조용한 카페 추천합니다',
      '회의 사이에 잠깐 작업하기 좋은 카페를 발견했습니다. 좌석 간격이 넓고 콘센트도 충분하며 오후 3시 전에는 비교적 한산했어요.',
      '조용히 작업하기 좋은 카페예요.',
      '오수빈',
      '자유',
      46
    ),
    (
      '사진 동호회 첫 모임 의견 받습니다',
      '사진을 좋아하는 분들과 점심시간에 가볍게 사진 이야기를 나누는 모임을 만들어보려고 합니다. 휴대폰 사진도 좋으니 관심 있는 분은 편하게 의견 남겨주세요.',
      '카메라가 없어도 누구나 참여할 수 있어요.',
      '김태환',
      '동호회',
      62
    )
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
  employee_seed.title,
  employee_seed.content,
  employee_seed.one_line_comment,
  'EMPLOYEE'::board_post_type_enum,
  'ALL'::board_visibility_enum,
  author.id,
  false,
  true,
  now() - (employee_seed.hours_ago || ' hours')::interval,
  now() - (employee_seed.hours_ago || ' hours')::interval
FROM employee_seed
JOIN member author ON author.name = employee_seed.author_name
WHERE NOT EXISTS (
  SELECT 1 FROM board_posts existing_post WHERE existing_post.title = employee_seed.title
);

WITH post_categories(title, category_name) AS (
  VALUES
    ('오늘 점심 국수집 같이 가실 분', '점심메이트'),
    ('업무 집중에 도움 된 작은 습관 공유해요', '꿀팁'),
    ('최민지 님의 입사를 환영합니다', '축하'),
    ('퇴근 후 가볍게 러닝하실 분', '운동'),
    ('회의실 예약할 때 알아두면 좋은 팁', '꿀팁'),
    ('주말 가벼운 등산 모임 열어요', '모임'),
    ('회사 근처 조용한 카페 추천합니다', '자유'),
    ('사진 동호회 첫 모임 의견 받습니다', '동호회')
)
INSERT INTO board_post_categories (post_id, category_id)
SELECT board_post.id, board_category.id
FROM post_categories
JOIN board_posts board_post ON board_post.title = post_categories.title
JOIN board_categories board_category ON board_category.name = post_categories.category_name
ON CONFLICT (post_id, category_id) DO NOTHING;

WITH comment_seed(post_title, author_name, content, minutes_after) AS (
  VALUES
    ('오늘 점심 국수집 같이 가실 분', '최민지', '저도 같이 갈게요! 1층에서 뵙겠습니다.', 18),
    ('오늘 점심 국수집 같이 가실 분', '오수빈', '비빔국수 궁금했는데 저도 참여할게요.', 31),
    ('업무 집중에 도움 된 작은 습관 공유해요', '강민재', '오후 집중 시간에 한번 적용해보겠습니다.', 42),
    ('최민지 님의 입사를 환영합니다', '박서연', '환영합니다! 앞으로 잘 부탁드려요.', 25),
    ('퇴근 후 가볍게 러닝하실 분', '윤도현', '초보인데 함께 참여해도 될까요?', 57),
    ('주말 가벼운 등산 모임 열어요', '한지민', '코스와 만나는 장소가 정해지면 알려주세요.', 36)
)
INSERT INTO board_comments (
  post_id,
  created_by,
  content,
  is_active,
  "createdAt",
  "updatedAt"
)
SELECT
  board_post.id,
  author.id,
  comment_seed.content,
  true,
  board_post."createdAt" + (comment_seed.minutes_after || ' minutes')::interval,
  board_post."createdAt" + (comment_seed.minutes_after || ' minutes')::interval
FROM comment_seed
JOIN board_posts board_post ON board_post.title = comment_seed.post_title
JOIN member author ON author.name = comment_seed.author_name
WHERE NOT EXISTS (
  SELECT 1
  FROM board_comments existing_comment
  WHERE existing_comment.post_id = board_post.id
    AND existing_comment.created_by = author.id
    AND existing_comment.content = comment_seed.content
);

WITH like_seed(post_title, member_name) AS (
  VALUES
    ('오늘 점심 국수집 같이 가실 분', '최민지'),
    ('오늘 점심 국수집 같이 가실 분', '오수빈'),
    ('업무 집중에 도움 된 작은 습관 공유해요', '김지원'),
    ('업무 집중에 도움 된 작은 습관 공유해요', '강민재'),
    ('최민지 님의 입사를 환영합니다', '김지원'),
    ('최민지 님의 입사를 환영합니다', '박서연'),
    ('최민지 님의 입사를 환영합니다', '정우진'),
    ('퇴근 후 가볍게 러닝하실 분', '윤도현'),
    ('회사 근처 조용한 카페 추천합니다', '한지민')
)
INSERT INTO board_likes (post_id, member_id)
SELECT board_post.id, member.id
FROM like_seed
JOIN board_posts board_post ON board_post.title = like_seed.post_title
JOIN member ON member.name = like_seed.member_name
ON CONFLICT (post_id, member_id) DO NOTHING;

WITH viewed_posts AS (
  SELECT id
  FROM board_posts
  WHERE title IN (
    '오늘 점심 국수집 같이 가실 분',
    '업무 집중에 도움 된 작은 습관 공유해요',
    '최민지 님의 입사를 환영합니다',
    '퇴근 후 가볍게 러닝하실 분',
    '회사 근처 조용한 카페 추천합니다'
  )
)
INSERT INTO board_views (post_id, member_id, last_viewed_at)
SELECT viewed_posts.id, member.id, now() - interval '15 minutes'
FROM viewed_posts
CROSS JOIN member
WHERE member.is_active = true
  AND (viewed_posts.id + member.id) % 3 = 0
  AND NOT EXISTS (
    SELECT 1
    FROM board_views existing_view
    WHERE existing_view.post_id = viewed_posts.id
      AND existing_view.member_id = member.id
  );

COMMIT;
