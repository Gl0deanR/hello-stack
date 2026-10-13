# Adding a Resource

The `Item` resource is the reference pattern. To add a new resource (say,
`Project`), copy that pattern across five files, then create a migration.

## 1. Model — `backend/app/models/project.py`

```python
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
```

Register it in `backend/app/models/__init__.py` so Alembic can see it:

```python
from app.models.project import Project
__all__ = [..., "Project"]
```

## 2. Schemas — `backend/app/schemas/project.py`

Mirror `schemas/item.py`: a `*Base`, `*Create`, `*Update`, and `*Read`
(with `model_config = ConfigDict(from_attributes=True)`).

## 3. Router — `backend/app/routers/project.py`

Copy `routers/items.py`, swap the model/schemas, keep the
`get_current_user` dependency and the owner-scoping check.

## 4. Mount it — `backend/app/main.py`

```python
from app.routers import project
app.include_router(project.router, prefix="/api/v1")
```

## 5. Migration

```bash
docker compose exec backend alembic revision --autogenerate -m "add projects"
docker compose exec backend alembic upgrade head
```

Review the generated migration before applying it — autogenerate is good but
not infallible (it can miss server defaults, enum changes, etc.).

## 6. Frontend

- **React:** add a page under `frontend/src/pages/`, call `api.get("/api/v1/projects")`,
  add a route in `App.jsx` and a nav entry in `AppShell.jsx`.
- **Next:** add `frontend/src/app/projects/page.tsx` using `apiFetch`, and a nav
  entry in `AppShell.tsx`.
