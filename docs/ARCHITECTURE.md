# Architecture

Both templates share the same backend and differ only in the frontend. Copy
one template out into its own repository. The two backend trees are duplicates
on purpose, so a copied project does not depend on the other template. Change
both copies when you change the shared backend inside this repository.

## High-level

```
┌────────────┐    HTTP/JSON (JWT)     ┌─────────────┐    SQLAlchemy     ┌────────────┐
│  Frontend  │ ─────────────────────▶ │   FastAPI   │ ────────────────▶ │ PostgreSQL │
│ React/Next │   /api/v1/...          │   backend   │   Alembic migr.   │     18     │
└────────────┘                        └─────────────┘                   └────────────┘
                                            │
                                            ▼
                                          Redis  ◀── optional: Celery worker/beat, Flower
```

The development compose file always starts Postgres, Redis, the API, the
frontend, and pgAdmin. Celery and Caddy are an overlay.

## Backend layout (`backend/app`)

| Path | Responsibility |
|---|---|
| `config.py` | Settings from env (`pydantic-settings`). Lowercase fields, uppercase env names. |
| `database.py` | Engine, `SessionLocal`, `get_db` dependency |
| `models/` | SQLAlchemy ORM models (`base.py` has `Base` + timestamps) |
| `schemas/` | Pydantic request/response models |
| `routers/` | HTTP endpoints, grouped by resource, mounted under `/api/v1` |
| `services/` | Business logic that doesn't belong in a route |
| `utils/` | `security.py` (bcrypt, PyJWT), `deps.py` (`get_current_user`) |
| `celery_app.py` | Celery app. Inert unless the optional overlay runs. |
| `tasks/` | Celery tasks |
| `seed.py` | `python -m app.seed` after migrations. No-op by default. |
| `alembic/` | Migrations. `env.py` reads the app's metadata and database URL. |

**Request flow:** route → `get_db` + `get_current_user` → service or ORM →
Pydantic response. Auth is a stateless JWT (`Authorization: Bearer <token>`),
valid for 7 days, stored in `localStorage`.

OpenAPI stays at `/docs` on the API origin. The React production nginx config
and the optional Caddyfile also proxy `/docs`, `/redoc`, and `/openapi.json`.

## Frontend layout

- **React (Vite, Tailwind 4):** `services/api.js` (axios + token interceptor),
  `context/AuthContext.jsx`, `components/AppShell.jsx`, `pages/`, React Router.
- **Next.js (App Router, Tailwind 4):** `lib/api.ts` (fetch wrapper),
  `context/AuthContext.tsx`, `components/AppShell.tsx` (client-side route guard).

The API base URL is an origin (`http://localhost:8041`) or empty for same-origin.
Paths include the prefix (`/api/v1/items`). Do not set the base URL to `/api`.

## Conventions

- **`/api/v1`** is the only API prefix. Add a resource router and mount it with
  that prefix in `main.py`.
- **Redis** is part of `docker-compose.yml`. Celery is opt-in
  (`docker-compose.optional.yml`) and lives at `app.celery_app` plus `app/tasks/`.
  Flower requires `FLOWER_USER` and `FLOWER_PASSWORD`.
- **Ports.** `init.sh` assigns a block from a two-digit base: `xx40` web,
  `xx41` API, `xx42` database, `xx43` Redis, `xx49` pgAdmin, `xx55` Flower,
  `xx80` proxy.
- **Time zone and logs.** Compose sets `TZ=Europe/Bucharest` and rotates json
  logs at 10 MB × 3 files.
- **Postgres 18** keeps its data volume at `/var/lib/postgresql` (the parent of
  the versioned data directory).
- **pgAdmin** is pre-registered through `pgadmin/servers.json` and is omitted
  from the production compose file.
