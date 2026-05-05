from abc import ABC, abstractmethod


# ── Repository interface ───────────────────────────────────────────────────────

class IOrderRepository(ABC):

    # ── Customer-side ─────────────────────────────────────────────

    @abstractmethod
    def create_order(self, customer_id: int, total_price: float, shipping_address: str):
        ...

    @abstractmethod
    def create_order_items(self, order_id: int, validated_items: list) -> None:
        ...

    @abstractmethod
    def get_products_for_checkout(self, product_ids: list[int]) -> list:
        ...

    @abstractmethod
    def decrement_stock(self, product, quantity: int):
        ...

    @abstractmethod
    def get_orders_by_customer(self, customer_id: int):
        ...

    @abstractmethod
    def get_order_by_id_and_customer(self, order_id: int, customer_id: int):
        ...

    @abstractmethod
    def atomic_commit(self) -> None:
        ...

    # ── Seller-side ───────────────────────────────────────────────

    @abstractmethod
    def get_order_items_by_seller(self, seller_id: int) -> list:
        ...

    @abstractmethod
    def get_order_by_id(self, order_id: int):
        ...

    @abstractmethod
    def update_order_status(self, order, new_status: str):
        ...


# ── Service interface ──────────────────────────────────────────────────────────

class IOrderService(ABC):

    # ── Customer-side ─────────────────────────────────────────────

    @abstractmethod
    def place_order(
        self,
        customer_id: int,
        cart_items: list,
        shipping_address: str,
        shipping_cost: float,
    ) -> dict:
        ...

    @abstractmethod
    def get_customer_orders(self, customer_id: int) -> list:
        ...

    # ── Seller-side ───────────────────────────────────────────────

    @abstractmethod
    def get_seller_orders(self, seller_id: int) -> list:
        ...

    @abstractmethod
    def update_order_status(
        self, order_id: int, new_status: str, seller_id: int
    ) -> dict:
        ...