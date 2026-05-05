from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"

    # ── JWT ───────────────────────────────────────────────────────────────────
    secret_key: str = "change_this_in_production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str
    database_test_url: str = ""

    # ── CORS ──────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # ── File uploads ──────────────────────────────────────────────────────────
    upload_dir: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def active_database_url(self) -> str:
        if self.app_env == "testing" and self.database_test_url:
            return self.database_test_url
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()