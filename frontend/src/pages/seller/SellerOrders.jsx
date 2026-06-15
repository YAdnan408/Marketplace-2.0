import { useState, useEffect } from "react";
import { getSellerOrders, updateOrderStatus } from "../../api/orders";
import { getImageUrl } from "../../api/utils";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";

const STATUSES = ["pending", "approved", "shipped", "delivered", "cancelled"];
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function SellerOrders() {
  const [allOrders, setAllOrders]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [selectedOrder, setSelected]  = useState(null);
  const [newStatus, setNewStatus]     = useState("pending");
  const [modalError, setModalError]   = useState("");
  const [updating, setUpdating]       = useState(false);

  useEffect(() => {
    getSellerOrders().then((data) => { setAllOrders(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter ? allOrders.filter((o) => o.status === filter) : allOrders;

  const openModal = (order) => { setSelected(order); setNewStatus(order.status); setModalError(""); setModalOpen(true); };

  const handleUpdate = async () => {
    setUpdating(true); setModalError("");
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      setAllOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      setModalOpen(false);
    } catch (err) {
      setModalError(err.response?.data?.error?.message || "Failed to update status.");
    } finally { setUpdating(false); }
  };

  return (
    <>
      <Navbar backTo="/seller/dashboard" backLabel="← Dashboard" />

      <div className="seller-orders-page">
        <div className="seller-orders-header">
          <div>
            <h2 className="seller-orders-title">Orders Received</h2>
            <span className="seller-orders-count">
              {loading ? "" : `${filtered.length} order${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Filter pills */}
          <div className="seller-orders-filter">
            <label className="seller-filter-label">Filter by status</label>
            <div className="seller-filter-pills">
              {["", ...STATUSES].map((s) => (
                <button
                  key={s}
                  className={`seller-filter-pill${filter === s ? " active" : ""}`}
                  onClick={() => setFilter(s)}
                >
                  {s === "" ? "All" : capitalise(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="seller-orders-loading"><div className="loading-spinner" /><p>Loading orders…</p></div>
        )}

        {!loading && allOrders.length === 0 && (
          <div className="seller-orders-empty">
            <span>🧾</span>
            <h3>No orders yet</h3>
            <p>When customers purchase your products, their orders will appear here.</p>
          </div>
        )}

        {!loading && allOrders.length > 0 && filtered.length === 0 && (
          <div className="seller-orders-none"><span>🔍</span><p>No orders match this filter.</p></div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="seller-orders-list">
            {filtered.map((order) => (
              <div className="seller-order-card" key={order.id}>
                <div className="seller-order-header">
                  <div className="seller-order-meta">
                    <span className="seller-order-id">Order #{order.id}</span>
                    <span className="seller-order-date">{order.created_at}</span>
                  </div>
                  <div className="seller-order-right-meta">
                    <span className={`order-status order-status-${order.status}`}>{capitalise(order.status)}</span>
                    <button className="seller-update-status-btn" onClick={() => openModal(order)}>✎ Update</button>
                  </div>
                </div>

                <div className="seller-order-customer">
                  <span className="seller-order-customer-label">Customer</span>
                  <span className="seller-order-customer-name">
                    {order.customer_name}
                    <span className="seller-order-customer-email">{order.customer_email}</span>
                  </span>
                </div>

                <div className="seller-order-items">
                  {order.items.map((item) => (
                    <div className="seller-order-item-row" key={item.product_id}>
                      <div className="seller-order-item-img">
                        {item.image_name
                          ? <img src={getImageUrl(item.image_name, "product")} alt={item.product_name} />
                          : <span>📷</span>}
                      </div>
                      <div className="seller-order-item-info">
                        <span className="seller-order-item-name">{item.product_name}</span>
                        <span className="seller-order-item-qty">
                          {item.quantity} × ৳{item.unit_price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <span className="seller-order-item-subtotal">
                        ৳{item.subtotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="seller-order-footer">
                  <div className="seller-order-shipping">
                    <span className="seller-order-shipping-label">Ship to</span>
                    <span className="seller-order-shipping-addr">{order.shipping_address.replace(/\n/g, ", ")}</span>
                  </div>
                  <div className="seller-order-total">
                    <span>Order Total</span>
                    <strong>৳{order.total_price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Update Order Status" size="sm">
        <p className="seller-modal-order-id">Order #{selectedOrder?.id}</p>
        {modalError && <div className="error-msg" style={{ marginTop: 12 }}>{modalError}</div>}
        <div className="field-group" style={{ marginTop: 16 }}>
          <label>New Status</label>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{capitalise(s)}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={handleUpdate} disabled={updating}>
            {updating ? <Spinner /> : "Update Status"}
          </button>
          <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>

      <Footer />
    </>
  );
}
