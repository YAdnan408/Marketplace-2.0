import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cartCount } from "../hooks/useCart";
import { useState, useEffect } from "react";

export default function Navbar({ showSearch, onSearch, backTo, backLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(cartCount());

  useEffect(() => {
    const refresh = () => setCount(cartCount());
    window.addEventListener("cartUpdated", refresh);
    return () => window.removeEventListener("cartUpdated", refresh);
  }, []);

  const handleLogout = async () => {
    // logout() calls POST /api/logout to clear the httpOnly cookies on the
    // backend, then clears user state in AuthContext. No setAuthToken needed.
    await logout();
    navigate("/login");
  };

  const isCustomer = user?.user_type === "customer";

  return (
    <nav className="navbar">
      <div className="nav-brand">🛍 Marketplace</div>
      <div className="nav-actions">
        {showSearch && (
          <div className="nav-search-wrap">
            <span className="nav-search-icon">🔍</span>
            <input
              type="text"
              className="nav-search"
              placeholder="Search products…"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}

        {backTo && (
          <Link to={backTo} className="nav-back">{backLabel || "← Back"}</Link>
        )}

        {isCustomer && (
          <>
            <Link to="/orders" className="nav-back">🧾 My Orders</Link>
            <Link to="/cart" className="nav-icon nav-cart-icon" title="Cart">
              🛒
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          </>
        )}

        <Link to="/profile" className="nav-icon" title="Profile">👤</Link>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}