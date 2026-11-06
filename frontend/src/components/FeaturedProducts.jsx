import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ShoppingCart,
  Zap,
  Sparkles,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import "../styles/FeaturedProducts.css";

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function FeaturedProducts() {
  const trackRef = useRef(null);
  const addedTimerRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [addedProductId, setAddedProductId] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carousel arrows / progress bar ki state (sirf design ke liye)
  const [scrollState, setScrollState] = useState({
    canPrev: false,
    canNext: true,
    scrollable: true,
    thumb: 30,
    offset: 0,
  });

  const { cartItems, addToCart } = useCart();

  // Fetch featured products from database
  useEffect(() => {
    let controller;

    const loadProducts = async () => {
      controller?.abort();
      controller = new AbortController();

      try {
        setError("");

        const response = await fetch(
          "/api/products?sort=featured",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load featured products.");
        }

        const data = await response.json();

        const featuredProducts = Array.isArray(data.products)
          ? data.products.filter(
            (product) =>
              product.featured === true ||
              product.featured === 1 ||
              product.featured === "1"
          )
          : [];

        setProducts(featuredProducts);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Featured products error:", err);
          setError("Featured products could not be loaded.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    window.addEventListener(
      "smartteq:stock-updated",
      loadProducts
    );

    window.addEventListener("focus", loadProducts);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadProducts();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      controller?.abort();

      window.removeEventListener(
        "smartteq:stock-updated",
        loadProducts
      );

      window.removeEventListener("focus", loadProducts);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      clearTimeout(addedTimerRef.current);
    };
  }, []);

  // Track ki scroll position se arrows aur progress bar update karo
  const updateScrollState = useCallback(() => {
    const track = trackRef.current;

    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    const ratio = track.scrollWidth
      ? track.clientWidth / track.scrollWidth
      : 1;
    const thumb = Math.max(ratio * 100, 12);
    const progress = max > 0 ? track.scrollLeft / max : 0;

    setScrollState({
      canPrev: track.scrollLeft > 4,
      canNext: track.scrollLeft < max - 4,
      scrollable: max > 4,
      thumb,
      offset: progress * (100 - thumb),
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    updateScrollState();

    track.addEventListener("scroll", updateScrollState, {
      passive: true,
    });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, products]);

  // Screen ki width ke hisaab se scroll (mobile par bhi sahi kaam kare)
  const scrollProducts = (direction) => {
    const track = trackRef.current;

    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  // Add product to database cart
  const handleAddToCart = async (product) => {
    if (addingProductId !== null) return;

    const cartProduct = cartItems.find(
      (item) => String(item.id) === String(product.id)
    );

    const currentQuantity = Number(
      cartProduct?.quantity || 0
    );

    const stock = Number(product.stock ?? 0);

    if (stock <= 0 || currentQuantity >= stock) {
      return;
    }

    setAddingProductId(product.id);

    try {
      const success = await addToCart(product, 1);

      if (!success) return;

      setAddedProductId(product.id);

      clearTimeout(addedTimerRef.current);

      addedTimerRef.current = setTimeout(() => {
        setAddedProductId(null);
      }, 2000);
    } catch (err) {
      console.error("Featured product add-to-cart error:", err);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <section className="featured-section" id="products">
      <div className="featured-inner">
        <div className="featured-header">
          <div className="featured-heading">
            <span className="featured-eyebrow">
              <i />
              Hand-picked for you
            </span>

            <h2>
              Featured <span>Products</span>
            </h2>

            <p>
              Exceptional performance and value — carefully selected
              <br className="featured-desktop-break" />
              for you.
            </p>
          </div>

          <div className="featured-actions">
            <button
              type="button"
              className="featured-arrow"
              onClick={() => scrollProducts(-1)}
              disabled={!scrollState.canPrev}
              aria-label="Previous products"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              className="featured-arrow"
              onClick={() => scrollProducts(1)}
              disabled={!scrollState.canNext}
              aria-label="Next products"
            >
              <ArrowRight size={18} />
            </button>

            <Link className="featured-view-all" to="/products">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div
            className="featured-track featured-track-loading"
            role="status"
            aria-label="Loading featured products"
          >
            {[0, 1, 2, 3].map((item) => (
              <div className="featured-card featured-skeleton" key={item}>
                <div className="skeleton-image" />
                <div className="skeleton-body">
                  <span className="skeleton-line short" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line price" />
                  <span className="skeleton-button" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="featured-message">{error}</p>
        ) : products.length === 0 ? (
          <p className="featured-message">
            No featured products available.
          </p>
        ) : (
          <>
            <div className="featured-track" ref={trackRef}>
              {products.map((product) => {
                const price = Number(product.price || 0);

                const oldPrice = Number(
                  product.oldPrice ??
                  product.old_price ??
                  0
                );

                const savings = oldPrice - price;

                // Calculate discount even if API does not send discount
                const discount =
                  oldPrice > price && oldPrice > 0
                    ? Math.round(
                      ((oldPrice - price) / oldPrice) * 100
                    )
                    : Number(product.discount || 0);

                const cartProduct = cartItems.find(
                  (item) =>
                    String(item.id) === String(product.id)
                );

                const cartQuantity = Number(
                  cartProduct?.quantity || 0
                );

                const stock = Number(product.stock ?? 0);

                const remainingStock = Math.max(
                  stock - cartQuantity,
                  0
                );

                const isOutOfStock = stock <= 0;

                const stockLimitReached =
                  !isOutOfStock &&
                  cartQuantity >= stock;

                const isAdding =
                  String(addingProductId) === String(product.id);

                const isDisabled =
                  isOutOfStock ||
                  stockLimitReached ||
                  addingProductId !== null;

                const isAdded =
                  String(addedProductId) === String(product.id);

                return (
                  <article
                    className={`featured-card ${
                      isOutOfStock ? "card-out-of-stock" : ""
                    }`}
                    key={product.id}
                  >
                    <div className="featured-image-wrap">
                      <Link
                        to={`/product/${product.id}`}
                        className="featured-product-link"
                      >
                        <img
                          className="featured-product-image"
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      </Link>

                      {product.featured && (
                        <span className="featured-badge">
                          <Sparkles size={12} />
                          Featured
                        </span>
                      )}

                      {discount > 0 && (
                        <span className="discount-badge">
                          -{discount}%
                        </span>
                      )}

                      {isOutOfStock ? (
                        <span className="stock-badge out-of-stock">
                          Out Of Stock
                        </span>
                      ) : remainingStock <= 5 ? (
                        <span className="stock-badge low-stock">
                          {remainingStock} Left
                        </span>
                      ) : null}

                      {/* Hover par "View Details" (sirf mouse devices) */}
                      <Link
                        to={`/product/${product.id}`}
                        className="featured-quick-view"
                        aria-hidden="true"
                        tabIndex={-1}
                      >
                        View Details <ArrowUpRight size={15} />
                      </Link>
                    </div>

                    <div className="featured-card-body">
                      <span className="product-category">
                        {product.category}
                      </span>

                      <h3>
                        <Link
                          to={`/product/${product.id}`}
                          className="featured-product-name-link"
                        >
                          {product.name}
                        </Link>
                      </h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <div className="product-price-area">
                        <div className="product-prices">
                          <strong>
                            {formatPrice(price)}
                          </strong>

                          {oldPrice > price && (
                            <del>
                              {formatPrice(oldPrice)}
                            </del>
                          )}
                        </div>

                        {savings > 0 && (
                          <span className="product-savings">
                            You save {formatPrice(savings)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`add-to-cart-button ${isDisabled
                          ? "cart-disabled"
                          : isAdded
                            ? "cart-added"
                            : ""
                          }`}
                        disabled={isDisabled}
                        onClick={() => handleAddToCart(product)}
                      >
                        {isOutOfStock ? (
                          "Out Of Stock"
                        ) : stockLimitReached ? (
                          "Stock Limit Reached"
                        ) : isAdding ? (
                          "Adding..."
                        ) : isAdded ? (
                          <>
                            <Check size={17} />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            Add to Cart
                            <Zap size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {scrollState.scrollable && (
              <div className="featured-progress" aria-hidden="true">
                <span
                  style={{
                    width: `${scrollState.thumb}%`,
                    marginLeft: `${scrollState.offset}%`,
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
