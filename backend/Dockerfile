FROM node:24.22.3-bookworm-slim AS base
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY shared/package.json ./shared/package.json

FROM base AS build
RUN npm ci --include=dev --no-audit --no-fund
COPY shared/ ./shared/
COPY backend/ ./backend/
RUN npm run build -w shared \
    && npm run build -w backend

FROM base AS runtime
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts --workspace=backend --workspace=shared --no-audit --no-fund
COPY --from=build /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/backend/dist ./backend/dist

USER node
EXPOSE 3001
CMD ["node", "backend/dist/main.js"]
