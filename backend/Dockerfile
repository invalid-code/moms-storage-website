# Backend runtime image. Build from the repo root so the npm workspaces
# (backend + shared @my-app/types) resolve:
#   docker build -f backend/Dockerfile -t moms-backend .
FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production
WORKDIR /app

# Install backend workspace dependencies (tsx runs the TS sources directly,
# so no compile step is needed and shared/ stays as source).
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/
RUN npm ci --workspace=backend && npm cache clean --force

COPY backend ./backend
COPY shared ./shared

WORKDIR /app/backend
EXPOSE 5000
USER node
CMD ["npm", "start"]
