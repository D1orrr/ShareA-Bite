import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

default_db = "sqlite:////tmp/share_n_bite.db" if os.environ.get("VERCEL") else "sqlite:///./share_n_bite.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Share'N'Bite API"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = default_db
    
    # LLM Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://localhost:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
