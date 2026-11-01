import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import categories from "../data/categories";
import "../styles/CategorySection.css";

export default function CategorySection() {
  const trackRef = useRef(null);

  // Screen ki width ke hisaab se scroll (mobile par bhi sahi kaam kare)
  const scrollCategories = (direction) => {
    const track = trackRef.current;

    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
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

          <Link to="/products" className="view-all-button">
            View All <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <div className="categories-track" ref={trackRef}>
        {categories.map((category) => (
          <Link
            className="category-card"
            to={category.href}
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
          </Link>
        ))}
      </div>
    </section>
  );
}
