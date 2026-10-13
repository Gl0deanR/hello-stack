"""Startup hook for demo data.

Containers run `python -m app.seed` after `alembic upgrade head`.
The default does nothing, so a new database stays empty. Add inserts here
when a project needs a demo user or sample rows.
"""


def main() -> None:
    return


if __name__ == "__main__":
    main()
