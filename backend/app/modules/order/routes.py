from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession, CurrentCustomer, CurrentSeller

from .order_repository import OrderRepository
from .order_service import OrderService

from app.schemas.order import (
    CheckoutRequest,
    UpdateOrderStatusRequest,
)

router = APIRouter(prefix="/api/orders", tags=["orders"])


# ── Dependency wiring ─────────────────────────────────────────────────────────

def _get_service(db) -> OrderService:
    return OrderService(OrderRepository(db))


# ── Customer: Place order ─────────────────────────────────────────────────────

@router.post("/checkout", status_code=201)
async def place_order(
    body: CheckoutRequest,
    current_customer: CurrentCustomer,
    db: DbSession,
):
    cart_items = [item.model_dump() for item in body.cart_items]

    result = await _get_service(db).place_order(
        customer_id=current_customer["user_id"],
        cart_items=cart_items,
        shipping_address=body.shipping_address,
        shipping_cost=body.shipping_cost,
    )

    return {"message": "Order placed successfully!", "order": result}


# ── Customer: Order history/ Seller: View received orders ───────────────────────────────────────────────────

@router.get("/", status_code=200)
async def get_orders(current_user: CurrentUser, db: DbSession):
    if current_user["user_type"] == "seller":
        return await _get_service(db).get_seller_orders(current_user["user_id"])
    return await _get_service(db).get_customer_orders(current_user["user_id"])


# ── Seller: Update order status ───────────────────────────────────────────────

@router.patch("/seller/{order_id}/status", status_code=200)
async def update_order_status(
    order_id: int,
    body: UpdateOrderStatusRequest,
    current_seller: CurrentSeller,
    db: DbSession,
):
    result = await _get_service(db).update_order_status(
        order_id=order_id,
        new_status=body.status.strip().lower(),
        seller_id=current_seller["user_id"],
    )

    return {
        "message":  f"Order #{order_id} updated to '{result['status']}'.",
        "order_id": result["order_id"],
        "status":   result["status"],
    }