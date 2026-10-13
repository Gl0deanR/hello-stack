# Deployment

## Before you deploy

In `.env` on the server, set production values:

- `APP_ENV=production`
- `SECRET_KEY` — a strong, unique value (`python -c "import secrets; print(secrets.token_urlsafe(48))"`)
- `POSTGRES_PASSWORD` — a real password
- `CORS_ORIGINS` — your real frontend origin(s)
- `NEXT_PUBLIC_API_URL` / `VITE_API_URL` — the public API **origin**, with no `/api` suffix. Paths already start with `/api/v1`. Leave the value empty when nginx or another proxy serves the app and the API on one host. The React production image does this for you.

The prod compose does **not** publish the Postgres port, **omits pgAdmin**,
and does **not** publish the API port. The backend is reachable on the compose
network as `backend:8000`.

## Bring it up

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- **React template:** the frontend image is nginx serving the built static
  bundle and proxying `/api` to the backend — so the frontend container is the
  single web entrypoint.
- **Next template:** the frontend runs the Next standalone server on port 3000;
  the backend stays on the internal network. Put a proxy in front to route both
  under one domain (`/api` → `backend:8000`, `/` → frontend). Set
  `NEXT_PUBLIC_API_URL` to that public origin, or leave it empty for same-origin
  calls through the proxy.

## Reverse proxy / TLS

For a single app, the **Caddy** service in the optional overlay gives you
automatic HTTPS with a one-line config.

For **multiple apps on one host**, run a single shared gateway instead of one
per app. **Nginx Proxy Manager (NPM)** is the common choice — it's a host-level
service with its own admin UI (port 81) and database, not something that belongs
inside each app's compose file. Typical setup:

```
# A separate, long-lived compose project (run once on the host):
services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    ports: ["80:80", "443:443", "81:81"]
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks: [proxy_net]

networks:
  proxy_net:
    external: true
```

Then attach each app's `frontend`/`backend` to that external `proxy_net`
network and add a Proxy Host in the NPM UI pointing at the container + port.
This way one NPM instance fronts all your deployed templates.

## Migrations

The backend runs `alembic upgrade head` on startup, so deploys apply pending
migrations automatically. For zero-downtime, prefer additive migrations and
deploy schema changes ahead of code that depends on them.
