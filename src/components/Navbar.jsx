
import { useState } from "react";
import {
  ChevronDown,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const navLinks = [
    ["Home", "/"],
    ["All Products", "/products"],
    ["Repairing", "/repairing"],
    ["Track Order", "/track-order"],
    ["About Us", "/about"],
  ];

  const categoryLinks = [
    ["Computers & Laptops", "#computers"],
    ["Accessories", "#accessories"],
    ["Networking", "#networking"],
    ["Printers & Peripherals", "#peripherals"],
  ];

  const closeNavigation = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  };

  return (
    <header className="site-header">
      <nav className="navbar">
        <a
          className="brand"
          href="#home"
          aria-label="Smartteq home"
          onClick={closeNavigation}
        >
          <span className="brand-logo">
            <img
              src="/smartteq-logo.png"
              alt="Smartteq Logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </span>

          <span className="brand-copy">
            <strong>SMARTTEQ</strong>
            <small>Solutions &amp; Technology Services</small>
          </span>
        </a>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} onClick={closeNavigation}>
              {label}
            </a>
          ))}

          <div
            className={`nav-dropdown ${
              categoriesOpen ? "dropdown-open" : ""
            }`}
          >
            <button
              type="button"
              className="nav-dropdown-toggle"
              onClick={() =>
                setCategoriesOpen((previous) => !previous)
              }
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
            >
              Categories
              <ChevronDown
                size={16}
                className={`dropdown-chevron ${
                  categoriesOpen ? "chevron-rotated" : ""
                }`}
              />
            </button>

            <div className="dropdown-menu">
              {categoryLinks.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={closeNavigation}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <a
          className="nav-cart"
          href="#cart"
          onClick={closeNavigation}
          aria-label="Shopping cart"
        >
          <ShoppingCart size={19} />
          <span>Cart</span>
        </a>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => {
            setMenuOpen((previous) => !previous);
            setCategoriesOpen(false);
          }}
          aria-label={
            menuOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>
    </header>
  );
}
