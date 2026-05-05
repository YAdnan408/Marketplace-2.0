from datetime import datetime

from sqlalchemy import Integer, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Customer(Base):

    __tablename__ = "customers"

    id:            Mapped[int]          = mapped_column(Integer, primary_key=True)
    name:          Mapped[str]          = mapped_column(String(100), nullable=False)
    email:         Mapped[str]          = mapped_column(String(120), unique=True, nullable=False)
    password:      Mapped[str]          = mapped_column(String(255), nullable=False)
    phone_number:  Mapped[str | None]   = mapped_column(String(20), nullable=True)
    address:       Mapped[str | None]   = mapped_column(Text, nullable=True)
    profile_image: Mapped[str | None]   = mapped_column(String(255), nullable=True)
    created_at:    Mapped[datetime]     = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="customer")  # type: ignore # noqa: F821