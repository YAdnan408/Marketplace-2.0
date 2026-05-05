import { useState, useEffect, useRef } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct, uploadProductImage } from "../../api/products";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";

const CATEGORIES = [
  { id: 1, name: "Smartphones" }, { id: 2, name: "Laptops" },
  { id: 3, name: "Clothing" },    { id: 4, name: "Musical Instruments" },
  { id: 5, name: "Books & Stationery" }, { id: 6, name: "Sports & Fitness Gear" },
];

const emptyForm = { name: "", description: "", price: "", stock_quantity: "", category_id: "" };

export default function SellerProducts() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editId, setEditId]         = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [form, setForm]             = useState(emptyForm);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setPreview]  = useState(null);
  const [modalError, setModalError] = useState("");
  const [success, setSuccess]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const fileRef = useRef();

  const load = () => getProducts().then((p) => { setProducts(p); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setImageFile(null); setPreview(null); setModalError(""); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, stock_quantity: p.stock_quantity, category_id: p.category_id || "" });
    setEditId(p.id);
    setPreview(p.image_name ? `/uploads/product_images/${p.image_name}` : null);
    setImageFile(null); setModalError(""); setModalOpen(true);
  };
  const openDelete = (p) => { setDeleteId(p.id); setDeleteName(p.name); setDeleteOpen(true); };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setModalError("Product name is required."); return; }
    if (!form.price)       { setModalError("Price is required."); return; }
    setSaving(true); setModalError("");
    try {
      let product;
      if (editId) {
        const res = await updateProduct(editId, { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) || 0, category_id: form.category_id || null });
        product = res.product;
      } else {
        const res = await addProduct({ ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) || 0, category_id: form.category_id || null });
        product = res.product;
      }
      if (imageFile) await uploadProductImage(product.id, imageFile);
      setModalOpen(false);
      setSuccess(editId ? "Product updated successfully." : "Product added successfully.");
      load();
    } catch (err) {
      setModalError(err.response?.data?.error?.message || "Failed to save product.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(deleteId);
      setDeleteOpen(false);
      setSuccess("Product deleted successfully.");
      load();
    } catch { setSuccess(""); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <Navbar backTo="/seller/dashboard" backLabel="← Dashboard" />

      <div className="products-container">
        <div className="products-header">
          <div>
            <h2>My Products</h2>
            <p className="page-note">{loading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""}`}</p>
          </div>
          <button className="btn-add-product" onClick={openAdd}>+ Add Product</button>
        </div>

        {success && <div className="success-msg">{success}</div>}

        {loading ? (
          <div className="products-loading">Loading your products...</div>
        ) : (
          <div className="products-grid">
            {products.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No products yet. Add your first product.</p>
            ) : products.map((p) => (
              <div className="product-card" key={p.id}>
                <div className="product-card-image">
                  {p.image_name
                    ? <img src={`/uploads/product_images/${p.image_name}`} alt={p.name} />
                    : <div className="product-card-no-image">📷</div>}
                </div>
                <div className="product-card-body">
                  <div className="product-card-category">{p.category_name}</div>
                  <h4 className="product-card-name">{p.name}</h4>
                  <div className="product-card-footer">
                    <span className="product-card-price">৳{parseFloat(p.price).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
                    <span className={`product-card-stock${p.stock_quantity === 0 ? " out" : ""}`}>{p.stock_quantity === 0 ? "Out of stock" : `${p.stock_quantity} in stock`}</span>
                  </div>
                  <div className="product-card-actions">
                    <button className="btn-card-edit" onClick={() => openEdit(p)}>✏ Edit</button>
                    <button className="btn-card-delete" onClick={() => openDelete(p)}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Product" : "Add Product"}>
        {modalError && <div className="error-msg">{modalError}</div>}
        <div className="field-group">
          <label>Product Name</label>
          <input type="text" placeholder="Enter product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field-group">
          <label>Description</label>
          <textarea rows="3" placeholder="Describe your product…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="modal-row">
          <div className="field-group">
            <label>Price (৳)</label>
            <input type="number" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="field-group">
            <label>Stock Quantity</label>
            <input type="number" placeholder="0" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
          </div>
        </div>
        <div className="field-group">
          <label>Category</label>
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label>Product Image</label>
          <div className="image-upload-area" onClick={() => fileRef.current.click()}>
            {imagePreview
              ? <img className="image-preview" src={imagePreview} alt="Preview" />
              : <div id="imageUploadPlaceholder"><span>📷</span><p>Click to upload image</p><small>PNG, JPG, JPEG, WEBP</small></div>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagePick} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner /> : (editId ? "Save Changes" : "Add Product")}
          </button>
          <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Product" size="sm">
        <p className="delete-confirm-text">Are you sure you want to delete <strong>{deleteName}</strong>? This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner dark /> : "Delete"}
          </button>
          <button className="btn-cancel" onClick={() => setDeleteOpen(false)}>Cancel</button>
        </div>
      </Modal>

      <Footer />
    </>
  );
}