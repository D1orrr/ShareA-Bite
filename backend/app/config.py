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
    GEMINI_MODEL: str = "gemini-2.5-flash"

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
    def gemini_enabled(self) -> bool:
        k = self.GEMINI_API_KEY.strip()
        return bool(k) and k != "your_gemini_api_key_here"


settings = Settings()
