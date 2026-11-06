import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  FiSearch,
  FiSliders,
  FiShoppingCart,
  FiCheck,
  FiHeart,
  FiX,
  FiPackage,
  FiChevronDown,
  FiTrash2,
  FiArrowUpRight,
} from "react-icons/fi";

import { Sparkles, Laptop, Cpu, Keyboard, Headphones } from "lucide-react";
import { useCart } from "../context/CartContext";
import "../styles/product.css";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
  { value: "discount", label: "Biggest discount" },
  { value: "newest", label: "Newest first" },
];

const STOCK_OPTIONS = [
  { value: "all", label: "All Stock" },
  { value: "in-stock", label: "In Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

const money = (n) =>
  `PKR ${Number(n || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;

const discountPercent = (product) => {
  const oldPrice = Number(product.oldPrice || 0);
  const price = Number(product.price || 0);

  return oldPrice > price
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
};

const cleanBrand = (brand) =>
  String(brand || "").replace(/_/g, " ");

function ProductCard({
  product,
  index,
  cartItems,
  wishlist,
  onToggleWishlist,
  onOpenWishlist,
}) {
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const discount = discountPercent(product);

  const saved =
    Number(product.oldPrice || 0) - Number(product.price || 0);

  const cartProduct = cartItems.find(
    (item) => String(item.id) === String(product.id)
  );

  const cartQuantity = Number(cartProduct?.quantity || 0);
  const stock = Number(product.stock ?? 0);

  const outOfStock = stock <= 0;

  const stockLimitReached =
    cartQuantity >= stock && !outOfStock;

  const disabled = outOfStock || stockLimitReached;

  const remainingStock = Math.max(stock - cartQuantity, 0);

  const lowStock = remainingStock > 0 && remainingStock <= 5;

  const liked = wishlist.some(
    (item) => String(item.id) === String(product.id)
  );

  const handleAdd = () => {
    if (disabled) return;

    window.dispatchEvent(
      new CustomEvent("smartteq:add-to-cart", {
        detail: { product },
      })
    );

    setAdded(true);
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleWishlist = () => {
    onToggleWishlist(product);
    onOpenWishlist();
  };

  return (
    <article
      className={`pcard${outOfStock ? " pcard--out" : ""}`}
      style={{ "--i": index }}
    >
      <div className="pcard__media">
        <Link
          to={`/product/${product.id}`}
          className="pcard__media-link"
          aria-label={`View ${product.name} details`}
        >
          {imgFailed || !product.image ? (
            <div className="pcard__placeholder">
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
        </Link>

        <div className="pcard__badges">
          {product.featured && (
            <span className="badge badge--featured">
              <Sparkles size={12} /> Featured
            </span>
          )}

          {discount > 0 && (
            <span className="badge badge--discount">
              {discount}% off
            </span>
          )}
        </div>

        <button
          type="button"
          className={`pcard__like${liked ? " is-active" : ""}`}
          aria-pressed={liked}
          aria-label={
            liked ? "Remove from wishlist" : "Add to wishlist"
          }
          onClick={handleWishlist}
        >
          <FiHeart size={17} />
        </button>

        {outOfStock && (
          <span className="pcard__soldout">Out of stock</span>
        )}

        {/* Hover par neeche se upar aane wala shortcut (same product link) */}
        <Link
          to={`/product/${product.id}`}
          className="pcard__quick"
          tabIndex={-1}
          aria-hidden="true"
        >
          View details <FiArrowUpRight size={16} />
        </Link>
      </div>

      <div className="pcard__body">
        <div className="pcard__meta">
          <span className="pcard__brand">
            {cleanBrand(product.brand)}
          </span>

          <span className="pcard__cat">{product.category}</span>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="pcard__name-link"
        >
          <h3 className="pcard__name" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <Link
          to={`/product/${product.id}`}
          className="pcard__desc-link"
        >
          <p className="pcard__desc">{product.description}</p>
        </Link>

        <div className="pcard__stock">
          {outOfStock ? (
            <span className="stockline stockline--out">
              Currently unavailable
            </span>
          ) : lowStock ? (
            <>
              <span className="stockline stockline--low">
                Only {remainingStock} left
              </span>

              <span className="meter">
                <span
                  style={{
                    width: `${Math.min(
                      (remainingStock / 5) * 100,
                      100
                    )}%`,
                  }}
                />
              </span>
            </>
          ) : (
            <span className="stockline stockline--ok">
              In stock
            </span>
          )}
        </div>

        <div className="pcard__price">
          <div className="pcard__price-row">
            <strong>{money(product.price)}</strong>

            {discount > 0 && <s>{money(product.oldPrice)}</s>}
          </div>

          {saved > 0 && (
            <span className="pcard__save">
              You save {money(saved)}
            </span>
          )}
        </div>

        <button
          type="button"
          className={`pcard__btn${added ? " is-added" : ""}${disabled ? " is-disabled" : ""
            }`}
          disabled={disabled}
          onClick={handleAdd}
        >
          {outOfStock ? (
            "Out of stock"
          ) : stockLimitReached ? (
            "Stock Limit Reached"
          ) : added ? (
            <>
              <FiCheck size={16} /> Added
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

function WishlistDrawer({
  open,
  wishlist,
  onClose,
  onRemove,
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="wishlist-overlay" onClick={onClose}>
      <aside
        className="wishlist-drawer"
        onClick={(event) => event.stopPropagation()}
        aria-label="Wishlist"
      >
        <div className="wishlist-header">
          <div>
            <span className="wishlist-eyebrow">
              YOUR FAVORITES
            </span>

            <h2>
              My Wishlist
              <span>{wishlist.length}</span>
            </h2>
          </div>

          <button
            type="button"
            className="wishlist-close"
            onClick={onClose}
            aria-label="Close wishlist"
          >
            <FiX size={22} />
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <FiHeart size={42} />
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart on a product to save it here.</p>

            <button type="button" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="wishlist-items">
              {wishlist.map((product) => (
                <div className="wishlist-item" key={product.id}>
                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div className="wishlist-item-info">
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <strong>{money(product.price)}</strong>
                  </div>

                  <button
                    type="button"
                    className="wishlist-remove"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <FiTrash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            <div className="wishlist-footer">
              <p>
                {wishlist.length}{" "}
                {wishlist.length === 1 ? "product" : "products"} saved
              </p>

              <button type="button" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>

      <button
        type="button"
        className="wishlist-overlay-close"
        onClick={onClose}
        aria-label="Close wishlist"
      />
    </div>
  );
}

export default function Products() {
  const { cartItems } = useCart();

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    maxOff: 0,
  });

  const [categories, setCategories] = useState([
    { value: "all", label: "All", count: 0 },
  ]);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [category, setCategory] = useState(
    () => searchParams.get("category") || "all"
  );

  const [sort, setSort] = useState("featured");
  const [stockFilter, setStockFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("smartteq-wishlist")
        ) || []
      );
    } catch {
      return [];
    }
  });

  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Synchronize category with URL
  useEffect(() => {
    setCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  // Automatically refresh products and stock
  useEffect(() => {
    const refreshStock = () => {
      setRetryCount((count) => count + 1);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshStock();
      }
    };

    window.addEventListener("focus", refreshStock);

    window.addEventListener(
      "smartteq:stock-updated",
      refreshStock
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener("focus", refreshStock);

      window.removeEventListener(
        "smartteq:stock-updated",
        refreshStock
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  // Save wishlist
  useEffect(() => {
    localStorage.setItem(
      "smartteq-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Load products from backend API
  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (debouncedQuery) {
          params.set("search", debouncedQuery);
        }

        if (category !== "all") {
          params.set("category", category);
        }

        params.set("sort", sort);

        const response = await fetch(
          `/api/products?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load products."
          );
        }

        setProducts(
          Array.isArray(data.products) ? data.products : []
        );

        setStats({
          total: Number(data.stats?.total || 0),
          inStock: Number(data.stats?.inStock || 0),
          maxOff: Number(data.stats?.maxOff || 0),
        });

        setCategories([
          {
            value: "all",
            label: "All",
            count: Number(data.stats?.total || 0),
            units: Number(data.stats?.totalUnits || 0),
          },
          ...(Array.isArray(data.categories)
            ? data.categories
            : []),
        ]);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Products API error:", err);

        setError(
          err.message ||
          "Something went wrong while loading products."
        );

        setProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => controller.abort();
  }, [debouncedQuery, category, sort, retryCount]);

  // Client-side stock filtering
  const displayedProducts = products.filter((product) => {
    const stock = Number(product.stock ?? 0);

    if (stockFilter === "in-stock") {
      return stock > 0;
    }

    if (stockFilter === "out-of-stock") {
      return stock <= 0;
    }

    return true;
  });

  const toggleWishlist = (product) => {
    setWishlist((previous) => {
      const exists = previous.some(
        (item) => String(item.id) === String(product.id)
      );

      return exists
        ? previous.filter(
          (item) => String(item.id) !== String(product.id)
        )
        : [...previous, product];
    });
  };

  const removeWishlistItem = (id) => {
    setWishlist((previous) =>
      previous.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  // Reset all filters and category URL
  const resetFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setCategory("all");
    setSort("featured");
    setStockFilter("all");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");

    setSearchParams(nextParams);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);

    const nextParams = new URLSearchParams(searchParams);

    if (value === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", value);
    }

    setSearchParams(nextParams);
  };

  const inStockCount = products.filter(
    (product) => Number(product.stock ?? 0) > 0
  ).length;

  const outOfStockCount = products.length - inStockCount;

  return (
    <section className="products">
      <header className="products__head">
        {/* Decorative showcase tiles (sirf sajawat) */}
        <div className="showcase" aria-hidden="true">
          <div className="showcase__tile">
            <span className="showcase__icon">
              <Laptop size={28} strokeWidth={1.8} />
            </span>
            <strong>Laptops</strong>
          </div>

          <div className="showcase__tile">
            <span className="showcase__icon">
              <Cpu size={28} strokeWidth={1.8} />
            </span>
            <strong>Components</strong>
          </div>

          <div className="showcase__tile">
            <span className="showcase__icon">
              <Keyboard size={28} strokeWidth={1.8} />
            </span>
            <strong>Peripherals</strong>
          </div>

          <div className="showcase__tile">
            <span className="showcase__icon">
              <Headphones size={28} strokeWidth={1.8} />
            </span>
            <strong>Accessories</strong>
          </div>
        </div>

        <div className="products__head-inner">
          <span className="products__badge">
            <i aria-hidden="true" />
            Smartteq store
          </span>

          <h1>
            Our <span>Tech Collection</span>
          </h1>

          <p>
            Explore the latest in laptops, peripherals, and more.
          </p>

          <ul className="stats">
            <li>
              <strong>{stats.total}</strong>
              <span>products</span>
            </li>

            <li>
              <strong>{stats.inStock}</strong>
              <span>in stock</span>
            </li>

            {stats.maxOff > 0 && (
              <li>
                <strong>{stats.maxOff}%</strong>
                <span>max discount</span>
              </li>
            )}
          </ul>
        </div>
      </header>

      <div className="products__body">
        <div className="dock">
          <div className="dock__row">
            <label className="field field--search">
              <FiSearch className="field__icon" />

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
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <FiX size={14} />
                </button>
              )}
            </label>

            <label className="field field--select">
              <FiSliders className="field__icon" />

              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <FiChevronDown className="field__chev" />
            </label>
          </div>

          <div className="chips" role="group" aria-label="Categories">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`chip${category === item.value ? " is-active" : ""
                  }`}
                aria-pressed={category === item.value}
                onClick={() => handleCategoryChange(item.value)}
              >
                {item.label}

                <span className="chip__count">
                  {item.count} products | {item.units} units
                </span>
              </button>
            ))}
          </div>

          <div
            className="chips stock-filters"
            role="group"
            aria-label="Stock filters"
          >
            {STOCK_OPTIONS.map((option) => {
              const count =
                option.value === "in-stock"
                  ? inStockCount
                  : option.value === "out-of-stock"
                    ? outOfStockCount
                    : products.length;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`chip${stockFilter === option.value
                    ? " is-active"
                    : ""
                    }`}
                  aria-pressed={stockFilter === option.value}
                  onClick={() => setStockFilter(option.value)}
                >
                  {option.label}

                  <span className="chip__count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="products__count" aria-live="polite">
          Showing <strong>{displayedProducts.length}</strong>{" "}
          {displayedProducts.length === 1
            ? "product"
            : "products"}
        </p>

        {loading ? (
          <div
            className="products__grid"
            role="status"
            aria-busy="true"
          >
            <span className="sr-only">
              Loading products... Getting the latest products from
              Smartteq database.
            </span>

            {Array.from({ length: 8 }).map((_, i) => (
              <div className="pcard-skel" key={i} aria-hidden="true">
                <div className="pcard-skel__media" />

                <div className="pcard-skel__body">
                  <span className="pcard-skel__line pcard-skel__line--chip" />
                  <span className="pcard-skel__line" />
                  <span className="pcard-skel__line pcard-skel__line--short" />
                  <span className="pcard-skel__line pcard-skel__line--price" />
                  <span className="pcard-skel__btn" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty">
            <span className="empty__icon">
              <FiPackage size={24} />
            </span>

            <h2>Unable to load products</h2>
            <p>{error}</p>

            <button
              type="button"
              className="empty__btn"
              onClick={() =>
                setRetryCount((count) => count + 1)
              }
            >
              Try Again
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">
              <FiSearch size={24} />
            </span>

            <h2>No products match your filters</h2>

            <p>
              Try another stock filter, search term, or category.
            </p>

            <button
              type="button"
              className="empty__btn"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="products__grid">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                cartItems={cartItems}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                onOpenWishlist={() => setWishlistOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <WishlistDrawer
        open={wishlistOpen}
        wishlist={wishlist}
        onClose={() => setWishlistOpen(false)}
        onRemove={removeWishlistItem}
      />
    </section>
  );
}
