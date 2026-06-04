<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

# study-factory-step-management

`jagong-api` 구조를 기준으로 재구성한 `NestJS + Prisma` 백엔드 프로젝트입니다.

이 프로젝트는 사진 기획서의 `자격증공장 사원업무현황` 앱을 위한 API 서버를 목표로 합니다.

Nest 기본 스타터 흐름 위에, 직원 업무 등록/진행/피드백/사진 첨부 도메인을 얹은 형태입니다.

## Description

[Nest](https://github.com/nestjs/nest) 기반 TypeScript 서버 프로젝트이며, 현재 도메인은 사원 업무 현황 관리입니다.

## 현재 반영된 구조

- `src/main.ts`: Nest 앱 진입점
- `src/app.module.ts`: 전역 모듈 조합
- `src/database`: Prisma 연결
- `src/components/user`: 직위 선택 로그인, 직원 조회, 직원 생성
- `src/components/task`: 업무 등록, 상태 변경, 피드백, 사진/파일 첨부
- `src/libs/dto`: 요청 DTO
- `prisma/schema.prisma`: 역할, 업무, 피드백, 첨부 구조

## 사진 기획서 기준 반영 내용

- 직위 기반 로그인
- 대표 / 운영관리자 / 개발팀장 / 디자이너 / 마케팅 / 개발자 / 콘텐츠 담당 / 사원 역할
- 업무 등록 -> 진행중 -> 검토요청 -> 완료 상태 흐름
- 피드백과 메모 기록
- 사진 업로드를 위한 첨부 데이터 구조

## 주요 API

### 사용자

- `POST /api/users/login`
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`

### 업무

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `POST /api/tasks/:id/feedback`
- `POST /api/tasks/:id/attachments`

## Project setup

```bash
npm install
npm run prisma:generate
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Build

```bash
npm run build
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Lint and format

```bash
npm run lint
npm run format
```

## 환경 변수

`.env`에 아래 값을 설정해 주세요.

```bash
DATABASE_URL=
PORT=3000
```

## Deployment

배포 전에는 아래 항목을 먼저 준비하는 걸 권장합니다.

- `DATABASE_URL`이 연결된 운영 PostgreSQL 준비
- `prisma migrate deploy` 또는 운영 반영 방식 정리
- 사진 첨부 저장소를 Supabase Storage 또는 S3로 확정
- 역할별 권한 가드와 인증 방식 정리

Nest 배포 자체는 일반적인 `build -> start:prod` 흐름으로 가져가면 됩니다.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Deployment Docs](https://docs.nestjs.com/deployment)
- [Prisma Documentation](https://www.prisma.io/docs)

## 다음으로 추천하는 작업

1. Prisma migration 생성
2. 역할별 권한 가드 추가
3. Supabase Storage 또는 S3 기반 실제 사진 업로드 연동
4. 프론트 로그인/업무 화면과 API 연결
