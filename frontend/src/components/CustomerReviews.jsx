import { useRef } from "react";
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

  const slide = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const card = slider.querySelector(".review-card");

    // Gap CSS se read hota hai (desktop 22px, mobile 14px), hardcode nahi
    const gap =
      parseFloat(getComputedStyle(slider).columnGap) || 0;

    const amount = card
      ? card.offsetWidth + gap
      : slider.clientWidth;

    slider.scrollBy({
      left: direction * amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="reviews-section">
      <div className="reviews-container">

        {/* Section Heading */}
        <div className="reviews-heading">
          <span className="reviews-eyebrow">
            CUSTOMER FEEDBACK
          </span>

          <h2>
            Experiences That <span>Speak For Us</span>
          </h2>

          <p>
            Your feedback helps us grow. We're looking forward
            to sharing genuine experiences from Smartteq customers.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="reviews-summary">
          <div className="summary-left">
            <div className="summary-icon" aria-hidden="true">
              <span>★</span>
            </div>

            <div>
              <span className="summary-label">
                CUSTOMER RATING
              </span>

              <h3>Coming Soon</h3>

              <p>
                Verified customer feedback will appear here.
              </p>
            </div>
          </div>

          <div className="summary-right">
            <div
              className="summary-stars"
              role="img"
              aria-label="Rating not yet available"
            >
              ★★★★★
            </div>

            <span>Waiting for genuine reviews</span>
          </div>
        </div>

        {/* Slider Heading and Controls */}
        <div className="reviews-slider-heading">
          <div>
            <h3>Customer Stories</h3>
            <p>Preview of our upcoming reviews section</p>
          </div>

          <div className="reviews-slider-controls">
            <button
              type="button"
              className="review-slider-btn"
              onClick={() => slide(-1)}
              aria-label="Previous reviews"
            >
              &#8592;
            </button>

            <button
              type="button"
              className="review-slider-btn"
              onClick={() => slide(1)}
              aria-label="Next reviews"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* Review Cards */}
        <div className="reviews-grid" ref={sliderRef}>
          {reviews.map((review) => (
            <article className="review-card" key={review.initials}>

              <div className="review-card-top">
                <div className="review-avatar">
                  {review.initials}
                </div>

                <div className="review-customer-info">
                  <h3>{review.name}</h3>
                  <span>Preview profile</span>
                </div>

                <div className="review-quote" aria-hidden="true">
                  “
                </div>
              </div>

              <div
                className="review-stars"
                role="img"
                aria-label={`${review.rating} decorative sample stars`}
              >
                {"★".repeat(review.rating)}
              </div>

              <p className="review-text">
                {review.text}
              </p>

              <div className="review-card-footer">
                <span className="review-demo-label">
                  DEMO CONTENT
                </span>

                <span className="review-verified">
                  Sample review
                </span>
              </div>

            </article>
          ))}
        </div>

        <div className="reviews-bottom-note">
          <span className="reviews-note-icon" aria-hidden="true">
            ✦
          </span>
          <p>
            Real customer experiences will be featured here soon.
          </p>
        </div>

      </div>
    </section>
  );
}
