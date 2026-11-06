import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiShoppingCart,
    FiZap,
    FiArrowLeft,
    FiPackage,
    FiMinus,
    FiPlus,
    FiCheckCircle,
    FiAlertCircle,
    FiShield,
    FiTruck,
    FiHeadphones,
    FiChevronRight,
    FiChevronDown,
    FiCreditCard,
    FiMapPin,
    FiTool,
    FiCheck,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import "../styles/product-details.css";

const money = (value) =>
    `PKR ${Number(value || 0).toLocaleString("en-PK")}`;

// UI content only. Edit these texts to match your store policies.
const HIGHLIGHTS = [
    { icon: FiShield, title: "100% Genuine", text: "Every product is checked before it ships." },
    { icon: FiCreditCard, title: "Cash on Delivery", text: "Pay when your order reaches you." },
    { icon: FiMapPin, title: "Live Order Tracking", text: "Follow your parcel with a tracking token." },
    { icon: FiTool, title: "Repair Support", text: "Need help later? Our repair desk is here." },
];

const STEPS = [
    { title: "Place your order", text: "Add the product and fill in your delivery details." },
    { title: "We confirm it", text: "Our team verifies the order and prepares your parcel." },
    { title: "Track and receive", text: "Follow it live, then pay on delivery." },
];

