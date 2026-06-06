import api from "./auth";

// ── Customer ──────────────────────────────────────────────────────────────────
// Functions for customers to place and view their orders.

export async function placeOrder(cartItems, shippingAddress, shippingCost = 0) {
  const res = await api.post("/orders/checkout", {
    cart_items:       cartItems,
    shipping_address: shippingAddress,
    shipping_cost:    shippingCost,
  });
  return res.data;
}

export async function getCustomerOrders() {
  const res = await api.get("/orders/");
  return res.data;
}

// ── Seller ────────────────────────────────────────────────────────────────────

export async function getSellerOrders() {
  const res = await api.get("/orders/");
  return res.data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await api.patch(`/orders/seller/${orderId}/status`, { status });
  return res.data;
}