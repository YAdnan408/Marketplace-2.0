from datetime import datetime

from sqlalchemy import Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Product(Base):

    __tablename__ = "products"

    id:             Mapped[int]        = mapped_column(Integer, primary_key=True)
    name:           Mapped[str]        = mapped_column(String(200), nullable=False)
    description:    Mapped[str | None] = mapped_column(Text, nullable=True)
    price:          Mapped[float]      = mapped_column(Numeric(10, 2), nullable=False)
    stock_quantity: Mapped[int]        = mapped_column(Integer, nullable=False, default=0)
    image_name:     Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at:     Mapped[datetime]   = mapped_column(DateTime, default=datetime.utcnow)

    # Foreign keys
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("categories.id"), nullable=True)
    seller_id:   Mapped[int]        = mapped_column(Integer, ForeignKey("sellers.id"), nullable=False)

    # Relationships
    category:    Mapped["Category"]       = relationship("Category", back_populates="products")      # type: ignore # noqa: F821
    seller:      Mapped["Seller"]         = relationship("Seller", back_populates="products")        # type: ignore # noqa: F821
    order_items: Mapped[list["OrderItem"]]= relationship("OrderItem", back_populates="product")      # type: ignore # noqa: F821