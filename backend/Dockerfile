# Build this image from the repository root:
# docker build -f backend/Dockerfile -t your-dockerhub-id/study-factory-backend:latest .

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm ci

COPY backend ./backend

RUN npm run build --workspace backend

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm ci --omit=dev --workspace backend --include-workspace-root \
  && npm cache clean --force

COPY --from=build /app/backend/dist ./backend/dist

RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "backend/dist/main.js"]
