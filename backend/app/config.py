import os
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

# Local dev: SQLite file next to the backend. Vercel: /tmp is the only writable dir
# (it is wiped on cold start, the app simply re-seeds itself).
default_db = "sqlite:////tmp/share_a_bite.db" if os.environ.get("VERCEL") else "sqlite:///./share_a_bite.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "ShareA'Bite API"
    PROJECT_VERSION: str = "0.2.0"
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = default_db

    # Auth (change SECRET_KEY in .env for anything beyond a local demo)
    SECRET_KEY: str = "sharea-bite-dev-secret-change-me"
    TOKEN_DAYS: int = 30

    # LLM — optional. Without a key the rule-based generator is used.
    GEMINI_API_KEY: str = ""
    # Leave empty to try the free-tier models below in order (each has its own daily quota).
    # Set one ID (or a comma-separated list) to override.
    GEMINI_MODEL: str = ""

    # Where uploaded post photos are stored. On serverless hosts the disk isn't shared
    # between instances, so photos are kept inside the database instead.
    UPLOAD_DIR: str = "/tmp/sharea_bite_uploads" if os.environ.get("VERCEL") else "./uploads"
    IMAGES_IN_DB: bool = bool(os.environ.get("VERCEL"))

    # Timezone used for "today" and "open now"
    TIMEZONE: str = "Asia/Jakarta"

    # CORS — the app sends a bearer token (no cookies), so "*" is fine
    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def gemini_models(self) -> list[str]:
        custom = [m.strip() for m in self.GEMINI_MODEL.split(",") if m.strip()]
        return custom or ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash"]

    @property
    def gemini_enabled(self) -> bool:
        k = self.GEMINI_API_KEY.strip()
        return bool(k) and k != "your_gemini_api_key_here"


settings = Settings()