const FAQS = [
    { q: "How do I pay for this product?", a: "Checkout supports Cash on Delivery. You pay when the parcel arrives." },
    { q: "Can I track my order after buying?", a: "Yes. After checkout you get a tracking token to use on the Track Order page." },
    { q: "What if I need repair or help?", a: "Open the Repairing page or contact Smartteq support and we will guide you." },
];

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { cartItems, addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    // UI only: 3D tilt on the product image
    const tiltRef = useRef(null);
    const [activeTab, setActiveTab] = useState("description");
    const [openFaq, setOpenFaq] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");
                setProduct(null);
                setImageFailed(false);
                setQuantity(1);

                const response = await fetch(`/api/products/${id}`, {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        Accept: "application/json",
                    },
                    signal: controller.signal,
                });

                const data = await response.json();

                if (!response.ok || !data.success || !data.product) {
                    throw new Error(
                        data.message || "Unable to load this product."
                    );
                }

                setProduct(data.product);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadProduct();

        return () => controller.abort();
    }, [id]);

    // UI only: reveal sections as they scroll into view
    useEffect(() => {
        const els = document.querySelectorAll(".pd-reveal");
        if (!("IntersectionObserver" in window)) {
            els.forEach((el) => el.classList.add("in"));
            return undefined;
        }
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((en) => {
                    if (en.isIntersecting) {
                        en.target.classList.add("in");
                        io.unobserve(en.target);
                    }
                }),
            { threshold: 0.12 }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [product]);

    const handleTilt = (e) => {
        const el = tiltRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
    };

    const resetTilt = () => {
        const el = tiltRef.current;
        if (!el) return;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
    };

    if (loading) {
        return (
            <section className="pd-state">
                <div className="pd-loader" />
                <p>Loading product details...</p>
            </section>
        );
    }

    if (error || !product) {
        return (
            <section className="pd-state">
                <FiAlertCircle size={42} />
                <h2>Product unavailable</h2>
                <p>{error || "This product could not be found."}</p>
                <button onClick={() => navigate("/products")}>
                    <FiArrowLeft /> Back to Products
                </button>
            </section>
        );
    }

    const stock = Number(product.stock || 0);

    const cartProduct = cartItems.find(
        (item) => String(item.id) === String(product.id)
    );

    const cartQuantity = Number(cartProduct?.quantity || 0);

    const remainingStock = Math.max(stock - cartQuantity, 0);

    const outOfStock = stock <= 0;

    const discount =
        Number(product.oldPrice) > Number(product.price)
            ? Math.round(
                ((Number(product.oldPrice) - Number(product.price)) /
                    Number(product.oldPrice)) *
                100
            )
            : 0;

    const savings = Math.max(
        Number(product.oldPrice || 0) - Number(product.price || 0),
        0
    );

    // UI only: stock meter
    const stockPercent = stock > 0 ? Math.round((remainingStock / stock) * 100) : 0;
    const lowStock = !outOfStock && remainingStock <= 5;
    const lineTotal = Number(product.price || 0) * quantity;

    const handleAddToCart = async (buyNow = false) => {
        if (
            adding ||
            outOfStock ||
            quantity > remainingStock
        ) {
            return;
        }

        setAdding(true);

        try {
            const success = await addToCart(product, quantity);

            if (!success) {
                return;
            }

            if (buyNow) {
                navigate("/checkout");
                return;
            }

            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } finally {
            setAdding(false);
        }
    };

    return (
        <main className="product-details-page">
            <div className="pd-bg" aria-hidden="true">
                <span className="pd-orb pd-orb-a" />
                <span className="pd-orb pd-orb-b" />
            </div>

            <div className="pd-container">
                <div className="pd-topbar">
                    <button
                        className="pd-back"
                        onClick={() => navigate("/products")}
                    >
                        <FiArrowLeft />
                        Back to Products
                    </button>

                    <div className="pd-breadcrumb">
                        Home <FiChevronRight /> Products <FiChevronRight />
                        <strong>{product.name}</strong>
                    </div>
                </div>

                <section className="pd-main">
                    <div className="pd-gallery">
                        <div
                            className="pd-image-box"
                            ref={tiltRef}
                            onMouseMove={handleTilt}
                            onMouseLeave={resetTilt}
                        >
                            <span className="pd-glow" aria-hidden="true" />
                            <span className="pd-ring" aria-hidden="true" />

                            {discount > 0 && (
                                <span className="pd-discount">
                                    {discount}% OFF
                                </span>
                            )}

                            {imageFailed || !product.image ? (
                                <div className="pd-image-placeholder">
                                    <FiPackage size={70} />
                                    <span>Image unavailable</span>
                                </div>
                            ) : (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={() => setImageFailed(true)}
                                />
                            )}
                        </div>

                        <div className="pd-perks">
                            <div>
                                <FiShield />
                                <span>Genuine product</span>
                            </div>
                            <div>
                                <FiTruck />
                                <span>Fast delivery</span>
                            </div>
                            <div>
                                <FiHeadphones />
                                <span>Order support</span>
                            </div>
                        </div>
                    </div>

                    <div className="pd-info">
                        <div className="pd-category">
                            {product.category}
                        </div>

                        <h1>{product.name}</h1>

                        <div className="pd-meta">
                            <div className="pd-brand">
                                Brand: <strong>{product.brand || "Generic"}</strong>
                            </div>

                            <div className="pd-rating">
                                <FiCheckCircle />
                                Genuine Smartteq Product
                            </div>
                        </div>

                        <div className="pd-pricebox">
                            <div className="pd-price">
                                <strong>{money(product.price)}</strong>

                                {discount > 0 && (
                                    <s>{money(product.oldPrice)}</s>
                                )}

                                {discount > 0 && (
                                    <span>{discount}% OFF</span>
                                )}
                            </div>

                            {savings > 0 && (
                                <p className="pd-saving">
                                    You save {money(savings)}
                                </p>
                            )}
                        </div>

                        <div
                            className={`pd-stock ${outOfStock ? "pd-stock-out" : ""
                                } ${lowStock ? "pd-stock-low" : ""}`}
                        >
                            <div className="pd-stock-row">
                                {outOfStock ? (
                                    <>
                                        <FiAlertCircle />
                                        Currently unavailable
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle />
                                        In Stock — {remainingStock} available
                                    </>
                                )}
                            </div>

                            <div className="pd-meter" aria-hidden="true">
                                <span style={{ width: `${stockPercent}%` }} />
                            </div>
                        </div>

                        <h3>Product Description</h3>

                        <p className="pd-description">
                            {product.description ||
                                "Contact us for more information about this product."}
                        </p>

                        {!outOfStock && (
                            <div className="pd-quantity">
                                <span>Quantity</span>

                                <div className="pd-quantity-control">
                                    <button
                                        onClick={() =>
                                            setQuantity((q) => Math.max(1, q - 1))
                                        }
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <FiMinus />
                                    </button>

                                    <strong key={quantity}>{quantity}</strong>

                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.min(remainingStock, q + 1)
                                            )
                                        }
                                        disabled={quantity >= remainingStock}
                                        aria-label="Increase quantity"
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                <div className="pd-linetotal">
                                    Total <strong>{money(lineTotal)}</strong>
                                </div>
                            </div>
                        )}

                        <div className="pd-actions">
                            <button
                                className={`pd-add-cart ${added ? "is-added" : ""}`}
                                disabled={
                                    outOfStock ||
                                    quantity > remainingStock ||
                                    adding
                                }
                                onClick={() => handleAddToCart(false)}
                            >
                                {outOfStock ? (
                                    "Out of Stock"
                                ) : added ? (
                                    <>
                                        <FiCheckCircle /> Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <FiShoppingCart />
                                        Add to Cart
                                    </>
                                )}
                            </button>

                            <button
                                className="pd-buy-now"
                                disabled={
                                    outOfStock ||
                                    quantity > remainingStock ||
                                    adding
                                }
                                onClick={() => handleAddToCart(true)}
                            >
                                <FiZap />
                                Buy Now
                            </button>
                        </div>

                        <div className="pd-delivery">
                            <span className="pd-delivery-icon">
                                <FiPackage size={22} />
                            </span>
                            <div>
                                <strong>Smartteq Shopping</strong>
                                <p>Quality products at competitive prices.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pd-highlights pd-reveal">
                    {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                        <div className="pd-hl" key={title}>
                            <span className="pd-hl-icon"><Icon /></span>
                            <strong>{title}</strong>
                            <p>{text}</p>
                        </div>
                    ))}
                </section>

                <section className="pd-tabs-card pd-reveal">
                    <div className="pd-tabs" role="tablist">
                        {[
                            ["description", "Description"],
                            ["specs", "Specifications"],
                            ["delivery", "Delivery & Support"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={activeTab === key}
                                className={activeTab === key ? "active" : ""}
                                onClick={() => setActiveTab(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="pd-tab-panel" key={activeTab}>
                        {activeTab === "description" && (
                            <p className="pd-description pd-description-lg">
                                {product.description ||
                                    "Contact us for more information about this product."}
                            </p>
                        )}

                        {activeTab === "specs" && (
                            <dl className="pd-specs">
                                <div><dt>Product</dt><dd>{product.name}</dd></div>
                                <div><dt>Brand</dt><dd>{product.brand || "Generic"}</dd></div>
                                <div><dt>Category</dt><dd>{product.category || "-"}</dd></div>
                                <div><dt>Product ID</dt><dd>{String(product.id)}</dd></div>
                                <div><dt>Price</dt><dd>{money(product.price)}</dd></div>
                                <div>
                                    <dt>Availability</dt>
                                    <dd>{outOfStock ? "Out of stock" : `${remainingStock} in stock`}</dd>
                                </div>
                            </dl>
                        )}

                        {activeTab === "delivery" && (
                            <ul className="pd-checks">
                                <li><FiCheck /> Cash on Delivery available at checkout.</li>
                                <li><FiCheck /> Tracking token is issued after you place the order.</li>
                                <li><FiCheck /> Repair and product support from the Smartteq team.</li>
                            </ul>
                        )}
                    </div>
                </section>

                <section className="pd-steps-card pd-reveal">
                    <h2>How your order works</h2>
                    <div className="pd-steps">
                        {STEPS.map((step, i) => (
                            <div className="pd-step" key={step.title}>
                                <span className="pd-step-num">{i + 1}</span>
                                <strong>{step.title}</strong>
                                <p>{step.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="pd-faq pd-reveal">
                    <h2>Common questions</h2>
                    {FAQS.map((item, i) => (
                        <div
                            key={item.q}
                            className={`pd-faq-item ${openFaq === i ? "open" : ""}`}
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                                aria-expanded={openFaq === i}
                            >
                                {item.q}
                                <FiChevronDown />
                            </button>
                            <div className="pd-faq-body"><p>{item.a}</p></div>
                        </div>
                    ))}
                </section>

                <section className="pd-cta pd-reveal">
                    <div>
                        <h2>{outOfStock ? "This item is sold out" : "Ready to get yours?"}</h2>
                        <p>
                            {outOfStock
                                ? "Browse more products while we restock."
                                : `${product.name} for ${money(product.price)}. Pay on delivery.`}
                        </p>
                    </div>
                    {outOfStock ? (
                        <button onClick={() => navigate("/products")}>
                            <FiArrowLeft /> Browse Products
                        </button>
                    ) : (
                        <button
                            disabled={quantity > remainingStock || adding}
                            onClick={() => handleAddToCart(true)}
                        >
                            <FiZap /> Buy Now
                        </button>
                    )}
                </section>
            </div>

            {!outOfStock && (
                <div className="pd-sticky">
                    <div>
                        <small>Total</small>
                        <strong>{money(lineTotal)}</strong>
                    </div>
                    <button
                        disabled={quantity > remainingStock || adding}
                        onClick={() => handleAddToCart(false)}
                    >
                        {added ? <><FiCheckCircle /> Added</> : <><FiShoppingCart /> Add to Cart</>}
                    </button>
                </div>
            )}
        </main>
    );
}