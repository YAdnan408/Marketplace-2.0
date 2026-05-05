import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../../api/products";
import { addToCart } from "../../hooks/useCart";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ui/ProductCard";

const CATEGORIES = [
  { id: "", label: "All", icon: "✦" },
  { id: "1", label: "Smartphones", icon: "📱" },
  { id: "2", label: "Laptops", icon: "💻" },
  { id: "3", label: "Clothing", icon: "👕" },
  { id: "4", label: "Musical Instruments", icon: "🎸" },
  { id: "5", label: "Books & Stationery", icon: "📚" },
  { id: "6", label: "Sports & Fitness", icon: "🏋️" },
];

export default function CustomerProducts() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort]         = useState("default");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  useEffect(() => {
    getProducts().then((p) => { setProducts(p); setLoading(false); });
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (category) list = list.filter((p) => String(p.category_id) === category);
    if (search)   list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (priceMin) list = list.filter((p) => parseFloat(p.price) >= parseFloat(priceMin));
    if (priceMax) list = list.filter((p) => parseFloat(p.price) <= parseFloat(priceMax));
    if (sort === "price_asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name_asc")   list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name_desc")  list.sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [products, category, search, priceMin, priceMax, sort]);

  return (
    <>
      <Navbar backTo="/customer/dashboard" backLabel="← Home" />

      {/* Category strip */}
      <section className="category-strip">
        <div className="category-strip-inner">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`category-pill${category === cat.id ? " active" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </div>
          ))}
        </div>
      </section>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <div className="filter-group">
            <span className="filter-label">Price Range (৳)</span>
            <div className="filter-price-inputs">
              <input className="filter-price-input" type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
              <span className="filter-price-sep">–</span>
              <input className="filter-price-input" type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
            </div>
          </div>
          <div className="filter-group filter-group-sort">
            <span className="filter-label">Sort By</span>
            <select className="filter-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A–Z</option>
              <option value="name_desc">Name: Z–A</option>
            </select>
          </div>
          {(priceMin || priceMax || category || search) && (
            <button className="filter-clear-btn" onClick={() => { setPriceMin(""); setPriceMax(""); setCategory(""); setSearch(""); }}>✕ Clear Filters</button>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="products-page">
        <div className="products-page-inner">
          <div className="products-page-header">
            <div>
              <h2 className="products-page-title">All Products</h2>
              <span className="products-page-count">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <input className="browse-search" type="text" placeholder="🔍  Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {loading ? (
            <div className="featured-loading"><div className="loading-spinner" /><span>Loading products…</span></div>
          ) : (
            <div className="featured-grid">
              {filtered.map((p) => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}