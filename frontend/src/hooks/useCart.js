// Cookie-based cart — mirrors the cart.js logic from the Flask version exactly.
// Cart is stored as a JSON string in a cookie named "mp_cart".
// Each item: { id, name, price, image_name, category_name, stock_quantity, qty }

const CART_COOKIE = "mp_cart";
const EXPIRY_DAYS = 7;

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getCart() {
  try {
    const raw = getCookie(CART_COOKIE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  setCookie(CART_COOKIE, JSON.stringify(items), EXPIRY_DAYS);
}

export function addToCart(product, qty = 1) {
  const items = getCart();
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock_quantity);
  } else {
    items.push({
      id:             product.id,
      name:           product.name,
      price:          parseFloat(product.price),
      image_name:     product.image_name || "",
      category_name:  product.category_name || "Uncategorized",
      stock_quantity: product.stock_quantity,
      qty:            Math.min(qty, product.stock_quantity),
    });
  }
  saveCart(items);
  return getCart();
}

export function removeFromCart(productId) {
  const items = getCart().filter((i) => i.id !== productId);
  saveCart(items);
  return items;
}

export function updateCartQty(productId, newQty) {
  let items = getCart();
  if (newQty <= 0) {
    items = items.filter((i) => i.id !== productId);
  } else {
    const item = items.find((i) => i.id === productId);
    if (item) item.qty = Math.min(newQty, item.stock_quantity);
  }
  saveCart(items);
  return items;
}

export function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

export function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function clearCart() {
  deleteCookie(CART_COOKIE);
}