import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/N~avbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categoryLinks, setCategoryLinks] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const navRef = useRef(null);

  const { cartCount } = useCart();

  const navLinks = [
    ["Home", "/"],
    ["All Products", "/products"],
    ["Repairing", "/repairing"],
    ["Track Order", "/track-order"],
    ["About Us", "/about"],
  ];

  // Fetch actual categories from database API
  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Unable to load categories.");
        }

        const actualCategories = Array.isArray(data.categories)
          ? data.categories.filter(
              (item) => item.value && item.value !== "all"
            )
          : [];

        setCategoryLinks(actualCategories);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Navbar categories error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => controller.abort();
  }, []);

  // Navbar ke bahar tap/click karne ya Escape dabane par menu band ho
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
        setCategoriesOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setCategoriesOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeNavigation = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  };

  return (
    <header className="site-header">
      <nav className="navbar" ref={navRef}>
        <Link
          className="brand"
          to="/"
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
        </Link>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          {navLinks.map(([label, href]) => (
            <Link
              key={label}
              to={href}
              onClick={closeNavigation}
            >
              {label}
            </Link>
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
              {categoriesLoading ? (
                <span>Loading categories...</span>
              ) : categoryLinks.length > 0 ? (
                categoryLinks.map((item) => (
                  <Link
                    key={item.value}
                    to={`/products?category=${encodeURIComponent(
                      item.value
                    )}`}
                    onClick={closeNavigation}
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                <span>No categories available</span>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/cart"
          className="nav-cart"
          onClick={closeNavigation}
          aria-label={`Shopping cart with ${cartCount} items`}
        >
          <span className="nav-cart-icon">
            <ShoppingCart size={19} />

            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </span>

          <span>Cart</span>
        </Link>

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
