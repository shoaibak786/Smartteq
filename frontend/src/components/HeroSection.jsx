import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  Gamepad2,
  Cpu,
  HardDrive,
  Wind,
  Globe,
  Code2,
  ShoppingBag,
  Store,
  Barcode,
  Printer,
  TrendingUp,
  Wrench,
  Laptop,
  Monitor,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import "../styles/HeroSection.css";

const SLIDE_DURATION = 6000;

const slides = [
  {
    key: "gaming",
    eyebrow: "GAMING PC & DESKTOP",
    icon: Gamepad2,
    title: "Gaming PCs Built",
    accent: "For Performance",
    description:
      "Custom gaming PCs and desktops with powerful processors, graphics and cooling, assembled for smooth, high-FPS play.",
    button: "Explore Gaming PCs",
    href: "#products",
    points: ["Custom Builds", "High Performance", "Expert Assembly"],
    color: "#06b6d4",
    chip: {
      icon: Gamepad2,
      title: "Gaming Ready",
      sub: "Built for smooth gameplay",
    },
    status: "Custom gaming builds",
    card: {
      tone: "dark",
      label: "smartteq.gaming",
      headIcon: Cpu,
      heading: "Built to win.",
      rows: [
        { icon: Cpu, title: "Processor", sub: "Fast, stable performance" },
        { icon: Gamepad2, title: "Graphics", sub: "High FPS gaming" },
        { icon: HardDrive, title: "Storage", sub: "Quick game loading" },
      ],
      foot: "Custom builds available",
    },
  },
  {
    key: "web",
    eyebrow: "WEB SERVICES",
    icon: Code2,
    title: "Websites That",
    accent: "Grow Your Business",
    description:
      "WordPress, React.js and Shopify websites, online stores and custom web apps, designed to look sharp and load fast.",
    button: "Start Your Website",
    href: "#web-services",
    points: ["WordPress", "React.js", "Shopify"],
    color: "#a855f7",
    chip: {
      icon: Globe,
      title: "Web Services",
      sub: "WordPress, React & Shopify",
    },
    status: "Modern, responsive websites",
    card: {
      tone: "dark",
      label: "smartteq.dev",
      headIcon: Code2,
      heading: "Ideas into reality.",
      rows: [
        { icon: Globe, title: "WordPress", sub: "Business sites & blogs" },
        { icon: Code2, title: "React.js", sub: "Fast custom web apps" },
        { icon: ShoppingBag, title: "Shopify", sub: "Online stores" },
      ],
      foot: "From design to launch",
    },
  },
  {
    key: "pos",
    eyebrow: "POINT OF SALE",
    icon: Store,
    title: "Smart Billing,",
    accent: "Simple Selling",
    description:
      "Complete POS setups to manage billing, stock and sales reports, with barcode scanners and receipt printers ready to use.",
    button: "Explore POS Systems",
    href: "#pos",
    points: ["Fast Billing", "Inventory Control", "Sales Reports"],
    color: "#10b981",
    chip: {
      icon: Store,
      title: "Point of Sale",
      sub: "Billing made easy",
    },
    status: "Billing, stock & reports",
    card: {
      tone: "light",
      label: "smartteq.pos",
      headIcon: Store,
      heading: "Sell faster.",
      rows: [
        { icon: Barcode, title: "Barcode Scanning", sub: "Quick, accurate billing" },
        { icon: Printer, title: "Receipt Printing", sub: "Clean, instant receipts" },
        { icon: TrendingUp, title: "Sales Reports", sub: "Know your best sellers" },
      ],
      foot: "Ready to sell",
    },
  },
  {
    key: "repair",
    eyebrow: "EXPERT REPAIR SERVICES",
    icon: Wrench,
    title: "Tech Repair",
    accent: "You Can Trust",
    description:
      "Professional laptop and computer repairing, from careful diagnosis to reliable fixes, so your devices work like new.",
    button: "Explore Repairing",
    href: "#repairing",
    points: ["Laptop Repairing", "Computer Repairing", "Careful Diagnosis"],
    color: "#f59e0b",
    chip: {
      icon: Wrench,
      title: "Repair Services",
      sub: "Laptops & computers",
    },
    status: "Laptop & computer repairing",
    card: {
      tone: "light",
      label: "smartteq.repair",
      headIcon: Wrench,
      heading: "Expert tech care.",
      rows: [
        { icon: Laptop, title: "Laptop Repairing", sub: "Screen, keyboard, battery" },
        { icon: Monitor, title: "Computer Repairing", sub: "Hardware & software faults" },
        { icon: Settings, title: "Maintenance", sub: "Cleaning and tune-ups" },
      ],
      foot: "Diagnose. Repair. Restore.",
    },
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const contentRef = useRef(null);
  const visualRef = useRef(null);

  // Slide change animation
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

  // Auto-play: slide badalne par timer dobara shuru (progress bar ke sath sync)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => window.clearTimeout(timer);
  }, [current]);

  const slide = slides[current];
  const SlideIcon = slide.icon;
  const ChipIcon = slide.chip.icon;
  const HeadIcon = slide.card.headIcon;

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
        <div className="hero-content" ref={contentRef} key={slide.key}>
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

          <a className="hero-button" href={slide.href}>
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
          className={`hero-visual visual-${slide.key}`}
          ref={visualRef}
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-glow" />

          <div className={`visual-card is-${slide.card.tone}`}>
            <div className="card-top">
              <span />
              <span />
              <span />
              <small>{slide.card.label}</small>
            </div>

            <div className="card-head">
              <span className="card-head-icon">
                <HeadIcon size={26} strokeWidth={1.8} />
              </span>
              <strong>{slide.card.heading}</strong>
            </div>

            <ul className="card-rows">
              {slide.card.rows.map((row) => {
                const RowIcon = row.icon;

                return (
                  <li key={row.title} className="card-row">
                    <span className="row-icon">
                      <RowIcon size={17} />
                    </span>
                    <span className="row-text">
                      <strong>{row.title}</strong>
                      <small>{row.sub}</small>
                    </span>
                    <i className="row-dot" />
                  </li>
                );
              })}
            </ul>

            <div className="card-foot">
              <i />
              {slide.card.foot}
            </div>
          </div>

          <div className="floating-chip chip-top">
            <span className="chip-icon">
              <ChipIcon size={18} />
            </span>
            <span>
              <strong>{slide.chip.title}</strong>
              <small>{slide.chip.sub}</small>
            </span>
          </div>

          <div className="floating-chip chip-bottom">
            <span className="status-dot" />
            {slide.status}
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
              key={item.key}
              className={`slider-dot ${current === index ? "active" : ""}`}
              onClick={() => changeSlide(index)}
              aria-label={`Go to slide ${index + 1}: ${item.title} ${item.accent}`}
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
        <span style={{ animationDuration: `${SLIDE_DURATION}ms` }} />
      </div>
    </section>
  );
}
