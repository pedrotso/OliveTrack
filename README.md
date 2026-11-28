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

Use Node.js `24.22.3` from `.node-version`, npm `11.19.1` from `package.json`, and Docker with Compose. Run the following from the repository root.

1. Install the locked dependencies:

   ```sh
   npm ci --include=dev
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

`npm run dev` builds the shared package and starts both applications. The frontend runs at `http://localhost:5173` and proxies `/api` to the backend at `http://localhost:3001`. Build the shared package with `npm run build -w shared` before starting either workspace separately with `npm run dev -w frontend` or `npm run dev -w backend`. To stop development, press `Ctrl+C` and run `docker compose down` to stop PostgreSQL.

## Build and checks

```sh
npm run build             # Builds shared, backend and frontend in order
npm run typecheck         # Checks all three workspaces
npm run lint              # Runs Oxlint for frontend and TypeScript checks for backend
npm test                 # Runs the backend unit tests
npm run start -w backend  # Starts the compiled API
npm run preview -w frontend
```

## Continuous integration

GitHub Actions checks the three workspaces when a pull request is opened, reopened, or updated with new commits. It also applies the migrations to a temporary PostgreSQL 16 database and runs an API integration test. A separate job builds the backend Docker image on the runner for validation.

For everyday development, use `npm run dev` and `npm test`. Test the container locally when changing the Dockerfile, dependencies, Prisma, or API startup.

### Dependencies and generated files

- Use exact versions for direct dependencies in the root and workspace `package.json` files. Commit matching changes to `package-lock.json` and use `npm ci` for a clean install.
- Commit `backend/prisma/schema.prisma` and its migration files. The backend build generates Prisma Client in `node_modules`, and the Docker build copies that client into the runtime image. Git ignores the generated client.
- Commit the Vite and PWA source configuration and source assets, such as icons. The frontend build generates the service worker, Workbox files and manifest in `frontend/dist`, which Git ignores. Review the source changes and CI output when those files change.

## Test the backend container locally

Run these PowerShell commands from the repository root with Docker running. This test uses a disposable PostgreSQL database and serves the API on local port `3101`.

1. Build the backend runtime image and the build stage used to run migrations:

   ```powershell
   docker build -f backend/Dockerfile -t olivetrack-backend:local .
   docker build -f backend/Dockerfile --target build -t olivetrack-backend:migrate .
   ```

2. Start the test database on a dedicated Docker network:

   ```powershell
   docker network create olivetrack-docker-test
   docker run -d --rm --name olivetrack-db-test --network olivetrack-docker-test --network-alias db --tmpfs /var/lib/postgresql/data -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -e POSTGRES_DB=olivetrack_test postgres:16
   docker exec olivetrack-db-test pg_isready -h 127.0.0.1 -U app -d olivetrack_test
   ```

   Repeat `pg_isready` until it reports `accepting connections`. If it stays unavailable, check `docker logs olivetrack-db-test`.

3. Apply the migrations. Once they succeed, start the API container:

   ```powershell
   $dbUrl = 'postgresql://app:app@db:5432/olivetrack_test?schema=public'
   docker run --rm --network olivetrack-docker-test -e "DATABASE_URL=$dbUrl" olivetrack-backend:migrate npm run db:deploy -w backend
   docker run -d --rm --name olivetrack-api-test --network olivetrack-docker-test -p 127.0.0.1:3101:3001 -e "DATABASE_URL=$dbUrl" olivetrack-backend:local
   ```

   Check `Invoke-RestMethod -Uri 'http://127.0.0.1:3101/api/health'` to see when the API is listening.

4. Create a task and retrieve it through the API:

   ```powershell
   $id = [guid]::NewGuid().ToString()
   $task = @{
       id = $id
       title = 'Docker test'
       done = $false
       updatedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
       deletedAt = $null
   } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:3101/api/tasks' -ContentType 'application/json' -Body $task
   Invoke-RestMethod -Uri "http://127.0.0.1:3101/api/tasks/$id"
   ```

   Both responses should show the same ID and title. This confirms that the API in the image can write to PostgreSQL and read back the stored task.

5. Remove the test containers and network:

   ```powershell
   docker stop olivetrack-api-test olivetrack-db-test
   docker network rm olivetrack-docker-test
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
