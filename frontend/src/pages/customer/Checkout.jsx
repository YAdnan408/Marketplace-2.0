import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/utils";
import { getCart, clearCart, cartTotal } from "../../hooks/useCart";
import { getProfile } from "../../api/auth";
import { placeOrder } from "../../api/orders";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Spinner from "../../components/ui/Spinner";

export default function Checkout() {
  const location = useLocation();
  const navigate  = useNavigate();
  const shippingCost = location.state?.shippingCost ?? 0;

  const [items, setItems]     = useState(getCart());
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((p) => {
      if (p.name)         setName(p.name);
      if (p.phone_number) setPhone(p.phone_number);
      if (p.address)      setAddress(p.address);
    }).catch(() => {});
  }, []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cartTotal();
  const total      = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    setError("");
    if (!name.trim())    { setError("Please enter your full name."); return; }
    if (!address.trim()) { setError("Please enter your delivery address."); return; }
    if (!items.length)   { setError("Your cart is empty."); return; }

    const fullAddress = `${name}\n${phone}\n${address}`.trim();
    setLoading(true);

    try {
      const res = await placeOrder(items, fullAddress, shippingCost);
      clearCart();
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      navigate(`/orders?new=${res.order.order_id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Order could not be placed.");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) return (
    <>
      <Navbar backTo="/cart" backLabel="← Back to Cart" />
      <div className="checkout-page">
        <div className="checkout-empty">
          <span>🛒</span>
          <h3>Your cart is empty</h3>
          <p>Add products before proceeding to checkout.</p>
          <Link to="/customer/dashboard" className="hero-btn-primary">Start Shopping</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar backTo="/cart" backLabel="← Back to Cart" />

      <div className="checkout-page">
        <div className="checkout-header">
          <h2 className="checkout-title">Checkout</h2>
          <div className="checkout-steps">
            <span className="checkout-step active">1. Shipping</span>
            <span className="checkout-step-sep">›</span>
            <span className="checkout-step">2. Confirm</span>
            <span className="checkout-step-sep">›</span>
            <span className="checkout-step">3. Done</span>
          </div>
        </div>

        <div className="checkout-layout">
          {/* Left: Shipping */}
          <div className="checkout-left">
            <div className="checkout-section">
              <h3 className="checkout-section-title">📦 Shipping Details</h3>
              {error && <div className="error-msg">{error}</div>}
              <div className="field-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Phone Number</label>
                <input type="text" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Delivery Address</label>
                <textarea rows="3" placeholder="House, Road, Block, Area, City" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="checkout-use-profile">
                <button type="button" className="checkout-use-profile-btn" onClick={() =>
                  getProfile().then((p) => { setName(p.name || ""); setPhone(p.phone_number || ""); setAddress(p.address || ""); })
                }>
                  📋 Use my profile address
                </button>
              </div>
            </div>

            <div className="checkout-section">
              <h3 className="checkout-section-title">💳 Payment Method</h3>
              <div className="checkout-payment-options">
                <label className="checkout-payment-option checkout-payment-selected">
                  <input type="radio" name="payment" value="cod" defaultChecked />
                  <span className="checkout-payment-icon">💵</span>
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when your order arrives</p>
                  </div>
                  <span className="checkout-payment-check">✓</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="checkout-right">
            <div className="checkout-summary-card">
              <h3 className="checkout-section-title">🧾 Order Summary</h3>
              <div className="checkout-items-list">
                {items.map((item) => (
                  <div className="checkout-item" key={item.id}>
                    <div className="checkout-item-img">
                      {item.image_name
                        ? <img src={getImageUrl(item.image_name, "product")} alt={item.name} />
                        : <span>📷</span>}
                    </div>
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-qty">Qty: {item.qty}</span>
                    </div>
                    <span className="checkout-item-price">
                      ৳{(item.price * item.qty).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>৳{subtotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? "cart-shipping-free" : ""}>
                  {shippingCost === 0 ? "Free" : `৳${shippingCost}`}
                </span>
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total</span>
                <span>৳{total.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
              </div>
              <button className="checkout-place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? <><Spinner /> Placing order…</> : "Place Order →"}
              </button>
              <p className="checkout-terms">By placing your order, you agree to our terms. All prices are in BDT (৳).</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
