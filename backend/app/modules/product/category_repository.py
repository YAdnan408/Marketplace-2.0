from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from .interfaces import ICategoryRepository


class CategoryRepository(ICategoryRepository):

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self):
        result = await self._db.execute(
            select(Category).order_by(Category.name)
        )
        return result.scalars().all()

    async def get_by_id(self, category_id: int):
        result = await self._db.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalars().first()

    async def get_by_name(self, name: str):
        result = await self._db.execute(
            select(Category).where(Category.name == name)
        )
        return result.scalars().first()

    async def create(self, name: str, description: str = "") -> Category:
        category = Category(name=name, description=description)
        self._db.add(category)
        await self._db.commit()
        await self._db.refresh(category)
        return category