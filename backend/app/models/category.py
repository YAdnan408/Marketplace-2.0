from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Category(Base):

    __tablename__ = "categories"

    id:          Mapped[int]        = mapped_column(Integer, primary_key=True)
    name:        Mapped[str]        = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")  # type: ignore # noqa: F821