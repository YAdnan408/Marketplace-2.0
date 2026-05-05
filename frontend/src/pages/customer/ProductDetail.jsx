import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductDetail } from "../../api/products";
import { addToCart, getCart } from "../../hooks/useCart";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [qty, setQty]         = useState(1);
  const [added, setAdded]     = useState(false);

  useEffect(() => {
    getProductDetail(Number(id))
      .then((p) => { setProduct(p); setLoading(false); })
      .catch(() => { setError("Product not found."); setLoading(false); });
  }, [id]);

  const inCart = product ? getCart().find((i) => i.id === product.id) : null;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const formatDate = (s) => s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

  if (loading) return <><Navbar /><div className="pd-loading"><div className="loading-spinner" /><p>Loading product…</p></div></>;
  if (error)   return <><Navbar /><div className="pd-error"><span>⚠️</span><p>{error}</p><Link to="/customer/products" className="hero-btn-primary">Back to Products</Link></div></>;

  return (
    <>
      <Navbar backTo="/customer/products" backLabel="← Back to Products" />

      <div className="pd-breadcrumb-wrap">
        <div className="pd-breadcrumb">
          <Link to="/customer/dashboard">Home</Link>
          <span className="pd-breadcrumb-sep">›</span>
          <Link to="/customer/products">Products</Link>
          <span className="pd-breadcrumb-sep">›</span>
          <span>{product.name}</span>
        </div>
      </div>

      <main className="pd-main">
        <div className="pd-layout">
          {/* Image */}
          <div className="pd-image-panel">
            <div className="pd-image-wrap">
              {product.image_name
                ? <img className="pd-image" src={`/uploads/product_images/${product.image_name}`} alt={product.name} />
                : <div className="pd-image-placeholder">📷</div>}
            </div>
            <div className="pd-image-badge">{product.category_name}</div>
          </div>

          {/* Info */}
          <div className="pd-info-panel">
            <div className="pd-info-top">
              <span className="pd-category">{product.category_name}</span>
              <h1 className="pd-title">{product.name}</h1>
              <div className="pd-price-row">
                <span className="pd-price">৳{parseFloat(product.price).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
                <span className={`pd-stock-badge${product.stock_quantity === 0 ? " out" : product.stock_quantity <= 5 ? " low" : " in"}`}>
                  {product.stock_quantity === 0 ? "Out of Stock" : product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left!` : "In Stock"}
                </span>
              </div>
            </div>

            <div className="pd-divider" />

            <div className="pd-section">
              <h3 className="pd-section-label">Description</h3>
              <p className="pd-description">{product.description || "No description provided."}</p>
            </div>

            <div className="pd-divider" />

            <div className="pd-section">
              <h3 className="pd-section-label">Product Details</h3>
              <div className="pd-details-grid">
                {[
                  ["Category", product.category_name],
                  ["Stock", product.stock_quantity > 0 ? `${product.stock_quantity} units` : "Out of stock"],
                  ["Listed on", formatDate(product.created_at)],
                  ["Product ID", `#${product.id}`],
                ].map(([k, v]) => (
                  <div className="pd-detail-item" key={k}>
                    <span className="pd-detail-key">{k}</span>
                    <span className="pd-detail-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-divider" />

            <div className="pd-section">
              <h3 className="pd-section-label">Sold by</h3>
              <div className="pd-seller-card">
                <div className="pd-seller-avatar">
                  {product.seller_image
                    ? <img src={`/uploads/profile_images/${product.seller_image}`} alt={product.seller_name} />
                    : <span>{product.seller_name?.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="pd-seller-info">
                  <span className="pd-seller-name">{product.seller_name}</span>
                  <span className="pd-seller-meta">{product.seller_email}</span>
                </div>
                <span className="pd-seller-verified">✓ Verified</span>
              </div>
            </div>

            <div className="pd-divider" />

            <div className="pd-cta-row">
              <div className="pd-qty-wrap">
                <button className="pd-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <span className="pd-qty-val">{qty}</span>
                <button className="pd-qty-btn" onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))} disabled={qty >= product.stock_quantity}>+</button>
              </div>
              <button className={`pd-add-cart-btn${added ? " cart-added" : ""}`} onClick={handleAddToCart} disabled={product.stock_quantity === 0}>
                {added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
              </button>
            </div>
            {inCart && (
              <p className="pd-cart-note in-cart" onClick={() => navigate("/cart")} style={{ cursor: "pointer" }}>
                ✓ {inCart.qty} in your cart — view cart
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}