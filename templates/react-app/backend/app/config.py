"""Application configuration, loaded from environment variables.

Field names are lowercase. Environment variables stay uppercase
(`secret_key` is set by `SECRET_KEY`). See `.env.example`.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    # --- App ---
    app_name: str = "hello-stack"
    app_env: str = "development"  # development | production
    app_url: str = "http://localhost:5173"
    api_public_url: str = "http://localhost:8000"
    tz: str = "Europe/Bucharest"

    # --- Database ---
    database_url: str = "postgresql+psycopg://app:app@db:5432/app"

    # --- Auth / JWT ---
    secret_key: str = "change-me-in-production-use-init-sh"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # --- CORS ---
    # Comma-separated list of allowed origins.
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # --- Redis / Celery (Redis runs in the default stack; Celery is optional) ---
    redis_url: str = "redis://redis:6379/0"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
