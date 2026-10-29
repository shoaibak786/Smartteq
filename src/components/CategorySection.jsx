
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import categories from "../data/categories";
import "../styles/CategorySection.css";

export default function CategorySection() {
  const trackRef = useRef(null);

  const scrollCategories = (direction) => {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="categories-section" id="categories">
      <div className="categories-header">
        <div className="categories-heading">
          <span className="categories-eyebrow">
            SHOP BY CATEGORY
          </span>

          <h2>
            Browse Our <span>Categories</span>
          </h2>

          <p>
            Find the essentials you need quickly — browse categories
            <br className="categories-desktop-break" />
            and order anytime.
          </p>
        </div>

        <div className="categories-actions">
          <button
            type="button"
            className="category-arrow category-arrow-prev"
            onClick={() => scrollCategories(-1)}
            aria-label="Scroll to previous categories"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            className="category-arrow category-arrow-next"
            onClick={() => scrollCategories(1)}
            aria-label="Scroll to next categories"
          >
            <ChevronRight size={20} />
          </button>

          <a href="/products" className="view-all-button">
            View All <ArrowRight size={17} />
          </a>
        </div>
      </div>

      <div className="categories-track" ref={trackRef}>
        {categories.map((category) => (
          <a
            className="category-card"
            href={category.href}
            key={category.name}
          >
            <div className="category-image-circle">
              <img
                src={category.image}
                alt={category.name.replaceAll("_", " ")}
                loading="lazy"
              />
            </div>

            <span className="category-name">
              {category.name.replaceAll("_", " ")}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
