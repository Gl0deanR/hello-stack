#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# One-time project setup. Creates .env from .env.example, generates a random
# SECRET_KEY, sets the project name, and remaps host ports so multiple clones
# can run side by side.
#
#   ./init.sh
# ─────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

if [ -f .env ]; then
  read -r -p ".env already exists. Overwrite? [y/N] " ans
  [[ "${ans:-N}" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

default_name="$(basename "$(pwd)")"
read -r -p "Project name [${default_name}]: " project_name
project_name="${project_name:-$default_name}"

# Slug for COMPOSE_PROJECT_NAME (lowercase, alnum + dashes).
slug="$(echo "$project_name" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')"

read -r -p "Host port base (2 digits, e.g. 82 -> 82xx) [80]: " port_base
port_base="${port_base:-80}"

# Host port block. Base 82 -> web 8240, API 8241, db 8242, redis 8243,
# pgAdmin 8249, Flower 8255, proxy 8280.
FRONTEND_PORT="${port_base}40"
BACKEND_PORT="${port_base}41"
DB_PORT="${port_base}42"
REDIS_PORT="${port_base}43"
PGADMIN_PORT="${port_base}49"
FLOWER_PORT="${port_base}55"
PROXY_PORT="${port_base}80"

# Generate strong secrets (python preferred, openssl fallback).
# Flower gets its own password so it does not share the JWT signing key.
if command -v python3 >/dev/null 2>&1; then
  secret="$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')"
  flower_secret="$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')"
else
  secret="$(openssl rand -base64 48 | tr -d '\n/+=' | cut -c1-48)"
  flower_secret="$(openssl rand -base64 24 | tr -d '\n/+=' | cut -c1-24)"
fi

cp .env.example .env

# Portable in-place sed (works on both macOS and GNU).
sedi() { sed -i.bak "$1" .env && rm -f .env.bak; }

sedi "s|^APP_NAME=.*|APP_NAME=${project_name}|"
sedi "s|^SECRET_KEY=.*|SECRET_KEY=${secret}|"
sedi "s|^DB_PORT=.*|DB_PORT=${DB_PORT}|"
sedi "s|^BACKEND_PORT=.*|BACKEND_PORT=${BACKEND_PORT}|"
sedi "s|^FRONTEND_PORT=.*|FRONTEND_PORT=${FRONTEND_PORT}|"
sedi "s|^PGADMIN_PORT=.*|PGADMIN_PORT=${PGADMIN_PORT}|"
sedi "s|^FLOWER_PORT=.*|FLOWER_PORT=${FLOWER_PORT}|"
sedi "s|^PROXY_PORT=.*|PROXY_PORT=${PROXY_PORT}|"
sedi "s|^REDIS_PORT=.*|REDIS_PORT=${REDIS_PORT}|"
sedi "s|^FLOWER_PASSWORD=.*|FLOWER_PASSWORD=${flower_secret}|"
sedi "s|^API_PUBLIC_URL=.*|API_PUBLIC_URL=http://localhost:${BACKEND_PORT}|"
sedi "s|^APP_URL=.*|APP_URL=http://localhost:${FRONTEND_PORT}|"
sedi "s|^VITE_API_URL=.*|VITE_API_URL=http://localhost:${BACKEND_PORT}|"
sedi "s|^CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:${FRONTEND_PORT}|"

# Pin the compose project name so containers/volumes are namespaced.
if grep -q '^COMPOSE_PROJECT_NAME=' .env; then
  sedi "s|^COMPOSE_PROJECT_NAME=.*|COMPOSE_PROJECT_NAME=${slug}|"
else
  printf '\nCOMPOSE_PROJECT_NAME=%s\n' "$slug" >> .env
fi

cat <<EOF

✓ .env created for "${project_name}"

  Frontend  http://localhost:${FRONTEND_PORT}
  Backend   http://localhost:${BACKEND_PORT}   (docs at /docs)
  pgAdmin   http://localhost:${PGADMIN_PORT}

Next:
  docker compose up --build

With background jobs + proxy (optional overlay):
  docker compose -f docker-compose.yml -f docker-compose.optional.yml up --build
EOF
