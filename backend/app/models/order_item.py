from sqlalchemy import Integer, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class OrderItem(Base):

    __tablename__ = "order_items"

    id:       Mapped[int]   = mapped_column(Integer, primary_key=True)
    quantity: Mapped[int]   = mapped_column(Integer, nullable=False)
    price:    Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Foreign keys
    order_id:   Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"),   nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    seller_id:  Mapped[int] = mapped_column(Integer, ForeignKey("sellers.id"),  nullable=False)

    # Relationships
    order:   Mapped["Order"]   = relationship("Order",   back_populates="order_items")   # type: ignore # noqa: F821
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")   # type: ignore # noqa: F821
    seller:  Mapped["Seller"]  = relationship("Seller",  back_populates="order_items")   # type: ignore # noqa: F821