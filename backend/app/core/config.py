from pydantic_settings import BaseSettings
from typing import Optional, List
import json
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "Adroit Management Platform"
    API_V1_STR: str = "/api/v1"

    # SECURITY
    SECRET_KEY: str = "supersecretkey_change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # AI
    GROQ_API_KEY: str = ""
    GROQ_SQL_MODEL: str = "groq/compound"       # Best reasoning for NL→SQL
    GROQ_NL_MODEL: str = "groq/compound-mini"   # Fast for NL response generation

    # POSTGRES — all populated by .env / Docker Compose environment
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "adroit_db"
    POSTGRES_PORT: str = "5432"

    # Optional direct URL override (takes highest priority)
    DATABASE_URL: Optional[str] = None

    # CORS
    BACKEND_CORS_ORIGINS: str = '[\"http://localhost:3000\"]'

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.BACKEND_CORS_ORIGINS)
        except Exception:
            return ["http://localhost:3000"]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # 1. Explicit DATABASE_URL env var wins (Docker Compose injects this)
        if self.DATABASE_URL:
            return self.DATABASE_URL

        # 2. Build from POSTGRES_* parts when a real password is provided
        #    ("postgres" is the default fallback — assume local dev on SQLite)
        if self.POSTGRES_PASSWORD and self.POSTGRES_PASSWORD != "postgres":
            return (
                f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )

        # 3. Local development fallback — SQLite (no external DB required)
        return "sqlite:///./adroit.db"

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"




settings = Settings()
