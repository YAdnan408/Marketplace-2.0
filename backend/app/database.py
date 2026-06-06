from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.active_database_url,
    echo=False,
    pool_pre_ping=True,  # Enable connectivity checks
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