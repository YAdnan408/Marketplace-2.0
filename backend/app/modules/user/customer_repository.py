from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from .interfaces import ICustomerRepository


class CustomerRepository(ICustomerRepository):

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_email(self, email: str):
        result = await self._db.execute(
            select(Customer).where(Customer.email == email)
        )
        return result.scalars().first()

    async def get_by_id(self, user_id: int):
        result = await self._db.execute(
            select(Customer).where(Customer.id == user_id)
        )
        customer = result.scalars().first()
        if customer is None:
            from app.modules.user.exceptions import UserNotFoundError
            raise UserNotFoundError(f"Customer {user_id} not found.")
        return customer

    async def create(self, data: dict) -> Customer:
        customer = Customer(
            name=data["name"],
            email=data["email"],
            password=data["password"],
            phone_number=data.get("phone_number", ""),
            address=data.get("address", ""),
        )
        self._db.add(customer)
        await self._db.commit()
        await self._db.refresh(customer)
        return customer

    async def update(self, customer: Customer, data: dict) -> Customer:
        customer.name         = data.get("name", customer.name)
        customer.phone_number = data.get("phone_number", customer.phone_number)
        customer.address      = data.get("address", customer.address)
        await self._db.commit()
        await self._db.refresh(customer)
        return customer

    async def update_profile_image(self, customer: Customer, image_name: str) -> Customer:
        customer.profile_image = image_name
        await self._db.commit()
        await self._db.refresh(customer)
        return customer