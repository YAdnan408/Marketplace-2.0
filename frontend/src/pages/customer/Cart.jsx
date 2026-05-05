import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, removeFromCart, updateCartQty, clearCart, cartTotal } from "../../hooks/useCart";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const SHIPPING = { inside_dhaka: 60, outside_dhaka: 120 };

export default function Cart() {
  const [items, setItems]       = useState(getCart());
  const [zone, setZone]         = useState("");
  const navigate = useNavigate();

  const refresh = (newItems) => {
    setItems(newItems);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const totalItems  = items.reduce((s, i) => s + i.qty, 0);
  const subtotal    = cartTotal();
  const shipping    = zone ? SHIPPING[zone] : null;
  const total       = shipping != null ? subtotal + shipping : subtotal;

  const handleClear = () => {
    if (window.confirm("Clear your entire cart?")) { clearCart(); refresh([]); }
  };

  if (items.length === 0) return (
    <>
      <Navbar backTo="/customer/dashboard" backLabel="← Continue Shopping" />
      <div className="cart-page">
        <div className="cart-header"><h2 className="cart-title">My Cart</h2></div>
        <div className="cart-empty">
          <span className="cart-empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Browse products and add something you like.</p>
          <Link to="/customer/dashboard" className="hero-btn-primary">Start Shopping</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar backTo="/customer/dashboard" backLabel="← Continue Shopping" />
      <div className="cart-page">
        <div className="cart-header">
          <h2 className="cart-title">My Cart</h2>
          <span className="cart-item-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
        </div>
        <div className="cart-content">
          {/* Items */}
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.image_name
                    ? <img src={`/uploads/product_images/${item.image_name}`} alt={item.name} />
                    : <div className="cart-item-no-image">📷</div>}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-category">{item.category_name}</div>
                  <h4 className="cart-item-name">{item.name}</h4>
                  <div className="cart-item-price">৳{item.price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="cart-item-controls">
                  <div className="cart-qty-wrap">
                    <button className="cart-qty-btn" disabled={item.qty <= 1} onClick={() => refresh(updateCartQty(item.id, item.qty - 1))}>−</button>
                    <span className="cart-qty-val">{item.qty}</span>
                    <button className="cart-qty-btn" disabled={item.qty >= item.stock_quantity} onClick={() => refresh(updateCartQty(item.id, item.qty + 1))}>+</button>
                  </div>
                  <div className="cart-item-subtotal">৳{(item.price * item.qty).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</div>
                  <button className="cart-remove-btn" onClick={() => refresh(removeFromCart(item.id))}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>
            <div className="cart-summary-row">
              <span>Subtotal ({totalItems} items)</span>
              <span>৳{subtotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="cart-shipping-zone">
              <label className="cart-shipping-label" htmlFor="shippingZone">📍 Delivery Location</label>
              <select className="cart-shipping-select" id="shippingZone" value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value="">— Select your location —</option>
                <option value="inside_dhaka">Inside Dhaka</option>
                <option value="outside_dhaka">Outside Dhaka</option>
              </select>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span className="cart-shipping-value">
                {zone ? `৳${SHIPPING[zone]}` : "—"}
              </span>
            </div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>৳{total.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
            </div>
            {!zone && <p className="cart-shipping-hint">Please select your delivery location to calculate shipping.</p>}
            <Link
              to="/checkout"
              className="cart-checkout-btn"
              state={{ shippingCost: shipping || 0, zone }}
            >
              Proceed to Checkout →
            </Link>
            <button className="cart-clear-btn" onClick={handleClear}>🗑 Clear Cart</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}