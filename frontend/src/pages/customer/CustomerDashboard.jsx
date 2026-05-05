import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProducts, getCategories } from "../../api/products";
import { addToCart } from "../../hooks/useCart";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ui/ProductCard";

const CATEGORY_ICONS = { 1: "📱", 2: "💻", 3: "👕", 4: "🎸", 5: "📚", 6: "🏋️" };

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const featured = products
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  return (
    <>
      <Navbar showSearch onSearch={setSearch} />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">✨ New arrivals every week</div>
          <h1 className="hero-title">
            Your everyday<br />
            <span className="hero-title-accent">marketplace</span><br />
            reimagined.
          </h1>
          <p className="hero-subtitle">
            Discover thousands of products from trusted local sellers —
            fashion, electronics, books &amp; more, all in one place.
          </p>
          <div className="hero-cta-group">
            <a href="#featured" className="hero-btn-primary">Shop Now</a>
            <a href="#categories" className="hero-btn-secondary">Browse Categories</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{products.length || "—"}</span>
              <span className="hero-stat-label">Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{categories.length || 6}</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Local Sellers</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob" />
          <div className="hero-cards-float">
            <div className="hero-float-card hero-float-card-1"><span>📱</span><div><strong>Smartphones</strong><p>Top deals</p></div></div>
            <div className="hero-float-card hero-float-card-2"><span>👕</span><div><strong>Fashion</strong><p>New arrivals</p></div></div>
            <div className="hero-float-card hero-float-card-3"><span>📚</span><div><strong>Books</strong><p>Best sellers</p></div></div>
            <div className="hero-center-icon">🛍</div>
          </div>
        </div>
      </section>

      {/* Category Strip */}
      <section className="categories-section" id="categories">
        <div className="section-container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="category-strip">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/customer/products?category=${cat.id}`} className="category-pill-link">
                <div className="category-pill">
                  <span>{CATEGORY_ICONS[cat.id] || "🏷"}</span>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section" id="featured">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked from our latest listings</p>
            </div>
            {products.length > 8 && (
              <Link to="/customer/products" className="see-more-btn">See All Products →</Link>
            )}
          </div>
          {loading ? (
            <div className="featured-loading"><div className="loading-spinner" /><p>Loading products…</p></div>
          ) : (
            <div className="featured-grid">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}