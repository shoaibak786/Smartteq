import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
  FaGoogle,
  FaWhatsapp,
} from "react-icons/fa6";
import {
  FiMapPin,
  FiPhone,
  FiArrowUpRight,
  FiMail,
  FiArrowUp,
} from "react-icons/fi";

import "../styles/Footer.css";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "All Products", to: "/products" },
  { label: "Repairing Services", to: "/repairing" },
  { label: "Track Order", to: "/track-order" },
  { label: "About Us", to: "/about" },
  { label: "Shopping Cart", to: "/cart" },
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
const PHONE_LINK = "+923215003621";
const EMAIL = "khawar.lab@gmail.com";
const WHATSAPP_URL = "https://wa.me/923215003621";
const DEVELOPER_URL = "https://shoaib-portfolio-khaki.vercel.app/";

const ADDRESS =
  "18 km Canal Bank Road Lahore";

// Map link ab wahi address use karta hai jo screen par likha hai
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ADDRESS
)}`;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className="footer" id="contact">
        <div className="footer__container">
          {/* Brand */}
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
              Smart technology. Better future.
            </span>

            <p className="footer__text">
              Your trusted destination for quality technology products,
              reliable electronics and professional repairing services.
              At Smartteq, we make technology simple and accessible.
            </p>

            <h4 className="footer__follow">Follow Us</h4>

            <div className="footer__socials">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="footer__social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h3 className="footer__heading">Quick Links</h3>

            <ul className="footer__links">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>
                    <span>{link.label}</span>
                    <FiArrowUpRight
                      className="footer__link-arrow"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h3 className="footer__heading">Get In Touch</h3>

            <p className="footer__contact-intro">
              Have a question or need assistance? Our team is here to help.
              Contact us through any of the following channels.
            </p>

            <ul className="footer__contact">
              <li>
                <span className="footer__contact-icon-wrap">
                  <FiMapPin />
                </span>

                <div>
                  <span className="footer__contact-label">Our Location</span>
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
                  <span className="footer__contact-label">Phone Number</span>
                  <a href={`tel:${PHONE_LINK}`}>{PHONE}</a>
                </div>
              </li>

              <li>
                <span className="footer__contact-icon-wrap">
                  <FiMail />
                </span>

                <div>
                  <span className="footer__contact-label">Email Address</span>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p>
            © {currentYear} <strong>SMARTTEQ</strong>. All Rights Reserved.
          </p>

          <a
            href={DEVELOPER_URL}
            className="footer__credit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website developed by Shoaib Ajmal (opens portfolio)"
          >
            <span className="footer__credit-avatar" aria-hidden="true">
              SA
            </span>

            <span className="footer__credit-text">
              <small>Website developed by</small>
              <strong>Shoaib Ajmal</strong>
            </span>

            <FiArrowUpRight
              className="footer__credit-arrow"
              aria-hidden="true"
            />
          </a>

          <button
            type="button"
            className="footer__back-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            Back to Top <FiArrowUp aria-hidden="true" />
          </button>
        </div>

        {/* Big decorative wordmark */}
        <div className="footer__wordmark" aria-hidden="true">
          SMARTTEQ
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP_URL}
        className="footer__whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Smartteq on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp size={28} aria-hidden="true" />
      </a>
    </>
  );
}
