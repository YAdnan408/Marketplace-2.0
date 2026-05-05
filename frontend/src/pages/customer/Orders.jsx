import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getCustomerOrders } from "../../api/orders";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import OrderCard from "../../components/ui/OrderCard";

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const newOrderId = searchParams.get("new");

  useEffect(() => {
    getCustomerOrders().then((data) => {
      setOrders(data);
      setLoading(false);
      // Clean URL after showing banner
      if (newOrderId) {
        setTimeout(() => setSearchParams({}), 100);
      }
    });
  }, []);

  return (
    <>
      <Navbar backTo="/customer/dashboard" backLabel="← Home" />

      <div className="orders-page">
        <div className="orders-header">
          <h2 className="orders-title">My Orders</h2>
          {!loading && (
            <span className="orders-count">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Success banner after checkout */}
        {newOrderId && (
          <div className="order-success-banner">
            <span className="order-success-icon">✅</span>
            <div>
              <strong>Order #{newOrderId} placed successfully!</strong>
              <p>We've received your order. It will be processed shortly.</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="orders-loading">
            <div className="loading-spinner" />
            <p>Loading your orders…</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="orders-empty">
            <span>📦</span>
            <h3>No orders yet</h3>
            <p>Once you place an order, it will appear here.</p>
            <Link to="/customer/dashboard" className="hero-btn-primary">Start Shopping</Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div
                key={order.id}
                className={String(newOrderId) === String(order.id) ? "order-card-new" : ""}
              >
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}