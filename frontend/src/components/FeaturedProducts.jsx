import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
      <div className="featured-header">
        <div className="featured-heading">
          <span className="featured-eyebrow">
            HAND-PICKED FOR YOU
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
            aria-label="Previous products"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            className="featured-arrow"
            onClick={() => scrollProducts(1)}
            aria-label="Next products"
          >
            <ArrowRight size={16} />
          </button>

          <Link className="featured-view-all" to="/products">
            View All <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="featured-message">
          Loading featured products...
        </p>
      ) : error ? (
        <p className="featured-message">{error}</p>
      ) : products.length === 0 ? (
        <p className="featured-message">
          No featured products available.
        </p>
      ) : (
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
                className="featured-card"
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
                      <Sparkles size={11} />
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
                        <Check size={16} />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={15} />
                        Add to Cart
                        <Zap size={14} />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
