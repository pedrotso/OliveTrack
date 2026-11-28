# OliveTrack

Olive harvest management platform for the Project Management course (MIACD, DEI/FCTUC).

The repository contains three npm workspaces: an offline-first PWA (`frontend`), a modular API (`backend`), and shared contracts (`shared`). The current skeleton uses a sample task workflow to demonstrate these foundations.

The [project report](docs/report/report.pdf) and its [LaTeX sources](docs/report/) are in `docs/report`.

## Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, `vite-plugin-pwa`, IndexedDB with Dexie, TanStack Query |
| Backend | Node.js, NestJS 11, Prisma 6, Zod, PostgreSQL 16 |
| Shared | `@app/shared`, with TypeScript types and Zod schemas for both applications |
| Infrastructure | Docker Compose with PostgreSQL 16 |

## Repository structure

```text
OliveTrack/
├── package.json        # Workspaces and commands for the whole project
├── docker-compose.yml  # Local PostgreSQL 16 on port 5432
├── frontend/           # React PWA, local data store and sync queue
├── backend/            # NestJS API, Prisma schema and migrations
├── shared/             # Shared types and validation schemas
└── docs/
    └── report/         # LaTeX sources and compiled report
```

## Local development

The setup was verified with Node.js 24, npm 11, and Docker with Compose. Run the following from the repository root.

1. Install the locked dependencies and build the shared workspace:

   ```sh
   npm ci
   npm run build -w shared
   ```

2. Copy `backend/.env.example` to `backend/.env` and adjust the values if needed.

   ```sh
   cp backend/.env.example backend/.env
   ```

   In PowerShell, use `Copy-Item backend/.env.example backend/.env` for the same step.

3. Start PostgreSQL, apply the migrations, and start both applications:

   ```sh
   npm run db:up
   npm run db:migrate
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and proxies `/api` to the backend at `http://localhost:3001`. Run `npm run dev -w frontend` or `npm run dev -w backend` to start a workspace separately. To stop development, press `Ctrl+C` and run `docker compose down` to stop PostgreSQL.

## Build and checks

```sh
npm run build             # Builds shared, backend and frontend in order
npm run typecheck         # Checks all three workspaces
npm run lint              # Runs Oxlint for frontend and TypeScript checks for backend
npm test -w backend       # Runs the existing backend tests
npm run start -w backend  # Starts the compiled API
npm run preview -w frontend
```

## Sample API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check whether the API process responds (`{"ok":true}`) |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Retrieve a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Mark a task as deleted |
| POST | `/api/sync/push` | Apply queued local changes |
| GET | `/api/sync/pull?since=` | Retrieve changes after a cursor |

The API can start without PostgreSQL. In that state, `/api/health` still responds, while routes that use the database return errors.

## Backend environment

| Variable | Local example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://app:app@localhost:5432/app?schema=public` | Connect to local PostgreSQL |
| `PORT` | `3001` | Set the API port |
| `WEB_ORIGIN` | `http://localhost:5173` | Set the browser origin allowed by CORS |

If port 5432 is in use, change the published port in `docker-compose.yml` and update `DATABASE_URL` to match. For example, use `5433:5432` and set the URL port to `5433`.
