<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>


## 기획서 기준 반영 내용

- 직위 기반 로그인
- 대표 / 운영관리자 / 개발팀장 / 디자이너 / 마케팅 / 개발자 / 콘텐츠 담당 / 사원 역할
- 업무 등록 -> 진행중 -> 검토요청 -> 완료 상태 흐름
- 피드백과 메모 기록
- 사진 업로드를 위한 첨부 데이터 구조

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
