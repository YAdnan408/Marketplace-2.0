import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProducts } from "../../api/products";
import { getSellerOrders } from "../../api/orders";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats] = useState({ total: "—", inStock: "—", orders: "—" });

  useEffect(() => {
    Promise.all([getProducts(), getSellerOrders()]).then(([prods, orders]) => {
      setStats({
        total:   prods.length,
        inStock: prods.filter((p) => p.stock_quantity > 0).length,
        orders:  orders.length,
      });
    }).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="seller-hero">
        <div className="seller-hero-content">
          <div className="hero-badge">🏪 Seller Dashboard</div>
          <h1 className="seller-hero-title">
            Welcome back,<br />
            <span className="hero-title-accent">{user?.name}</span> 👋
          </h1>
          <p className="seller-hero-subtitle">
            Manage your listings, track your sales, and grow your storefront —
            all from one place.
          </p>
          <div className="hero-cta-group">
            <Link to="/seller/products" className="hero-btn-primary">My Products →</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.total}</span>
              <span className="hero-stat-label">My Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.inStock}</span>
              <span className="hero-stat-label">In Stock</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.orders}</span>
              <span className="hero-stat-label">Orders</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob" />
          <div className="hero-cards-float">
            <div className="hero-float-card hero-float-card-1"><span>📦</span><div><strong>My Products</strong><p>Manage listings</p></div></div>
            <div className="hero-float-card hero-float-card-2"><span>🧾</span><div><strong>Orders</strong><p>View received</p></div></div>
            <div className="hero-float-card hero-float-card-3"><span>📊</span><div><strong>Analytics</strong><p>Coming soon</p></div></div>
            <div className="hero-center-icon">🏪</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="seller-actions-section">
        <div className="section-container">
          <h2 className="section-title">Quick Actions</h2>
          <p className="section-subtitle">Everything you need to manage your storefront</p>
          <div className="seller-cards-grid">

            <div className="seller-action-card" onClick={() => navigate("/seller/products")}>
              <div className="seller-action-icon">📦</div>
              <div className="seller-action-body">
                <h3>My Products</h3>
                <p>Add, update, and delete your product listings.</p>
              </div>
              <div className="seller-action-arrow">→</div>
            </div>

            <div className="seller-action-card" onClick={() => navigate("/seller/orders")}>
              <div className="seller-action-icon">🧾</div>
              <div className="seller-action-body">
                <h3>Orders Received</h3>
                <p>View and manage incoming customer orders.</p>
              </div>
              <div className="seller-action-arrow">→</div>
            </div>

            <div className="seller-action-card seller-action-card-disabled">
              <div className="seller-action-icon">📊</div>
              <div className="seller-action-body">
                <h3>Sales Overview</h3>
                <p>Track revenue and sales performance.</p>
              </div>
              <span className="seller-action-badge">Soon</span>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}