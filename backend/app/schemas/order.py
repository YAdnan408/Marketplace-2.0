from pydantic import BaseModel


# ── Nested schemas ────────────────────────────────────────────────────────────

class CartItemRequest(BaseModel):
    """A single item as stored in the cookie cart on the frontend."""
    id:             int         # product id
    name:           str
    price:          float
    qty:            int
    stock_quantity: int
    image_name:     str = ""
    category_name:  str = ""


class OrderItemResponse(BaseModel):
    product_id:   int
    product_name: str
    image_name:   str
    quantity:     int
    unit_price:   float
    subtotal:     float


class SellerOrderItemResponse(BaseModel):
    order_item_id: int
    product_id:    int
    product_name:  str
    image_name:    str
    quantity:      int
    unit_price:    float
    subtotal:      float


# ── Request bodies ────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    cart_items:       list[CartItemRequest]
    shipping_address: str
    shipping_cost:    float = 0.0


class UpdateOrderStatusRequest(BaseModel):
    status: str     # "pending" | "approved" | "shipped" | "delivered" | "cancelled"


# ── Response payloads ─────────────────────────────────────────────────────────

class PlacedOrderResponse(BaseModel):
    order_id:    int
    total_price: float
    status:      str
    item_count:  int


class CheckoutResponse(BaseModel):
    message: str
    order:   PlacedOrderResponse


class CustomerOrderResponse(BaseModel):
    id:               int
    status:           str
    total_price:      float
    shipping_address: str
    created_at:       str
    item_count:       int
    items:            list[OrderItemResponse]


class SellerOrderResponse(BaseModel):
    id:               int
    status:           str
    total_price:      float
    shipping_address: str
    created_at:       str
    customer_name:    str
    customer_email:   str
    items:            list[OrderItemResponse]


class UpdateOrderStatusResponse(BaseModel):
    message:  str
    order_id: int
    status:   str