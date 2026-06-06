import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onAddToCart }) {
  // Navigate to product detail on card click
  const navigate = useNavigate();

  const handleClick = () => navigate(`/product/${product.id}`);

  return (
    <div className="featured-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      <div className="featured-card-img">
        {product.image_name ? (
          <img src={`/uploads/product_images/${product.image_name}`} alt={product.name} />
        ) : (
          <div className="featured-card-no-img">📷</div>
        )}
      </div>
      <div className="featured-card-body">
        <div className="featured-card-cat">{product.category_name || "Uncategorized"}</div>
        <h4 className="featured-card-name">{product.name}</h4>
        <p className="featured-card-desc">{product.description || "No description provided."}</p>
        <div className="featured-card-footer">
          <span className="featured-card-price">
            ৳{parseFloat(product.price).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </span>
          {onAddToCart && (
            <span
              className={`featured-card-stock${product.stock_quantity === 0 ? " out" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (product.stock_quantity > 0) onAddToCart(product);
              }}
              style={{ cursor: product.stock_quantity === 0 ? "not-allowed" : "pointer" }}
            >
              {product.stock_quantity === 0 ? "Out of Stock" : "+ Cart"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}