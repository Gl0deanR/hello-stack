# React + FastAPI Full-Stack Template

A dockerized, clone-and-go starter: **React (Vite) + Tailwind** frontend, **FastAPI + SQLAlchemy + Alembic** backend, **PostgreSQL**, and **pgAdmin** — with working JWT auth and a sample CRUD resource already wired end to end.

## Quick start

```bash
./init.sh                 # creates .env, generates SECRET_KEY, picks ports
docker compose up --build
```

Then open:

| Service  | URL (default ports)      | Notes                            |
|----------|--------------------------|----------------------------------|
| Frontend | http://localhost:5173    | login / register / items demo    |
| Backend  | http://localhost:8000    | OpenAPI docs at `/docs`           |
| pgAdmin  | http://localhost:5050    | server pre-registered            |

Register a user in the UI, then create/delete items — that round-trip exercises auth + a protected API.

## What's inside

```
backend/        FastAPI app (config, db, models, schemas, routers, services, utils)
  alembic/      migrations (initial migration creates users + items)
frontend/       Vite + React 19 (auth context, axios client, AppShell, pages)
pgadmin/        pre-registered server connection
docker-compose.yml           dev stack: db + redis + backend + frontend + pgadmin
docker-compose.optional.yml  overlay: celery + flower + caddy proxy
docker-compose.prod.yml      production stack (static frontend via nginx)
```

## Common tasks

- **Add a resource (model + API):** see `../../docs/ADDING_A_RESOURCE.md`.
- **Create a migration after changing models:**
  ```bash
  docker compose exec backend alembic revision --autogenerate -m "describe change"
  docker compose exec backend alembic upgrade head
  ```
  (The backend also runs `alembic upgrade head` automatically on startup.)
- **Background jobs / reverse proxy:** bring up the optional overlay:
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.optional.yml up --build
  ```

## Stripping what you don't need

- **No background jobs / proxy?** Delete `docker-compose.optional.yml`, `Caddyfile`, `app/celery_app.py`, `app/tasks/`, and the `celery` / `redis` / `flower` lines in `backend/requirements.txt`. Redis stays in `docker-compose.yml`.
- **No pgAdmin?** Remove the `pgadmin` service from `docker-compose.yml` and the `pgadmin/` folder.

## Production

See `../../docs/DEPLOY.md`. In short: set real secrets in `.env`, then
`docker compose -f docker-compose.prod.yml up -d --build`.
