# Next.js + FastAPI Full-Stack Template

A dockerized, clone-and-go starter: **Next.js 16 (App Router) + Tailwind** frontend, **FastAPI + SQLAlchemy + Alembic** backend, **PostgreSQL**, and **pgAdmin** — with working JWT auth and a sample CRUD resource already wired end to end.

> The backend is identical to the React template — only the frontend differs.

## Quick start

```bash
./init.sh                 # creates .env, generates SECRET_KEY, picks ports
docker compose up --build
```

Then open:

| Service  | URL (default ports)      | Notes                            |
|----------|--------------------------|----------------------------------|
| Frontend | http://localhost:3000    | login / register / items demo    |
| Backend  | http://localhost:8000    | OpenAPI docs at `/docs`           |
| pgAdmin  | http://localhost:5050    | server pre-registered            |

Register a user in the UI, then create/delete items — that round-trip exercises auth + a protected API.

## What's inside

```
backend/        FastAPI app (config, db, models, schemas, routers, services, utils)
  alembic/      migrations (initial migration creates users + items)
frontend/       Next.js 16 App Router, TypeScript (auth context, fetch client, pages)
pgadmin/        pre-registered server connection
docker-compose.yml           dev stack: db + redis + backend + frontend + pgadmin
docker-compose.optional.yml  overlay: celery + flower + caddy proxy
docker-compose.prod.yml      production stack (Next standalone build)
```

## Common tasks

- **Add a resource (model + API):** see `../../docs/ADDING_A_RESOURCE.md`.
- **Create a migration after changing models:**
  ```bash
  docker compose exec backend alembic revision --autogenerate -m "describe change"
  docker compose exec backend alembic upgrade head
  ```
- **Background jobs / reverse proxy:** bring up the optional overlay:
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.optional.yml up --build
  ```

## Notes on auth

Routes are guarded **client-side** (`AppShell` redirects to `/login` when there is
no user; the JWT lives in `localStorage`). This keeps the demo simple and matches
the React template. If you need server-rendered protected pages, switch to
httpOnly cookies + Next middleware — see `../../docs/INTEGRATIONS.md`.

## Production

See `../../docs/DEPLOY.md`. In short: set real secrets in `.env`, then
`docker compose -f docker-compose.prod.yml up -d --build` behind a TLS-terminating proxy.
