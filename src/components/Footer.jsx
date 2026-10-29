
import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
  FaGoogle,
  FaWhatsapp,
  FaHeart,
} from "react-icons/fa6";
import {
  FiMapPin,
  FiPhone,
  FiArrowUpRight,
  FiMail,
} from "react-icons/fi";

import "../styles/Footer.css";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "All Products", to: "/products" },
  { label: "All Categories", to: "/categories" },
  { label: "Repairing Services", to: "/repairing-services" },
  { label: "Track Order", to: "/track-order" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://facebook.com/",
    icon: <FaFacebook />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: <FaInstagram />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: <FaLinkedin />,
  },
  {
    label: "X",
    href: "https://x.com/",
    icon: <FaXTwitter />,
  },
  {
    label: "Google",
    href: "https://google.com/",
    icon: <FaGoogle />,
  },
];

const PHONE = "+92 321 5003621";
const PHONE_LINK = PHONE.replace(/\s/g, "");
const WHATSAPP_URL = "https://wa.me/923215003621";

const ADDRESS =
  "66-2nd Floor, Hafeez Center, E1, Commercial Area, Gulberg III, Lahore, 54600";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Hafeez+Center+Gulberg+III+Lahore";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="footer__container">
        {/* Brand column */}
        <div className="footer__brand">
          <Link
            to="/"
            className="footer__brand-link"
            aria-label="Smartteq home"
          >
            <img
              src="/smartteq-logo.png"
              alt="Smartteq logo"
              className="footer__logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <span className="footer__brand-name">SMARTTEQ</span>
          </Link>

          <span className="footer__brand-tagline">
            SOLUTIONS & TECHNOLOGY SERVICES
          </span>

          <p className="footer__text">
            Your trusted destination for laptop parts, computer accessories,
            technology products, and professional repair services in Lahore.
          </p>

          <h4 className="footer__follow">Connect with us</h4>

          <div className="footer__socials">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit us on ${social.label}`}
                title={social.label}
                className="footer__social"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <nav className="footer__col" aria-label="Quick links">
          <h4 className="footer__heading">Quick Links</h4>

          <span className="footer__heading-line" />

          <ul className="footer__links">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>
                  <span>{link.label}</span>
                  <FiArrowUpRight className="footer__link-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact information */}
        <div className="footer__col footer__contact-column">
          <h4 className="footer__heading">Get in Touch</h4>

          <span className="footer__heading-line" />

          <p className="footer__contact-intro">
            Have a question or need technical assistance? We are here to help.
          </p>

          <ul className="footer__contact">
            <li>
              <span className="footer__contact-icon-wrap">
                <FiMapPin />
              </span>

              <div>
                <span className="footer__contact-label">Visit our store</span>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ADDRESS}
                </a>
              </div>
            </li>

            <li>
              <span className="footer__contact-icon-wrap">
                <FiPhone />
              </span>

              <div>
                <span className="footer__contact-label">Call us</span>
                <a href={`tel:${PHONE_LINK}`}>{PHONE}</a>
              </div>
            </li>

            <li>
              <span className="footer__contact-icon-wrap">
                <FiMail />
              </span>

              <div>
                <span className="footer__contact-label">Email us</span>
                <a href="mailto:">
                  Contact us by phone or WhatsApp
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p>
          © {currentYear} <strong>Smartteq</strong>. All rights reserved.
        </p>

        <p className="footer__crafted">
          Crafted with <FaHeart className="footer__heart" /> by{" "}
          <span>Shoaib Ajmal</span>
        </p>

        <a className="footer__back-top" href="#home">
          Back to top <FiArrowUpRight />
        </a>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="footer__whatsapp"
        aria-label="Chat with Smartteq on WhatsApp"
      >
        <FaWhatsapp size={25} />

        <span className="footer__whatsapp-label">Chat with us</span>
      </a>
    </footer>
  );
}
