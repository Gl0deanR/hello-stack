# Security

This repository is a starter. It is not a deployed application.

Report a vulnerability in the template through GitHub security advisories on this
repository. Please do not open a public issue for an unfixed security bug.

Before you deploy a project created from a template:

- Replace `SECRET_KEY`, `POSTGRES_PASSWORD`, and the pgAdmin password.
- Set `APP_ENV=production` and `CORS_ORIGINS` to the real frontend origin.
- Do not publish the Postgres port. The production compose file already omits it.
- Flower is off unless you start the optional overlay. Change `FLOWER_PASSWORD` first.
- The demo keeps the JWT in `localStorage`. Treat that as a starting point, not a
  hardened session design.
