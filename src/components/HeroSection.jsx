
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  Monitor,
  Code2,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const slides = [
  {
    eyebrow: "QUALITY TECH PRODUCTS",
    title: "Premium Products",
    accent: "& Accessories",
    description:
      "Discover computers, laptops, peripherals and reliable technology products for your needs.",
    button: "Explore Products",
    icon: Monitor,
    visual: "products",
    points: ["Quality Products", "Trusted Support", "Great Service"],
    color: "#06b6d4",
  },
  {
    eyebrow: "WEB DESIGN & DEVELOPMENT",
    title: "Build Your",
    accent: "Digital Future",
    description:
      "Modern, responsive websites designed to help your business grow and stand out online.",
    button: "Build Your Website",
    icon: Code2,
    visual: "development",
    points: ["Modern Design", "Responsive Websites", "Custom Solutions"],
    color: "#a855f7",
  },
  {
    eyebrow: "EXPERT REPAIR SERVICES",
    title: "Tech Repair",
    accent: "You Can Trust",
    description:
      "Professional computer and laptop troubleshooting, maintenance and repair services.",
    button: "Explore Repairing",
    icon: Wrench,
    visual: "repair",
    points: ["Expert Technicians", "Careful Diagnosis", "Reliable Support"],
    color: "#f59e0b",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const contentRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    const visual = visualRef.current;

    if (!content || !visual) return;

    const elements = content.querySelectorAll(
      ".hero-eyebrow, .hero-title, .hero-description, .hero-button, .hero-points"
    );

    gsap.killTweensOf([elements, visual]);

    gsap.fromTo(
      elements,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all",
      }
    );

    gsap.fromTo(
      visual,
      { x: 35, opacity: 0, scale: 0.96 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.85,
        ease: "power3.out",
        clearProps: "transform,opacity",
      }
    );
  }, [current]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[current];
  const SlideIcon = slide.icon;

  const changeSlide = (index) => {
    setCurrent((index + slides.length) % slides.length);
  };

  return (
    <section
      className={`hero theme-${current}`}
      id="home"
      style={{ "--slide-color": slide.color }}
    >
      <div className="hero-grid" />

      <div className="hero-inner">
        <div className="hero-content" ref={contentRef} key={current}>
          <div className="hero-eyebrow">
            <SlideIcon size={15} />
            {slide.eyebrow}
          </div>

          <h1 className="hero-title">
            {slide.title}
            <span>{slide.accent}</span>
          </h1>

          <div className="title-underline" />

          <p className="hero-description">{slide.description}</p>

          <a
            className="hero-button"
            href={
              current === 0
                ? "#products"
                : current === 1
                  ? "#development"
                  : "#repairing"
            }
          >
            {slide.button}
            <ArrowRight size={19} />
          </a>

          <div className="hero-points">
            {slide.points.map((point) => (
              <span key={point}>
                <i />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`hero-visual visual-${slide.visual}`}
          ref={visualRef}
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-glow" />

          {current === 0 && (
            <div className="visual-card product-card">
              <Monitor size={100} strokeWidth={1.1} />
              <span>SMART TECH</span>
              <strong>Technology for tomorrow.</strong>
              <div className="product-mini-icons">
                <Monitor />
                <Code2 />
                <Wrench />
              </div>
            </div>
          )}

          {current === 1 && (
            <div className="visual-card code-card">
              <div className="code-top">
                <span />
                <span />
                <span />
                <small>smartteq.dev</small>
              </div>
              <Code2 size={88} strokeWidth={1.2} />
              <strong>Ideas into reality.</strong>
              <code>{"<"}buildYourFuture /{">"}</code>
            </div>
          )}

          {current === 2 && (
            <div className="visual-card repair-card">
              <Wrench size={92} strokeWidth={1.2} />
              <strong>Expert Tech Care</strong>
              <span>Diagnose. Repair. Restore.</span>
              <div className="repair-status">
                <i /> Service &amp; support
              </div>
            </div>
          )}

          <div className="floating-chip chip-top">
            <span className="chip-icon">
              <Monitor size={18} />
            </span>
            <span>
              <strong>Smart Solutions</strong>
              <small>Technology made simple</small>
            </span>
          </div>

          <div className="floating-chip chip-bottom">
            <span className="status-dot" />
            Reliable technology services
          </div>
        </div>
      </div>

      <div className="slider-controls">
        <button
          type="button"
          className="slider-arrow"
          onClick={() => changeSlide(current - 1)}
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="slider-dots">
          {slides.map((item, index) => (
            <button
              type="button"
              key={item.visual}
              className={`slider-dot ${
                current === index ? "active" : ""
              }`}
              onClick={() => changeSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={current === index ? "true" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className="slider-arrow"
          onClick={() => changeSlide(current + 1)}
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="hero-progress" key={`progress-${current}`}>
        <span style={{ animationDuration: "6s" }} />
      </div>
    </section>
  );
}
