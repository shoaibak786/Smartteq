import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/Review.css";

const reviews = [
  {
    name: "Demo Customer 01",
    initials: "01",
    rating: 5,
    text: "This is a sample review preview. Genuine customer feedback will appear here after customer reviews are collected.",
  },
  {
    name: "Demo Customer 02",
    initials: "02",
    rating: 5,
    text: "This is a sample review preview. Genuine customer feedback will appear here after customer reviews are collected.",
  },
  {
    name: "Demo Customer 03",
    initials: "03",
    rating: 5,
    text: "This is a sample review preview. Genuine customer feedback will appear here after customer reviews are collected.",
  },
  {
    name: "Demo Customer 04",
    initials: "04",
    rating: 5,
    text: "This is a sample review preview. Genuine customer feedback will appear here after customer reviews are collected.",
  },
  {
    name: "Demo Customer 05",
    initials: "05",
    rating: 5,
    text: "This is a sample review preview. Genuine customer feedback will appear here after customer reviews are collected.",
  },
];

export default function CustomerReviews() {
  const sliderRef = useRef(null);

  // Arrows disable hon aur progress bar chale, is liye scroll position track hoti hai
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [progress, setProgress] = useState(0);

  const updateScrollState = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;

    setCanPrev(slider.scrollLeft > 4);
    setCanNext(slider.scrollLeft < maxScroll - 4);
    setProgress(
      maxScroll > 0 ? (slider.scrollLeft / maxScroll) * 100 : 100
    );
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return undefined;

    updateScrollState();

    slider.addEventListener("scroll", updateScrollState, {
      passive: true,
    });
    window.addEventListener("resize", updateScrollState);

    return () => {
      slider.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const slide = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const card = slider.querySelector(".review-card");

    // Gap CSS se read hota hai, hardcode nahi
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;

    const amount = card ? card.offsetWidth + gap : slider.clientWidth;

    slider.scrollBy({
      left: direction * amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-container">
        {/* Top: heading on the left, rating note on the right */}
        <div className="reviews-top">
          <div className="reviews-heading">
            <span className="reviews-badge">
              <i aria-hidden="true" />
              Customer feedback
            </span>

            <h2>
              Experiences that <span>speak for us</span>
            </h2>

            <p>
              Your feedback helps us grow. We are looking forward to
              sharing genuine experiences from Smartteq customers.
            </p>
          </div>

          <aside className="reviews-rating" aria-label="Customer rating">
            <div
              className="rating-stars"
              role="img"
              aria-label="Rating not yet available"
            >
              ★★★★★
            </div>

            <strong>Coming soon</strong>

            <p>Verified customer ratings will appear here.</p>

            <span className="rating-status">
              <i aria-hidden="true" />
              Waiting for genuine reviews
            </span>
          </aside>
        </div>

        {/* Slider heading and controls */}
        <div className="reviews-slider-heading">
          <div>
            <h3>Customer stories</h3>
            <p>Preview of our upcoming reviews section</p>
          </div>

          <div className="reviews-slider-controls">
            <button
              type="button"
              className="review-slider-btn"
              onClick={() => slide(-1)}
              disabled={!canPrev}
              aria-label="Previous reviews"
            >
              &#8592;
            </button>

            <button
              type="button"
              className="review-slider-btn"
              onClick={() => slide(1)}
              disabled={!canNext}
              aria-label="Next reviews"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* Review cards */}
        <div className="reviews-grid" ref={sliderRef}>
          {reviews.map((review) => (
            <article className="review-card" key={review.initials}>
              <div className="review-quote" aria-hidden="true">
                &ldquo;
              </div>

              <div
                className="review-stars"
                role="img"
                aria-label={`${review.rating} decorative sample stars`}
              >
                {"★".repeat(review.rating)}
              </div>

              <p className="review-text">{review.text}</p>

              <div className="review-card-footer">
                <div className="review-avatar">{review.initials}</div>

                <div className="review-customer-info">
                  <h3>{review.name}</h3>
                  <span>Preview profile</span>
                </div>

                <span className="review-demo-label">Demo</span>
              </div>
            </article>
          ))}
        </div>

        {/* Scroll progress */}
        <div
          className="reviews-progress"
          role="presentation"
          aria-hidden="true"
        >
          <span style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>

        <div className="reviews-bottom-note">
          <span className="reviews-note-icon" aria-hidden="true">
            ✦
          </span>
          <p>Real customer experiences will be featured here soon.</p>
        </div>
      </div>
    </section>
  );
}
