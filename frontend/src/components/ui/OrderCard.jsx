export default function OrderCard({ order }) {
  const statusClass = `order-status order-status-${order.status}`;
  const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-card-meta">
          <span className="order-id">Order #{order.id}</span>
          <span className="order-date">{order.created_at}</span>
        </div>
        <span className={statusClass}>{capitalise(order.status)}</span>
      </div>

      <div className="order-items-preview">
        {order.items.map((item) => (
          <div className="order-item-row" key={item.product_id}>
            <div className="order-item-img">
              {item.image_name ? (
                <img src={`/uploads/product_images/${item.image_name}`} alt={item.product_name} />
              ) : (
                <span>📷</span>
              )}
            </div>
            <div className="order-item-info">
              <span className="order-item-name">{item.product_name}</span>
              <span className="order-item-qty">
                Qty: {item.quantity} ×{" "}
                ৳{item.unit_price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="order-item-subtotal">
              ৳{item.subtotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      <div className="order-card-footer">
        <div className="order-shipping">
          <span className="order-shipping-label">Shipping to:</span>
          <span className="order-shipping-addr">
            {order.shipping_address.replace(/\n/g, ", ")}
          </span>
        </div>
        <div className="order-total">
          <span>Total</span>
          <strong>৳{order.total_price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>
    </div>
  );
}