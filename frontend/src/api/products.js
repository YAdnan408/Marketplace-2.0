import api from "./auth";

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories() {
  const res = await api.get("/products/categories");
  return res.data;
}

// ── Products: shared ──────────────────────────────────────────────────────────
// GET /api/products/ is role-aware on the backend:
// - customer  → all in-stock products
// - seller    → only their own products

export async function getProducts() {
  const res = await api.get("/products/");
  return res.data;
}

export async function getProductDetail(productId) {
  const res = await api.get(`/products/${productId}`);
  return res.data;
}

// ── Products: seller ──────────────────────────────────────────────────────────

export async function addProduct(data) {
  const res = await api.post("/products/", data);
  return res.data;
}

export async function updateProduct(productId, data) {
  const res = await api.put(`/products/${productId}`, data);
  return res.data;
}

export async function deleteProduct(productId) {
  const res = await api.delete(`/products/${productId}`);
  return res.data;
}

export async function uploadProductImage(productId, file) {
  const form = new FormData();
  form.append("image", file);
  const res = await api.post(`/products/${productId}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}