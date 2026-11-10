# OliveTrack

Plataforma de gestão de colheita de azeitona — projeto final da unidade curricular de Gestão de Projetos (MIACD, DEI/FCTUC).

Monorepo com três workspaces npm: PWA offline-first (`frontend`), API modular (`backend`) e contratos partilhados (`shared`).

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, PWA (`vite-plugin-pwa`), IndexedDB via Dexie, TanStack Query |
| Backend | Node.js, NestJS 11, Prisma 6, Zod, PostgreSQL 16 |
| Partilhado | `@app/shared` — tipos e esquemas Zod usados por frontend e backend |
| Infra | Docker Compose (Postgres 16) |

## Estrutura

```
OliveTrack/
├── package.json              # workspaces + scripts agregados
├── docker-compose.yml        # serviço db (postgres:16, porta 5432)
├── frontend/                 # PWA Vite + React
│   ├── index.html
│   ├── vite.config.ts        # proxy /api → localhost:3001, manifest PWA
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── pages/TasksPage.tsx
│       ├── components/PwaStatus.tsx
│       ├── db/               # Dexie: tasks, outbox, meta
│       └── sync/             # outbox → push, pull por cursor
├── backend/                  # API NestJS
│   ├── nest-cli.json
│   ├── tsconfig.json / tsconfig.build.json
│   ├── vitest.config.ts
│   ├── .env.example          # DATABASE_URL, PORT, WEB_ORIGIN
│   ├── prisma/
│   │   ├── schema.prisma     # Task, AppliedMutation
│   │   └── migrations/
│   └── src/
│       ├── main.ts           # prefixo global /api, CORS, porta 3001
│       ├── app.module.ts
│       ├── prisma/           # PrismaModule + PrismaService
│       ├── health/           # GET /api/health
│       ├── tasks/            # CRUD /api/tasks
│       └── sync/             # POST /api/sync/push, GET /api/sync/pull
└── shared/                   # @app/shared (compilado para dist/)
    └── src/index.ts
```

## Pré-requisitos

- Node.js 20+ e npm 10+
- Docker com o plugin Compose (para o PostgreSQL local)

## Comandos

### Instalação (uma vez)

```bash
npm install
npx prisma generate --schema backend/prisma/schema.prisma
cp backend/.env.example backend/.env
```

### Base de dados

```bash
npm run db:up          # docker compose up -d db
npm run db:migrate     # prisma migrate dev (backend)
```

### Desenvolvimento

```bash
npm run dev            # frontend (:5173) + backend (:3001) em paralelo
```

Ou separadamente:

```bash
npm run dev -w backend     # nest start --watch  → http://localhost:3001/api
npm run dev -w frontend    # vite               → http://localhost:5173
```

### Build e execução

```bash
npm run build              # shared → backend → frontend
npm run start -w backend   # node dist/main.js
npm run preview -w frontend
```

### Qualidade

```bash
npm run typecheck          # shared + frontend + backend
npm run lint               # oxlint (frontend) + tsc --noEmit (backend)
npm test -w backend        # vitest
```

### Parar

```bash
docker compose down        # parar a base de dados
```

`Ctrl+C` nos processos de `npm run dev`.

## Endpoints da API

Prefixo global `/api`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/health` | Estado do serviço (`{"ok":true}`) |
| GET | `/api/tasks` | Listar tarefas |
| POST | `/api/tasks` | Criar tarefa |
| GET | `/api/tasks/:id` | Obter tarefa |
| PUT | `/api/tasks/:id` | Atualizar tarefa |
| DELETE | `/api/tasks/:id` | Remover tarefa (soft delete) |
| POST | `/api/sync/push` | Aplicar mutações da outbox |
| GET | `/api/sync/pull?since=` | Pull incremental por cursor |

## Variáveis de ambiente

Definidas em `backend/.env` (não versionado), a partir de `backend/.env.example`:

| Variável | Valor por omissão | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://app:app@localhost:5432/app?schema=public` | Ligação ao PostgreSQL |
| `PORT` | `3001` | Porta da API |
| `WEB_ORIGIN` | `http://localhost:5173` | Origem permitida em CORS |

## Notas

- Sem PostgreSQL acessível, a API arranca na mesma: `/api/health` responde 200 e os endpoints que tocam na base de dados devolvem 500.
- Se a porta 5432 estiver ocupada, altera o mapeamento em `docker-compose.yml` para `"5433:5432"` e ajusta `DATABASE_URL`.
- O grupo `docker` só fica ativo numa sessão nova após `sudo usermod -aG docker $USER`.
