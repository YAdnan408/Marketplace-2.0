from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from .config import get_settings

settings = get_settings()

# ── Engine ────────────────────────────────────────────────────────────────────
# NullPool is required for Vercel serverless:
# - Default QueuePool keeps persistent connections alive per process.
# - On serverless, every cold start creates a NEW pool, quickly exhausting
#   Neon's connection limit and producing 500 errors.
# - NullPool opens one connection per request and closes it immediately after,
#   which is the correct behaviour for a stateless serverless environment.
engine = create_async_engine(
    settings.active_database_url,
    echo=False,
    poolclass=NullPool,
    connect_args={"ssl": "require"},  # asyncpg needs ssl passed as connect_arg for Neon
)

async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

from sqlalchemy.orm import DeclarativeBase  # noqa: E402


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session