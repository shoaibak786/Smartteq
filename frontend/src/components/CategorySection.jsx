import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import categories from "../data/categories";
import "../styles/CategorySection.css";

// Har card ko apna accent color milta hai (hero ke palette se milta hua)
const ACCENTS = [
  "#2864f0",
  "#06b6d4",
  "#a855f7",
  "#10b981",
  "#f59e0b",
  "#ec4899",
];

export default function CategorySection() {
  const trackRef = useRef(null);

  const [scrollState, setScrollState] = useState({
    canPrev: false,
    canNext: true,
    scrollable: true,
    thumb: 30,
    offset: 0,
  });

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

    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

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
      <div className="categories-inner">
        <div className="categories-header">
          <div className="categories-heading">
            <span className="categories-eyebrow">
              <i />
              Shop by category
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
              disabled={!scrollState.canPrev}
              aria-label="Scroll to previous categories"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              className="category-arrow category-arrow-next"
              onClick={() => scrollCategories(1)}
              disabled={!scrollState.canNext}
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
          {categories.map((category, index) => {
            const label = category.name.replaceAll("_", " ");

            return (
              <Link
                className="category-card"
                to={category.href}
                key={category.name}
                style={{ "--accent": ACCENTS[index % ACCENTS.length] }}
              >
                <span className="category-visual">
                  <img
                    src={category.image}
                    alt={label}
                    loading="lazy"
                  />
                </span>

                <span className="category-info">
                  <span className="category-text">
                    <span className="category-name">{label}</span>
                    <span className="category-cta">Shop now</span>
                  </span>

                  <span className="category-go" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {scrollState.scrollable && (
          <div className="categories-progress" aria-hidden="true">
            <span
              style={{
                width: `${scrollState.thumb}%`,
                marginLeft: `${scrollState.offset}%`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
