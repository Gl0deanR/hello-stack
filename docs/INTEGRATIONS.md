# Integrations Roadmap (TODO)

A prioritized backlog of "must-have" integrations for a SaaS / web app built on
this template. Nothing here is wired up yet — this is the menu. Each entry notes
**what**, **why**, **where it plugs in**, and the **env vars** it needs.

Legend: ⭐ = build first for most SaaS apps · 🔁 = pick one of the group

---

## 💳 Payments & Billing

- [ ] ⭐ 🔁 **Stripe** — the default for cards, subscriptions, usage billing, invoices.
  - Where: `backend/app/routers/billing.py` (checkout session + webhook), `services/billing_service.py`, a `subscriptions` model. Frontend "Upgrade" button → checkout redirect.
  - Webhook endpoint must be **raw-body** + signature-verified. Add a `stripe` dep.
  - Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`.
- [ ] 🔁 **LemonSqueezy** — Merchant-of-Record (handles EU VAT/sales tax for you). Great for solo/indie selling globally without registering for tax everywhere.
  - Where: same shape as Stripe — checkout link + signed webhook.
  - Env: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`.
- [ ] 🔁 **Paddle** — alternative Merchant-of-Record, strong for B2B SaaS.
  - Env: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`.

> Decision: use **Stripe** if you'll handle tax/compliance yourself or need fine
> control; use **LemonSqueezy/Paddle** to offload VAT/sales-tax as MoR.

## 🔐 Authentication (beyond the built-in JWT)

- [ ] ⭐ **OAuth social login (Google, GitHub, Microsoft)** — `authlib` on the backend; add `provider` + `provider_id` columns to `users`.
  - Env: `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET`.
- [ ] **Magic-link / passwordless email** — pairs with the email provider below.
- [ ] **Password reset + email verification** — token table + 2 endpoints + 2 emails. (Arguably ⭐ for any real app.)
- [ ] **2FA / TOTP** — `pyotp`, a `totp_secret` column, verify step at login.
- [ ] **httpOnly cookie sessions** (Next) — swap localStorage JWT for httpOnly
  cookies to enable server-rendered protected pages + Next middleware guards.

## ✉️ Transactional Email

- [ ] ⭐ 🔁 **Resend** — simplest modern API, great DX. `services/email_service.py`.
  - Env: `RESEND_API_KEY`, `EMAIL_FROM`.
- [ ] 🔁 **Postmark** — excellent deliverability for transactional mail.
- [ ] 🔁 **AWS SES** — cheapest at scale, via boto3.
  - Env: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `SES_FROM`.
- [ ] **React Email / MJML templates** — type-safe, previewable email templates.

## 📦 File Storage & Uploads

- [ ] ⭐ 🔁 **S3 / Cloudflare R2 / MinIO** — presigned-URL uploads via boto3
  (R2 is S3-compatible and has no egress fees; MinIO for local/self-host).
  - Where: `routers/uploads.py` issues presigned PUT URLs; store keys in DB.
  - Env: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`.

## ⚙️ Background Jobs & Scheduling

- [x] **Redis + Celery + Flower** — Redis is in the default compose file. Celery,
  beat, and Flower (basic auth) are the optional overlay. Tasks live in
  `app/tasks/` and the app is `app.celery_app`. Wire real work (emails, exports,
  webhooks) there.
- [ ] **Celery Beat schedules** — periodic jobs (the beat service is already defined).
- [ ] **Rate limiting** — `slowapi` (Redis-backed) on auth + public endpoints.

## 📊 Observability

- [ ] ⭐ **Sentry** — error tracking for backend (`sentry-sdk[fastapi]`) and frontend.
  - Env: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` / `VITE_SENTRY_DSN`.
- [ ] 🔁 **PostHog** (product analytics + session replay + flags) or **Plausible**
  (lightweight, privacy-friendly page analytics).
  - Env: `NEXT_PUBLIC_POSTHOG_KEY` / `VITE_POSTHOG_KEY`, `POSTHOG_HOST`.
- [ ] **Structured logging + request IDs** — middleware adding a correlation id.
- [ ] **Healthcheck/uptime** — `/api/v1/health` exists; point an uptime monitor at it.

## 🤖 AI / LLM

- [ ] **Anthropic Claude API** — `anthropic` SDK in a `services/ai_service.py`; use
  prompt caching.
  - Env: `ANTHROPIC_API_KEY`.
- [ ] **pgvector embeddings + semantic search** — switch the db image to
  `pgvector/pgvector`, add a `Vector` column, store and query embeddings.
- [ ] **AWS Bedrock** — alternative model host via boto3.

## 🧰 Developer Experience / Quality

- [ ] ⭐ **Ruff + mypy** (backend), **ESLint + Prettier** (frontend) — pre-commit hooks.
- [ ] **pytest + httpx** backend test suite (a sample test for auth + items CRUD).
- [ ] **GitHub Actions CI** — lint, test, build images on PR.
- [ ] **OpenAPI client generation** — generate a typed frontend API client from `/openapi.json`.
- [ ] **Seed script** — `backend/seed.py` to create a demo user + sample data.

## 🌍 Product Features (common needs)

- [ ] **Multi-tenancy / workspaces** — `workspaces` + membership tables, scope
  queries by the current workspace.
- [ ] **RBAC / roles** — role column or roles table + a `require_role` dependency.
- [ ] **Audit log** — append-only table of who-did-what.
- [ ] **i18n** — `next-intl` (Next) / `react-i18next` (React); backend `Accept-Language`.
- [ ] **Webhooks (outbound)** — let customers subscribe to your events.
- [ ] **Admin panel** — protected `/admin` routes for support/ops.
- [ ] **Notifications** — in-app + email (+ optional Slack/Discord/Telegram).

---

### Suggested first sprint for a new SaaS
1. Password reset + email verification (Resend)
2. Stripe (or LemonSqueezy) subscriptions + webhook
3. Sentry on both ends
4. S3/R2 uploads (if the product needs files)
5. Ruff/ESLint + a CI pipeline
