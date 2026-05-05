from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.seller import Seller
from .interfaces import ISellerRepository


class SellerRepository(ISellerRepository):

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_email(self, email: str):
        result = await self._db.execute(
            select(Seller).where(Seller.email == email)
        )
        return result.scalars().first()

    async def get_by_id(self, user_id: int):
        result = await self._db.execute(
            select(Seller).where(Seller.id == user_id)
        )
        seller = result.scalars().first()
        if seller is None:
            from app.modules.user.exceptions import UserNotFoundError
            raise UserNotFoundError(f"Seller {user_id} not found.")
        return seller

    async def create(self, data: dict) -> Seller:
        seller = Seller(
            name=data["name"],
            email=data["email"],
            password=data["password"],
            phone_number=data.get("phone_number", ""),
            business_address=data.get("address", ""),
            role="seller",
        )
        self._db.add(seller)
        await self._db.commit()
        await self._db.refresh(seller)
        return seller

    async def update(self, seller: Seller, data: dict) -> Seller:
        seller.name             = data.get("name", seller.name)
        seller.phone_number     = data.get("phone_number", seller.phone_number)
        seller.business_address = data.get("address", seller.business_address)
        await self._db.commit()
        await self._db.refresh(seller)
        return seller

    async def update_profile_image(self, seller: Seller, image_name: str) -> Seller:
        seller.profile_image = image_name
        await self._db.commit()
        await self._db.refresh(seller)
        return seller