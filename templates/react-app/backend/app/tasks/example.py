"""Sample task. Replace with real work (email, exports, webhooks)."""
from app.celery_app import celery_app


@celery_app.task
def example_task(x: int, y: int) -> int:
    """Trivial task to prove the worker is wired up."""
    return x + y
