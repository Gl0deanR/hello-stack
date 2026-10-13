# hello-stack

Clone-and-go, dockerized full-stack starters: **FastAPI + SQLAlchemy + Alembic +
PostgreSQL** with **JWT auth** and a working sample CRUD resource, plus your
choice of frontend.

Licensed under [MIT](LICENSE).

## Pick a template

| Folder                  | Frontend            | Use when…                                  |
|-------------------------|---------------------|--------------------------------------------|
| [`templates/react-app`](templates/react-app) | React 19 + Vite (JSX) | SPA / dashboard / internal tool            |
| [`templates/next-app`](templates/next-app)   | Next.js 16 (App Router, TS) | marketing + app, SSR/SEO matters    |

Both ship the **same backend**, copied into each template so the folder you
copy stands alone. Inside this repository, change both backend trees together.

## Use it

```bash
# copy the template you want out to a new project
cp -R templates/react-app ~/apps/my-new-app
cd ~/apps/my-new-app

./init.sh                 # creates .env, generates secrets, assigns ports
docker compose up --build
```

`init.sh` prints the URLs. With the default port base `80` they are
`8040` (web), `8041` (API, docs at `/docs`), and `8049` (pgAdmin).

You get login/register + an items CRUD demo, the API with Swagger docs at
`/docs`, and pgAdmin with the database connection pre-registered.

## What's in the box

- **Development stack:** Postgres 18, Redis 8, backend, frontend, and pgAdmin.
- **Optional overlay** (`docker-compose.optional.yml`): Celery worker, beat,
  Flower (basic auth), and a Caddy reverse proxy.
- **Production compose** (`docker-compose.prod.yml`): no reload, built frontend,
  database port not published, no pgAdmin or Redis.
- **`init.sh`** writes `.env`, generates `SECRET_KEY` and a separate
  `FLOWER_PASSWORD`, and assigns a host port block (`xx40` web, `xx41` API,
  `xx42` database, `xx43` Redis, `xx49` pgAdmin, `xx55` Flower, `xx80` proxy)
  so several clones can run side by side.
- **API** is mounted at `/api/v1`. Swagger stays at `/docs`.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how it fits together
- [`docs/ADDING_A_RESOURCE.md`](docs/ADDING_A_RESOURCE.md) — add a model + API + UI
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — production + reverse proxy / NPM
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) — roadmap of must-have integrations (Stripe, LemonSqueezy, auth, email, storage, AI, …)

## Stripping what you don't need

Every template is self-contained — delete what you won't use:
- No background jobs / proxy? Remove `docker-compose.optional.yml`, `Caddyfile`,
  `backend/app/celery_app.py`, `backend/app/tasks/`, and the `celery` / `redis` /
  `flower` lines in `requirements.txt`. Redis itself stays in `docker-compose.yml`.
- No pgAdmin? Remove the `pgadmin` service and the `pgadmin/` folder.
