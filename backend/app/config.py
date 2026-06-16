from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"

    # ── JWT ───────────────────────────────────────────────────────────────────
    secret_key: str = "change_this_in_production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 65
    refresh_token_expire_days: int = 7

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str
    database_test_url: str = ""

    # ── CORS ──────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # ── File uploads ──────────────────────────────────────────────────────────
    upload_dir: str = "uploads"
    cloudinary_url: str = ""  # Format: cloudinary://api_key:api_secret@cloud_name

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
        url = self.database_url
        if self.app_env == "testing" and self.database_test_url:
            url = self.database_test_url
        
        # Ensure the URL starts with postgresql+asyncpg:// for the asyncpg driver
        if url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://") and "+asyncpg" not in url:
            # Handle the 'postgres://' prefix often used by Heroku/Render/Vercel
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        
        # Strip SSL params from the URL — SSL is passed via connect_args in
        # database.py. Passing ssl in both the URL and connect_args causes
        # asyncpg to raise a "duplicate SSL parameter" error.
        import re
        url = re.sub(r"[?&]sslmode=[^&]*", "", url)
        url = re.sub(r"[?&]ssl=[^&]*", "", url)
        # Clean up any trailing ? or & left after stripping
        url = re.sub(r"[?&]$", "", url)

        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()