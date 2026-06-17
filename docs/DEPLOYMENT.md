# 배포 가이드

이 프로젝트는 GitHub 저장소 연결 없이도 다음 조합으로 배포할 수 있습니다.

- Frontend: Vercel CLI
- Backend: Docker Hub 이미지 + Render Web Service
- Database: Supabase PostgreSQL
- Image upload: Render 컨테이너 로컬 `uploads`

> Render Free 환경의 로컬 파일은 재배포, 재시작, sleep 이후 사라질 수 있습니다. 사진 보존이 중요해지면 Cloudinary 또는 S3로 옮깁니다.

## 1. Supabase DB 생성

1. Supabase에서 새 프로젝트를 만듭니다.
2. Database connection string을 확인합니다.
3. SQL Editor에서 `backend/src/database/DDL.sql` 내용을 실행합니다.
4. 테이블 생성 여부를 확인합니다.

필요한 값:

```bash
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

## 2. 백엔드 Docker 이미지 만들기

Docker Hub 계정과 Docker Desktop이 필요합니다.

```bash
docker login
docker build -f backend/Dockerfile -t <dockerhub-id>/study-factory-backend:latest .
docker push <dockerhub-id>/study-factory-backend:latest
```

예시:

```bash
docker build -f backend/Dockerfile -t hwan2/study-factory-backend:latest .
docker push hwan2/study-factory-backend:latest
```

## 3. Render에 백엔드 배포

1. Render에서 `New` -> `Web Service`를 선택합니다.
2. Git 연결 대신 Docker image 배포를 선택합니다.
3. Image URL에 Docker Hub 이미지를 입력합니다.

```bash
<dockerhub-id>/study-factory-backend:latest
```

4. 환경변수를 입력합니다.

```bash
DATABASE_URL=Supabase에서_가져온_DATABASE_URL
JWT_SECRET_KEY=긴_랜덤_문자열
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d
FRONTEND_ORIGIN=https://Vercel프론트주소
UPLOAD_DIR=uploads
UPLOAD_BASE_URL=https://Render백엔드주소/uploads
MAX_UPLOAD_SIZE_MB=10
SUPABASE_URL=https://Supabase프로젝트Ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=Supabase_service_role_key
SUPABASE_STORAGE_BUCKET=uploads
SUPABASE_STORAGE_FOLDER=uploads
```

처음에는 Vercel 주소가 없으므로 `FRONTEND_ORIGIN`은 임시로 비워두거나 나중에 수정합니다. Vercel 배포 후 Render 환경변수를 수정하고 백엔드를 재배포합니다.

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`을 모두 입력하면 이미지는 Render 컨테이너 로컬이 아니라 Supabase Storage에 저장됩니다. 세 값 중 하나라도 없으면 기존처럼 Render의 `UPLOAD_DIR` 로컬 폴더에 저장됩니다. Storage bucket은 public bucket으로 만들거나, public URL 조회가 가능하도록 정책을 설정해야 합니다.

## 4. 프론트엔드 Vercel CLI 배포

Vercel CLI가 필요합니다.

```bash
npm install -g vercel
vercel login
cd frontend
vercel
```

처음 배포 시 설정:

- Framework Preset: Next.js
- Root Directory: `frontend`
- Build Command: `npm run build`

Vercel 환경변수:

```bash
NEXT_PUBLIC_API_BASE_URL=https://Render백엔드주소
```

환경변수를 추가한 뒤 다시 배포합니다.

```bash
vercel --prod
```

## 5. 배포 후 확인

1. Vercel 프론트 주소 접속
2. 로그인 화면 직위트리 조회 확인
3. 회원가입/로그인 확인
4. 관리자/직원 대시보드 이동 확인
5. 업무 등록 확인
6. 업무 상세 진입 확인
7. 코멘트 등록 확인
8. 사진 첨부 후 `/uploads/...` 이미지가 열리는지 확인

## 6. 자주 막히는 지점

- CORS 오류: Render의 `FRONTEND_ORIGIN` 값이 실제 Vercel 주소와 같은지 확인합니다.
- DB 연결 오류: Supabase connection string과 비밀번호를 다시 확인합니다.
- 이미지가 안 보임: `UPLOAD_BASE_URL`이 Render 백엔드 주소의 `/uploads`로 끝나는지 확인합니다.
- 첫 접속이 느림: Render Free Web Service는 sleep 후 다시 깨어나는 데 시간이 걸릴 수 있습니다.
