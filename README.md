# 자격증공장 사원업무현황

대표/관리자가 직원에게 업무를 지시하고, 직원이 진행상황/결과물/사진/피드백을 남기는 모바일 최적화 업무관리 앱입니다.

이 저장소는 프론트엔드와 백엔드를 분리한 워크스페이스 구조로 관리합니다.

## 구조

- `frontend`: Next.js App Router + React + TypeScript + Tailwind CSS
- `backend`: NestJS + PostgreSQL API 서버
- `docs`: 기획서 기반 구현 체크리스트와 개발 문서

## 프론트엔드

현재 로그인 첫 화면 UI는 React 컴포넌트로 분리되어 있습니다.

- `frontend/src/app/page.tsx`: Next.js 페이지 엔트리
- `frontend/src/features/auth/login-page.tsx`: 로그인 화면 React 컴포넌트
- `frontend/src/components`: 공통 UI 컴포넌트
- `frontend/src/types/domain.ts`: 프론트엔드 도메인 타입 초안

## 백엔드

백엔드는 NestJS와 PostgreSQL 사용을 전제로 분리합니다. ORM은 다음 단계에서 Prisma 또는 TypeORM 중 하나로 확정합니다.

예정 역할:

- 로그인/인증 API
- `member`, `tasks`, `task_comments`, `task_attachments` 등 업무 도메인 API
- PostgreSQL 마이그레이션
- 파일 업로드 저장소 연동

## 환경 변수

루트 예시:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/study_factory
PORT=4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

프론트엔드 예시:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

백엔드 예시:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/study_factory
PORT=4000
```

## 실행

```bash
npm install
npm run dev
```

현재 `npm run dev`는 `frontend` 앱을 실행합니다. 브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 주요 구현 순서

1. NestJS 백엔드 앱 구성
2. PostgreSQL 스키마와 마이그레이션 작성
3. 로그인 API 구현
4. 프론트엔드 로그인 화면을 API에 연결
5. 관리자 대시보드와 업무 등록 구현
6. 직원 내 업무와 업무 상세 구현
7. 사진 업로드 구현
8. 피드백, 활동 내역, 알림 구현
