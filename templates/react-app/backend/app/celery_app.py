"""Celery application. Used only when the optional overlay is running.

    celery -A app.celery_app worker --loglevel=info
    celery -A app.celery_app beat --loglevel=info
"""
from celery import Celery

from app.config import settings

celery_app = Celery(
    "tasks",
    broker=settings.redis_url,
    backend=settings.redis_url,
)
celery_app.conf.update(task_track_started=True)

# Imported after the app object exists so task modules can reference it.
from app.tasks import example as _example_tasks  # noqa: E402,F401
