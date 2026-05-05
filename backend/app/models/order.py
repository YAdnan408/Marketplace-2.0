from datetime import datetime

from sqlalchemy import Integer, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Order(Base):

    __tablename__ = "orders"

    id:               Mapped[int]        = mapped_column(Integer, primary_key=True)
    total_price:      Mapped[float]      = mapped_column(Numeric(10, 2), nullable=False)
    status:           Mapped[str]        = mapped_column(String(50), nullable=False, default="pending")
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at:       Mapped[datetime]   = mapped_column(DateTime, default=datetime.utcnow)

    # Foreign keys
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)

    # Relationships
    customer:    Mapped["Customer"]        = relationship("Customer", back_populates="orders")       # type: ignore # noqa: F821
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order")       # type: ignore # noqa: F821