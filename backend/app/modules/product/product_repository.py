from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.product import Product
from .interfaces import IProductRepository
from .exceptions import ProductNotFoundError


class ProductRepository(IProductRepository):

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self):
        result = await self._db.execute(
            select(Product)
            .options(joinedload(Product.category), joinedload(Product.seller))
            .where(Product.stock_quantity > 0)
            .order_by(Product.created_at.desc())
        )
        return result.scalars().all()

    async def get_all_by_seller(self, seller_id: int):
        result = await self._db.execute(
            select(Product)
            .options(joinedload(Product.category), joinedload(Product.seller))
            .where(Product.seller_id == seller_id)
            .order_by(Product.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_id(self, product_id: int) -> Product:
        result = await self._db.execute(
            select(Product)
            .options(joinedload(Product.category), joinedload(Product.seller))
            .where(Product.id == product_id)
        )
        product = result.scalars().first()
        if product is None:
            raise ProductNotFoundError(f"Product {product_id} not found.")
        return product

    async def get_by_id_or_none(self, product_id: int):
        result = await self._db.execute(
            select(Product)
            .options(joinedload(Product.category), joinedload(Product.seller))
            .where(Product.id == product_id)
        )
        return result.scalars().first()

    async def get_by_id_and_seller(self, product_id: int, seller_id: int):
        result = await self._db.execute(
            select(Product)
            .options(joinedload(Product.category), joinedload(Product.seller))
            .where(
                Product.id == product_id,
                Product.seller_id == seller_id,
            )
        )
        return result.scalars().first()

    async def _refetch(self, product_id: int) -> Product:
        """Re-fetch a product with all relationships eagerly loaded after a write."""
        result = await self._db.execute(
            select(Product)
            .options(joinedload(Product.category), joinedload(Product.seller))
            .where(Product.id == product_id)
        )
        return result.scalars().first()

    async def create(self, data: dict) -> Product:
        product = Product(
            name=data["name"],
            description=data.get("description", ""),
            price=data["price"],
            stock_quantity=data.get("stock_quantity", 0),
            category_id=data.get("category_id"),
            seller_id=data["seller_id"],
            image_name=data.get("image_name", ""),
        )
        self._db.add(product)
        await self._db.commit()
        return await self._refetch(product.id)

    async def update(self, product: Product, data: dict) -> Product:
        product.name           = data.get("name", product.name)
        product.description    = data.get("description", product.description)
        product.price          = data.get("price", product.price)
        product.stock_quantity = data.get("stock_quantity", product.stock_quantity)
        product.category_id    = data.get("category_id", product.category_id)
        await self._db.commit()
        return await self._refetch(product.id)

    async def update_image(self, product: Product, image_name: str) -> Product:
        product.image_name = image_name
        await self._db.commit()
        return await self._refetch(product.id)

    async def delete(self, product: Product) -> None:
        await self._db.delete(product)
        await self._db.commit()