import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch,
  FiSliders,
  FiShoppingCart,
  FiStar,
  FiCheck,
  FiHeart,
  FiX,
  FiPackage,
  FiChevronDown,
} from "react-icons/fi";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Zap,
  Sparkles,
} from "lucide-react";
import "../styles/product.css";

// Images apne public folder mein rakhein, jaise public/products/ssd.jpg
const PRODUCTS = [
  {
    id: 1,
    name: "1TB SSD M.2 2280",
    brand: "Branded Pulled",
    category: "Storage",
    description: "Adata M.2 2280 Legend 710 1TB SSD Health 100%",
    price: 36999,
    oldPrice: 39999,
    stock: 2,
    featured: true,
    image: "/products/ssd.jpg",
  },
  {
    id: 2,
    name: "3-in-1 Mini Dp Tunderbolt to HDMI/VGA/DVI",
    brand: "Branded_Refurbished",
    category: "Adapters",
    description:
      "SWEES 3-in-1 Mini DisplayPort (Mini DP) Thunderbolt to HDMI/VGA/DVI Adapter Cable Converter Full HD 1080p",
    price: 2999,
    oldPrice: 4999,
    stock: 5,
    featured: true,
    image: "/products/mini-dp.jpg",
  },
  {
    id: 3,
    name: "4K Hdmi to Display Port Converter",
    brand: "Tripp Lite Refurbished",
    category: "Adapters",
    description:
      "TRIPP LITE 4K HDMI to DisplayPort Video Converter w/USB Power, Male-to-Female, 4Kx2K @ 30Hz HDMI to DisplayPort",
    price: 4999,
    oldPrice: 6999,
    stock: 0,
    featured: true,
    image: "/products/hdmi-dp.jpg",
  },
  {
    id: 4,
    name: "Acer Aspire V5 V5-431 MS2361 V5-471P V5-471G V5-571G V5-571P AL12A72 4 Cell Battery",
    brand: "ACER",
    category: "Batteries",
    description:
      "Acer Aspire V5 V5-431 MS2361 V5-471P V5-471G V5-571G V5-571P AL12A72 4 Cell Laptop Battery",
    price: 4800,
    oldPrice: 5999.99,
    stock: 12,
    featured: true,
    image: "/products/acer-battery.jpg",
  },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
  { value: "discount", label: "Biggest discount" },
];

const money = (n) =>
  `PKR ${Number(n).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;

const discountPercent = (p) =>
  p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

const cleanBrand = (b) => b.replace(/_/g, " ");

// Hero stats (products ke data se khud calculate hote hain)
const STATS = {
  total: PRODUCTS.length,
  inStock: PRODUCTS.filter((p) => p.stock > 0).length,
  maxOff: Math.max(...PRODUCTS.map(discountPercent)),
};

function ProductCard({ product, index, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const saved = product.oldPrice - product.price;

  const handleAdd = () => {
    onAddToCart?.(product);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article
      className={`pcard${outOfStock ? " pcard--out" : ""}`}
      style={{ "--i": index }}
    >
      <div className="pcard__media">
        {imgFailed ? (
          <div className="pcard__placeholder" aria-hidden="true">
            <FiPackage size={44} />
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}

        <div className="pcard__badges">
          {product.featured && (
            <span className="badge badge--featured">
              <Sparkles size={11} /> Featured
            </span>
          )}
          {discount > 0 && <span className="badge badge--discount">{discount}% off</span>}
        </div>

        <button
          type="button"
          className={`pcard__like${liked ? " is-active" : ""}`}
          aria-pressed={liked}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setLiked((v) => !v)}
        >
          <FiHeart size={16} />
        </button>

        {outOfStock && <span className="pcard__soldout">Out of stock</span>}
      </div>

      <div className="pcard__body">
        <div className="pcard__meta">
          <span className="pcard__brand">{cleanBrand(product.brand)}</span>
          <span className="pcard__cat">{product.category}</span>
        </div>

        <h3 className="pcard__name" title={product.name}>
          {product.name}
        </h3>
        <p className="pcard__desc">{product.description}</p>

        <div className="pcard__stock">
          {outOfStock ? (
            <span className="stockline stockline--out">Currently unavailable</span>
          ) : lowStock ? (
            <>
              <span className="stockline stockline--low">Only {product.stock} left</span>
              <span className="meter" aria-hidden="true">
                <span style={{ width: `${(product.stock / 5) * 100}%` }} />
              </span>
            </>
          ) : (
            <span className="stockline stockline--ok">In stock</span>
          )}
        </div>

        <div className="pcard__price">
          <div className="pcard__price-row">
            <strong>{money(product.price)}</strong>
            {discount > 0 && <s>{money(product.oldPrice)}</s>}
          </div>
          {saved > 0 && <span className="pcard__save">You save {money(saved)}</span>}
        </div>

        <button
          type="button"
          className={`pcard__btn${added ? " is-added" : ""}`}
          disabled={outOfStock}
          onClick={handleAdd}
        >
          {outOfStock ? (
            "Out of stock"
          ) : added ? (
            <>
              <FiCheck size={16} /> Added to cart
            </>
          ) : (
            <>
              <FiShoppingCart size={16} /> Add to cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default function Products({ onAddToCart = (p) => console.log("Added:", p.name) }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  const categories = useMemo(() => {
    const counts = PRODUCTS.reduce(
      (acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }),
      {}
    );
    return [
      { value: "all", label: "All", count: PRODUCTS.length },
      ...Object.entries(counts).map(([value, count]) => ({ value, label: value, count })),
    ];
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const matchesText =
        !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchesCat = category === "all" || p.category === category;
      return matchesText && matchesCat;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "discount":
        list = [...list].sort((a, b) => discountPercent(b) - discountPercent(a));
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [query, category, sort]);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("featured");
  };

  return (
    <section className="products">
      <header className="products__head">
        <div className="products__head-inner">
          <h1>Our Tech Collection</h1>
          <p>Explore the latest in laptops, peripherals, and more.</p>

          <ul className="stats">
            <li>
              <strong>{STATS.total}</strong> products
            </li>
            <li>
              <strong>{STATS.inStock}</strong> in stock
            </li>
            {STATS.maxOff > 0 && (
              <li>
                Up to <strong>{STATS.maxOff}%</strong> off
              </li>
            )}
          </ul>
        </div>
      </header>

      <div className="products__body">
        <div className="dock">
          <div className="dock__row">
            <label className="field field--search">
              <FiSearch className="field__icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search products or brands"
                aria-label="Search products or brands"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="field__clear"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <FiX size={14} />
                </button>
              )}
            </label>

            <label className="field field--select">
              <FiSliders className="field__icon" aria-hidden="true" />
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="field__chev" aria-hidden="true" />
            </label>
          </div>

          <div className="chips" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`chip${category === c.value ? " is-active" : ""}`}
                aria-pressed={category === c.value}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
                <span className="chip__count">{c.count}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="products__count" aria-live="polite">
          Showing <strong>{visible.length}</strong> {visible.length === 1 ? "product" : "products"}
        </p>

        {visible.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">
              <FiSearch size={24} />
            </span>
            <h2>No products match your search</h2>
            <p>Check the spelling, try a shorter keyword, or switch to another category.</p>
            <button type="button" className="empty__btn" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="products__grid">
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
