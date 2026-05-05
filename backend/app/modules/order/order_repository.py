from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from .interfaces import IOrderRepository
from .exceptions import OrderNotFoundError, OrderPlacementError


class OrderRepository(IOrderRepository):

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ── Customer-side ─────────────────────────────────────────────────────────

    async def create_order(
        self, customer_id: int, total_price: float, shipping_address: str
    ) -> Order:
        order = Order(
            customer_id=customer_id,
            total_price=total_price,
            shipping_address=shipping_address,
            status="pending",
        )
        self._db.add(order)
        await self._db.flush()   # obtain order.id without committing yet
        return order

    async def create_order_items(self, order_id: int, validated_items: list) -> None:
        """Bulk-insert all order items in a single round-trip."""
        self._db.add_all([
            OrderItem(
                order_id=order_id,
                product_id=item["product"].id,
                seller_id=item["seller_id"],
                quantity=item["qty"],
                price=item["price"],
            )
            for item in validated_items
        ])

    async def get_products_for_checkout(self, product_ids: list[int]) -> list:
        """
        Batch row-level lock ordered by id.
        Locking all rows in one round-trip minimises lock-hold time.
        ORDER BY id guarantees every concurrent transaction acquires locks
        in the same sequence, making deadlocks impossible.
        """
        result = await self._db.execute(
            select(Product)
            .where(Product.id.in_(product_ids))
            .order_by(Product.id)
            .with_for_update()
        )
        return result.scalars().all()

    async def decrement_stock(self, product: Product, quantity: int) -> Product:
        product.stock_quantity -= quantity
        return product

    async def get_orders_by_customer(self, customer_id: int) -> list:
        result = await self._db.execute(
            select(Order)
            .options(
                joinedload(Order.order_items).joinedload(OrderItem.product),
                joinedload(Order.customer),
            )
            .where(Order.customer_id == customer_id)
            .order_by(Order.created_at.desc())
        )
        # unique() required when joinedload produces duplicate parent rows
        return result.unique().scalars().all()

    async def get_order_by_id_and_customer(
        self, order_id: int, customer_id: int
    ) -> Order:
        result = await self._db.execute(
            select(Order)
            .options(
                joinedload(Order.order_items).joinedload(OrderItem.product),
                joinedload(Order.customer),
            )
            .where(
                Order.id == order_id,
                Order.customer_id == customer_id,
            )
        )
        order = result.unique().scalars().first()
        if order is None:
            raise OrderNotFoundError(f"Order {order_id} not found.")
        return order

    async def atomic_commit(self) -> None:
        """
        Commit the transaction; rollback and re-raise on any DB error.
        Keeping commit/rollback inside the repo means the service never
        touches transaction control.
        """
        try:
            await self._db.commit()
        except Exception:
            await self._db.rollback()
            raise OrderPlacementError("Database error during order placement.")

    # ── Seller-side ───────────────────────────────────────────────────────────

    async def get_order_items_by_seller(self, seller_id: int) -> list:
        """
        All OrderItem rows belonging to this seller, joined with their parent
        Order, product, and the order's customer.
        Ordered newest-first by the parent order's created_at.
        """
        result = await self._db.execute(
            select(OrderItem)
            .options(
                joinedload(OrderItem.product),
                joinedload(OrderItem.order).joinedload(Order.customer),
            )
            .where(OrderItem.seller_id == seller_id)
            .join(Order, OrderItem.order_id == Order.id)
            .order_by(Order.created_at.desc())
        )
        return result.unique().scalars().all()

    async def get_order_by_id(self, order_id: int) -> Order:
        result = await self._db.execute(
            select(Order)
            .options(
                joinedload(Order.order_items).joinedload(OrderItem.product),
                joinedload(Order.customer),
            )
            .where(Order.id == order_id)
        )
        order = result.unique().scalars().first()
        if order is None:
            raise OrderNotFoundError(f"Order {order_id} not found.")
        return order

    async def update_order_status(self, order: Order, new_status: str) -> Order:
        order.status = new_status
        await self._db.commit()
        await self._db.refresh(order)
        return order