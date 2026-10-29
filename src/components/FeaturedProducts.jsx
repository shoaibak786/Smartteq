
import { useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Zap,
  Sparkles,
} from "lucide-react";

import products from "../data/products";
import "../styles/FeaturedProducts.css";

const formatPrice = (price) =>
  `PKR ${price.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function FeaturedProducts() {
  const trackRef = useRef(null);

  const scrollProducts = (direction) => {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction * 480,
      behavior: "smooth",
    });
  };

  return (
    <section className="featured-section" id="products">
      <div className="featured-header">
        <div className="featured-heading">
          <span className="featured-eyebrow">HAND-PICKED FOR YOU</span>

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

          <a className="featured-view-all" href="/products">
            View All <ArrowRight size={15} />
          </a>
        </div>
      </div>

      <div className="featured-track" ref={trackRef}>
        {products.map((product) => {
          const savings = product.oldPrice - product.price;

          return (
            <article className="featured-card" key={product.id}>
              <div className="featured-image-wrap">
                <img
                  className="featured-product-image"
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                />

                {product.featured && (
                  <span className="featured-badge">
                    <Sparkles size={11} />
                    Featured
                  </span>
                )}

                {product.discount > 0 && (
                  <span className="discount-badge">
                    -{product.discount}%
                  </span>
                )}

                {product.stock === 0 ? (
                  <span className="stock-badge out-of-stock">
                    Out Of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="stock-badge low-stock">
                    {product.stock} Left
                  </span>
                ) : null}
              </div>

              <div className="featured-card-body">
                <span className="product-category">
                  {product.category}
                </span>

                <h3>{product.name}</h3>
                <p className="product-description">
                  {product.description}
                </p>

                <div className="product-price-area">
                  <div className="product-prices">
                    <strong>{formatPrice(product.price)}</strong>

                    {product.oldPrice > product.price && (
                      <del>{formatPrice(product.oldPrice)}</del>
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
                  className={`add-to-cart-button ${
                    product.stock === 0 ? "cart-disabled" : ""
                  }`}
                  disabled={product.stock === 0}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("smartteq:add-to-cart", {
                        detail: { product },
                      })
                    );
                  }}
                >
                  <ShoppingCart size={15} />

                  {product.stock === 0 ? "Out Of Stock" : "Add to Cart"}

                  {product.stock > 0 && <Zap size={14} />}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
