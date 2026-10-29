import React, { useEffect, useRef, useState } from "react";
import {
  Laptop, MessageCircle, Phone, Star, Clock3, Award, Truck,
  Wrench, RefreshCw, ShieldCheck, HardDrive, Cpu, Fan,
  BatteryCharging, Monitor, Keyboard, Wifi, Settings,
  MapPin, Package, Building2, Factory, Code2,
  Handshake, FileText, CheckCircle2,
} from "lucide-react";
import "../styles/Repairing.css";

const PHONE = "0321-5003621";
const PHONE_LINK = "tel:+923215003621";
const WHATSAPP_URL = "https://wa.me/923215003621";
const BOOK_URL = `${WHATSAPP_URL}?text=${encodeURIComponent("Hi, I want to book a laptop service.")}`;
const CONTRACT_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(
  "Hi, I want to inquire about an annual corporate maintenance contract."
)}`;

const HERO_IMG =
  "https://images.unsplash.com/photo-1581092918056-0c4c3a9f4f6a?auto=format&fit=crop&w=1200&q=85";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=85";

const services = [
  { icon: Wrench, title: "Diagnostic & Troubleshooting", desc: "Comprehensive system checks to identify issues and pinpoint problems accurately." },
  { icon: RefreshCw, title: "OS Installation", desc: "Fresh installation of Windows, macOS, or Linux, including driver setup and essential updates." },
  { icon: ShieldCheck, title: "Virus & Malware Removal", desc: "Thorough scanning and removal of malicious software to ensure complete system security." },
  { icon: HardDrive, title: "HDD / SSD Upgrade", desc: "Seamless installation of new SSDs or high-capacity HDDs for faster performance and more storage." },
  { icon: Cpu, title: "RAM Upgrade", desc: "Boost multitasking capabilities and system responsiveness with high-speed memory upgrades." },
  { icon: Fan, title: "Cooling System Cleaning", desc: "Deep cleaning of internal fans and heat sinks to prevent overheating and maintain optimal performance." },
  { icon: BatteryCharging, title: "Battery Replacement", desc: "High-quality replacement batteries to restore your laptop’s original runtime and portability." },
  { icon: Monitor, title: "Screen Replacement", desc: "Expert replacement of cracked, flickering, or non-functional laptop screens with vibrant new displays." },
  { icon: Keyboard, title: "Keyboard / Touchpad Repair", desc: "Fixing unresponsive keys, sticky buttons, or faulty touchpads to restore full input functionality." },
  { icon: Wifi, title: "Network & Connectivity", desc: "Troubleshooting and resolving problems with Wi-Fi, Ethernet, Bluetooth, and network connections." },
  { icon: Settings, title: "BIOS / UEFI Configuration", desc: "Optimizing firmware settings for improved performance, compatibility, or specific boot requirements." },
  { icon: Laptop, title: "Software Installation", desc: "Professional installation and setup of essential applications, drivers, and custom software solutions." },
];

const audiences = [
  { icon: Building2, title: "Software Houses", desc: "Annual maintenance contracts for full dev teams — keeping every workstation, laptop, and peripheral running at peak condition year-round." },
  { icon: Factory, title: "Industries & Factories", desc: "Fleet-wide hardware servicing for manufacturing units and industrial setups with minimal downtime and on-site support." },
  { icon: Code2, title: "IT Companies", desc: "Dedicated repair partnerships for IT firms requiring fast turnarounds, bulk device management, and priority service slots." },
  { icon: Handshake, title: "Corporates & Enterprises", desc: "Tailored annual service agreements for offices and enterprises covering all devices, preventive maintenance, and emergency callouts." },
];

const terms = [
  { icon: MapPin, title: "Doorstep Service — Lahore", desc: <>Our doorstep service covers locations within a <strong>25 km radius from Gulberg Lahore</strong>. A technician visits your home or office — no hassle, no travel.</>, tone: "blue" },
  { icon: FileText, title: "Out-of-Area Doorstep Fee", desc: <>Locations beyond 25 km incur a fixed travel fee of <strong>PKR 1,000</strong> in addition to the service cost.</>, tone: "amber" },
  { icon: Package, title: "Nationwide Delivery (Paid)", desc: <>We ship parts, accessories, and repaired devices to <strong>all cities across Pakistan</strong> via TCS, Leopards, and M&amp;P. Delivery charges apply based on weight and destination.</>, tone: "green" },
  { icon: MessageCircle, title: "Book via WhatsApp", desc: <>Reach us directly for queries or to schedule a service:</>, tone: "blue", whatsapp: true },
  { icon: Clock3, title: "Delivery Timelines", desc: <>Local Lahore orders: <strong>same or next day</strong>. Nationwide courier deliveries typically take <strong>2–5 business days</strong> depending on courier and destination city.</>, tone: "purple" },
  { icon: Truck, title: "Courier Partners", desc: <>We ship via <strong>TCS, Leopards Courier, and M&amp;P</strong> — Pakistan’s most reliable logistics networks, ensuring your order reaches you safely and on time.</>, tone: "blue" },
];

const stats = [
  { icon: Star, count: 5000, suffix: "+", label: "Happy customers" },
  { icon: Clock3, count: 24, suffix: " / 7", label: "Online support" },
  { icon: Award, count: 20, suffix: "+", label: "Years of experience" },
  { icon: Truck, value: "Pakistan-wide", label: "Delivery" },
];

const cities = ["Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "All cities"];
const audienceTags = ["Software houses", "IT firms", "Factories", "Enterprises", "Startups", "Universities"];

/* Counts up once, when the number scrolls into view */
function CountUp({ end, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || !("IntersectionObserver" in window)) {
      setCount(end);
      return undefined;
    }

    let frame;
    let startTime;
    const run = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      setCount(Math.floor(eased * end));
      if (progress < 1) frame = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          frame = requestAnimationFrame(run);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

export default function RepairingPage() {
  return (
    <main className="repair-page">
      {/* HERO */}
      <section className="rp-hero">
        <div className="rp-hero__inner">
          <div className="rp-hero__content">
            <span className="rp-pill">
              <Laptop size={16} /> Professional IT services
            </span>
            <h1>Expert care for every device</h1>
            <p className="rp-hero__lead">
              Your one-stop solution for laptop repair, maintenance, and upgrades — with
              doorstep service across Lahore and delivery to every corner of Pakistan.
            </p>

            <div className="rp-actions">
              <a className="rp-btn rp-btn--primary" href={BOOK_URL} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Book service now
              </a>
              <a className="rp-btn rp-btn--glass" href={PHONE_LINK}>
                <Phone size={18} /> {PHONE}
              </a>
            </div>

            <ul className="rp-trust">
              <li><CheckCircle2 size={16} /> Trusted technicians</li>
              <li><CheckCircle2 size={16} /> Clear pricing</li>
              <li><CheckCircle2 size={16} /> Reliable service</li>
            </ul>
          </div>

          <div className="rp-hero__media">
            <img
              className="rp-hero__image"
              src={HERO_IMG}
              alt="Technician repairing computer hardware"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
            <div className="rp-hero__float">
              <span className="rp-hero__float-icon"><MapPin size={18} /></span>
              <div>
                <strong>Doorstep service</strong>
                <span>Same-day visits in Lahore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="rp-stats" aria-label="Our service highlights">
        {stats.map(({ icon: Icon, value, count, suffix, label }, i) => (
          <article className="rp-stat-card" key={label} style={{ "--i": i }}>
            <div className="rp-icon-box"><Icon size={26} /></div>
            <strong>{value ? value : <CountUp end={count} suffix={suffix} />}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      {/* NATIONWIDE SHIPPING */}
      <section className="rp-shipping">
        <div className="rp-shipping__icon"><Truck size={34} /></div>
        <div className="rp-shipping__main">
          <h2>We Ship Nationwide</h2>
          <p>
            Order parts, accessories, or send your device for repair from{" "}
            <strong>anywhere in Pakistan.</strong> We deliver via TCS, Leopards, and M&amp;P.
            Shipping charges apply and are calculated at checkout based on weight and destination.
          </p>
          <div className="rp-city-list">
            {cities.map((city) => (
              <span className="rp-city" key={city}><Package size={14} /> {city}</span>
            ))}
          </div>
        </div>
        <div className="rp-shipping__timelines">
          <div><span>Lahore doorstep</span><strong>Same day</strong></div>
          <div><span>Other cities</span><strong>2–5 days</strong></div>
        </div>
      </section>

      {/* CORPORATE */}
      <section className="rp-corporate">
        <div className="rp-corporate__top">
          <img
            src={FALLBACK_IMG}
            alt="Technician working on a laptop motherboard"
            loading="lazy"
          />
          <div className="rp-corporate__content">
            <span className="rp-outline-pill"><Handshake size={14} /> Annual corporate contracts</span>
            <h2>We partner with software houses, industries &amp; corporates</h2>
            <p>
              Trusted by businesses across Lahore for annual maintenance agreements — covering
              full fleets of laptops, workstations, and peripherals with priority support,
              scheduled servicing, and emergency callouts.
            </p>
            <div className="rp-audience-tags">
              {audienceTags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <a className="rp-btn rp-btn--light" href={CONTRACT_URL} target="_blank" rel="noreferrer">
              <Handshake size={17} /> Inquire about an annual contract
            </a>
          </div>
        </div>

        <div className="rp-audience-grid">
          {audiences.map(({ icon: Icon, title, desc }) => (
            <article className="rp-audience-card" key={title}>
              <div className="rp-audience-card__icon"><Icon size={19} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="rp-services">
        <div className="rp-services__intro">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85"
            alt="Laptop internal components and circuit board"
            loading="lazy"
          />
          <div>
            <h2>Comprehensive laptop services</h2>
            <p>
              From hardware faults to software glitches, our certified technicians handle every
              issue with precision and care — backed by 20+ years of hands-on experience.
            </p>
          </div>
        </div>

        <div className="rp-service-grid">
          {services.map(({ icon: Icon, title, desc }) => (
            <article className="rp-service-card" key={title}>
              <div className="rp-service-card__icon"><Icon size={20} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* TERMS */}
      <section className="rp-terms">
        <div className="rp-section-heading">
          <h2>Delivery &amp; service terms</h2>
          <p>Everything you need to know before you book.</p>
        </div>

        <div className="rp-terms-grid">
          {terms.map(({ icon: Icon, title, desc, tone, whatsapp }) => (
            <article className={`rp-term-card rp-term-card--${tone}`} key={title}>
              <div className="rp-term-card__icon"><Icon size={19} /></div>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
                {whatsapp && (
                  <a className="rp-whatsapp-chip" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                    <MessageCircle size={14} /> {PHONE}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rp-cta">
        <h2>Ready to get started?</h2>
        <p>
          Don’t let technical issues slow you down. Contact us today for professional,
          <br className="rp-desktop-break" /> reliable laptop repair services.
        </p>
        <div className="rp-cta__buttons">
          <a className="rp-btn rp-btn--light" href={BOOK_URL} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> Book service on WhatsApp
          </a>
          <a className="rp-btn rp-btn--ghost" href={PHONE_LINK}>
            <Phone size={17} /> Call {PHONE}
          </a>
        </div>
      </section>

      {/* Floating WhatsApp button */}
      <a
        className="rp-fab"
        href={BOOK_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </main>
  );
}
