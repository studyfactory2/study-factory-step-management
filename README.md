# 자격증공장 사원업무현황

대표/관리자가 직원에게 업무를 지시하고, 직원이 진행상황/결과물/사진/피드백을 남기는 모바일 최적화 업무관리 앱입니다.

이 프로젝트는 Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui 스타일 구성 + Supabase 기반으로 구현합니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- Vercel 배포

## 현재 반영된 구조

- `src/app`: Next.js App Router 화면
- `src/components`: 공통 UI 컴포넌트
- `src/lib/supabase`: Supabase browser/server client 유틸
- `src/types`: Supabase 데이터 타입 초안
- `docs/README.md`: PDF 기획서 기반 구현 체크리스트

## 환경 변수

`.env.local`에 아래 값을 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 주요 구현 순서

1. Supabase SQL 스키마와 RLS 작성
2. Supabase Auth 로그인 연결
3. 직위 선택/로그인 화면 실제 동작 구현
4. 관리자 대시보드와 업무 등록 구현
5. 직원 내 업무와 업무 상세 구현
6. Supabase Storage 기반 사진 업로드 구현
7. 피드백, 활동 내역, 알림 구현
8. 도움 요청 구현
9. 모바일 QA와 Vercel 배포
