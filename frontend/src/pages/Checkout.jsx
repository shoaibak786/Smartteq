
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingBag,
    MapPin,
    User,
    Phone,
    Mail,
    CheckCircle2,
    PackageCheck,
    Monitor,
    Truck,
    MessageCircle,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../styles/Checkout.css";
import { apiUrl } from "../config/api";

const formatPrice = (price) =>
    `PKR ${Number(price || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function Checkout() {
    const { cartItems, subtotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        area: "",
        city: "Lahore",
        postalCode: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});
    const [placedOrder, setPlacedOrder] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =====================================
    // SECURE TRACKING TOKEN
    // =====================================

    const trackingToken = placedOrder?.trackingToken;

    const isValidTrackingToken =
        typeof trackingToken === "string" &&
        /^[a-f0-9]{64}$/i.test(trackingToken);

    // =====================================
    // AUTOMATIC TRACKING REDIRECT
    // =====================================

    useEffect(() => {
        if (!isValidTrackingToken) return;

        const timer = setTimeout(() => {
            navigate(
                `/track-order/${encodeURIComponent(trackingToken)}`,
                { replace: true }
            );
        }, 8000);

        return () => clearTimeout(timer);
    }, [trackingToken, isValidTrackingToken, navigate]);

    // =====================================
    // FORM CHANGE
    // =====================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    // =====================================
    // FORM VALIDATION
    // =====================================

    const validateForm = () => {
        const newErrors = {};

        if (!form.fullName.trim()) {
            newErrors.fullName = "Please enter your full name.";
        }

        if (!form.phone.trim()) {
            newErrors.phone = "Please enter your phone number.";
        } else if (!/^[+0-9\s()-]{10,20}$/.test(form.phone.trim())) {
            newErrors.phone = "Please enter a valid phone number.";
        }

        if (
            form.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        ) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!form.address.trim()) {
            newErrors.address = "Please enter your complete address.";
        }

        if (!form.city.trim()) {
            newErrors.city = "Please enter your city.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =====================================
    // PLACE ORDER
    // =====================================

    const handlePlaceOrder = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;
        if (cartItems.length === 0 || isSubmitting) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const response = await fetch(apiUrl("/api/orders"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customer: form,

                    items: cartItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),

                    paymentMethod: "Cash on Delivery",
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.order) {
                throw new Error(
                    data.message || "Unable to place your order."
                );
            }
            // Notify frontend to refresh product stock
            window.dispatchEvent(
                new Event("smartteq:stock-updated")
            );
            // Save actual backend order response
            // Clear backend cart after successful order
            await clearCart();

            // Save actual backend order response
            setPlacedOrder({
                ...data.order,
                createdAt: new Date().toISOString(),
            });

        } catch (error) {
            console.error("Order submission error:", error);

            setErrors({
                form:
                    error.message ||
                    "Unable to place your order. Please try again.",
            });

        } finally {
            setIsSubmitting(false);
        }
    };

    // =====================================
    // 3D ORDER SUCCESS SCREEN
    // =====================================

    if (placedOrder) {
        return (
            <section className="checkout-page">
                <div className="checkout-success checkout-success-3d premium-success">

                    <div className="premium-topline">
                        <span className="premium-live-dot" />
                        SMARTTEQ ORDER SYSTEM
                        <span className="premium-secure">SECURE CHECKOUT</span>
                    </div>

                    {/* PREMIUM DELIVERY ANIMATION */}

                    <div className="premium-delivery">

                        <div className="premium-scene">

                            <div className="scene-orb orb-one" />
                            <div className="scene-orb orb-two" />
                            <div className="scene-orb orb-three" />

                            {/* WEBSITE */}

                            <div className="premium-object premium-website">
                                <div className="premium-platform">
                                    <div className="premium-icon website-3d-icon">
                                        <Monitor size={43} strokeWidth={1.6} />
                                    </div>

                                    <div className="platform-reflection" />
                                </div>

                                <strong>SMARTTEQ</strong>
                                <span>Online Store</span>

                                <i className="object-status">
                                    <span /> Connected
                                </i>
                            </div>

                            {/* MESSAGE TRAVEL */}

                            <div className="premium-message">
                                <div className="message-icon">
                                    <MessageCircle size={20} />
                                </div>

                                <div className="message-copy">
                                    <strong>New Order!</strong>
                                    <span>Order received</span>
                                </div>

                                <span className="message-sparkle">✦</span>
                            </div>

                            {/* LIGHT TRAIL */}

                            <div className="message-trail" />

                            {/* ROAD */}

                            <div className="premium-road">
                                <span className="road-center-line" />
                            </div>

                            {/* TRUCK */}

                            <div className="premium-object premium-truck">
                                <div className="premium-platform">
                                    <div className="premium-icon truck-3d-icon">
                                        <Truck size={48} strokeWidth={1.6} />
                                    </div>

                                    <div className="platform-reflection" />
                                </div>

                                <strong>DELIVERY</strong>
                                <span>Processing your order</span>

                                <i className="object-status truck-status">
                                    <span /> Ready for processing
                                </i>
                            </div>

                            {/* FLOOR GLOW */}

                            <div className="scene-floor-glow" />

                        </div>

                        <div className="premium-animation-caption">
                            <span className="caption-loader" />
                            <span>
                                Transferring your order to our delivery team
                            </span>
                        </div>

                    </div>

                    {/* SUCCESS CONTENT */}

                    <div className="premium-success-content">

                        <div className="premium-success-icon">
                            <CheckCircle2 size={43} strokeWidth={1.8} />
                            <span className="success-icon-ring" />
                        </div>

                        <span className="premium-success-label">
                            <span /> ORDER SUCCESSFULLY RECEIVED
                        </span>

                        <h1>
                            You're All Set!
                            <span>Your Order Has Been Placed.</span>
                        </h1>

                        <p className="premium-success-description">
                            Thank you for choosing Smartteq. Your order has
                            reached us successfully. Our team will contact
                            you shortly to confirm the details.
                        </p>

                        {/* ORDER ID */}

                        <div className="premium-order-id">
                            <div>
                                <span>YOUR ORDER NUMBER</span>
                                <strong>{placedOrder.orderId}</strong>
                            </div>

                            <div className="order-id-check">
                                <CheckCircle2 size={22} />
                            </div>
                        </div>

                        {/* ORDER DETAILS */}

                        <div className="checkout-success-details premium-order-details">

                            <div>
                                <span>Payment method</span>
                                <strong>
                                    {placedOrder.paymentMethod || "Cash on Delivery"}
                                </strong>
                            </div>

                            <div>
                                <span>Order total (shipping not included)</span>
                                <strong>{formatPrice(placedOrder.total)}</strong>
                            </div>

                            <div>
                                <span>Order status</span>
                                <strong className="checkout-pending premium-pending">
                                    <span /> {placedOrder.status || "Pending"}
                                </strong>
                            </div>

                        </div>

                        {/* NEXT STEPS */}

                        <div className="premium-next-step">
                            <div className="next-step-icon">
                                <PackageCheck size={21} />
                            </div>

                            <div>
                                <strong>What's next?</strong>
                                <p>
                                    Our team will review your order and contact
                                    you before dispatch.
                                </p>
                            </div>
                        </div>

                        {/* TRACKING AND SHOPPING BUTTONS */}

                        {isValidTrackingToken ? (
                            <div className="premium-action-buttons">

                                <Link
                                    to={`/track-order/${encodeURIComponent(trackingToken)}`}
                                    className="checkout-primary-button premium-continue-button"
                                >
                                    Track Your Order
                                    <span>→</span>
                                </Link>

                                <Link
                                    to="/products"
                                    className="checkout-primary-button premium-continue-button"
                                >
                                    Continue Shopping
                                    <span>→</span>
                                </Link>

                            </div>
                        ) : (
                            <div className="premium-next-step">
                                <div className="next-step-icon">
                                    <PackageCheck size={21} />
                                </div>

                                <div>
                                    <strong>Order successfully placed</strong>
                                    <p>
                                        Your tracking link is currently
                                        unavailable. Please contact Smartteq
                                        support for tracking assistance.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* AUTOMATIC REDIRECT MESSAGE */}

                        {isValidTrackingToken && (
                            <p className="premium-footer-note">
                                You will be redirected to your tracking page
                                automatically in 8 seconds.
                            </p>
                        )}

                        <div className="premium-footer-note">
                            Thank you for shopping with{" "}
                            <strong>SMARTTEQ</strong>
                        </div>

                    </div>
                </div>
            </section>
        );
    }

    // =====================================
    // EMPTY CART
    // =====================================

    if (cartItems.length === 0) {
        return (
            <section className="checkout-page">
                <div className="checkout-empty">
                    <ShoppingBag size={46} />

                    <h1>Your cart is empty</h1>

                    <p>
                        Add products to your cart before proceeding to checkout.
                    </p>

                    <Link
                        to="/products"
                        className="checkout-primary-button"
                    >
                        Browse Products
                    </Link>
                </div>
            </section>
        );
    }

    // =====================================
    // CHECKOUT FORM
    // =====================================

    return (
        <section className="checkout-page">
            <div className="checkout-container">

                <div className="checkout-heading">
                    <div>
                        <span className="checkout-eyebrow">FINAL STEP</span>

                        <h1>Checkout</h1>

                        <p>
                            Enter your delivery details to place your order.
                        </p>
                    </div>

                    <Link to="/cart" className="checkout-back-link">
                        <ArrowLeft size={17} />
                        Back to Cart
                    </Link>
                </div>

                <form onSubmit={handlePlaceOrder} noValidate>
                    <div className="checkout-layout">

                        <div className="checkout-form-column">

                            {/* CUSTOMER INFORMATION */}

                            <div className="checkout-card">
                                <div className="checkout-section-heading">
                                    <span className="checkout-section-icon">
                                        <User size={19} />
                                    </span>

                                    <div>
                                        <h2>Customer Information</h2>
                                        <p>Your contact details</p>
                                    </div>
                                </div>

                                <div className="checkout-form-grid">

                                    <div className="checkout-field checkout-field-full">
                                        <label htmlFor="fullName">
                                            Full Name *
                                        </label>

                                        <input
                                            id="fullName"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                        />

                                        {errors.fullName && (
                                            <small>{errors.fullName}</small>
                                        )}
                                    </div>

                                    <div className="checkout-field">
                                        <label htmlFor="phone">
                                            Phone Number *
                                        </label>

                                        <div className="checkout-input-icon">
                                            <Phone size={17} />

                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="03XX XXXXXXX"
                                                autoComplete="tel"
                                            />
                                        </div>

                                        {errors.phone && (
                                            <small>{errors.phone}</small>
                                        )}
                                    </div>

                                    <div className="checkout-field">
                                        <label htmlFor="email">
                                            Email Address
                                        </label>

                                        <div className="checkout-input-icon">
                                            <Mail size={17} />

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                            />
                                        </div>

                                        {errors.email && (
                                            <small>{errors.email}</small>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* DELIVERY ADDRESS */}

                            <div className="checkout-card">
                                <div className="checkout-section-heading">
                                    <span className="checkout-section-icon">
                                        <MapPin size={19} />
                                    </span>

                                    <div>
                                        <h2>Delivery Address</h2>
                                        <p>
                                            Where should we deliver your order?
                                        </p>
                                    </div>
                                </div>

                                <div className="checkout-form-grid">

                                    <div className="checkout-field checkout-field-full">
                                        <label htmlFor="address">
                                            Complete Address *
                                        </label>

                                        <input
                                            id="address"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="House number, street, building"
                                            autoComplete="street-address"
                                        />

                                        {errors.address && (
                                            <small>{errors.address}</small>
                                        )}
                                    </div>

                                    <div className="checkout-field">
                                        <label htmlFor="area">
                                            Area / Town
                                        </label>

                                        <input
                                            id="area"
                                            name="area"
                                            value={form.area}
                                            onChange={handleChange}
                                            placeholder="e.g. Johar Town"
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label htmlFor="city">City *</label>

                                        <input
                                            id="city"
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="Enter your city"
                                            autoComplete="address-level2"
                                        />

                                        {errors.city && (
                                            <small>{errors.city}</small>
                                        )}
                                    </div>

                                    <div className="checkout-field">
                                        <label htmlFor="postalCode">
                                            Postal Code
                                        </label>

                                        <input
                                            id="postalCode"
                                            name="postalCode"
                                            value={form.postalCode}
                                            onChange={handleChange}
                                            placeholder="Postal code"
                                            autoComplete="postal-code"
                                        />
                                    </div>

                                    <div className="checkout-field checkout-field-full">
                                        <label htmlFor="notes">
                                            Order Notes (Optional)
                                        </label>

                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Any special delivery instructions?"
                                            rows={3}
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* PAYMENT */}

                            <div className="checkout-card">
                                <div className="checkout-section-heading">
                                    <span className="checkout-section-icon">
                                        <PackageCheck size={19} />
                                    </span>

                                    <div>
                                        <h2>Payment Method</h2>
                                        <p>Choose how you want to pay</p>
                                    </div>
                                </div>

                                <label className="checkout-payment-option">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked
                                        readOnly
                                    />

                                    <span className="checkout-payment-radio" />

                                    <span className="checkout-payment-copy">
                                        <strong>Cash on Delivery</strong>

                                        <small>
                                            Pay when your order arrives.
                                        </small>
                                    </span>

                                    <span className="checkout-cod-tag">
                                        COD
                                    </span>
                                </label>
                            </div>

                            {errors.form && (
                                <p className="checkout-form-error">
                                    {errors.form}
                                </p>
                            )}

                        </div>

                        {/* ORDER SUMMARY */}

                        <aside className="checkout-summary">

                            <h2>Order Summary</h2>

                            <p className="checkout-summary-count">
                                {cartItems.reduce(
                                    (total, item) =>
                                        total + item.quantity,
                                    0
                                )}{" "}
                                item(s) in your order
                            </p>

                            <div className="checkout-summary-items">

                                {cartItems.map((item) => (
                                    <div
                                        className="checkout-summary-item"
                                        key={item.id}
                                    >
                                        <div className="checkout-summary-image">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                            />

                                            <span>{item.quantity}</span>
                                        </div>

                                        <div className="checkout-summary-product">
                                            <h3>{item.name}</h3>

                                            <span>
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        <strong>
                                            {formatPrice(
                                                item.price * item.quantity
                                            )}
                                        </strong>
                                    </div>
                                ))}

                            </div>

                            <div className="checkout-summary-line">
                                <span>Subtotal</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>

                            <div className="checkout-summary-line">
                                <span>Shipping</span>
                                <strong>To be confirmed</strong>
                            </div>

                            <div className="checkout-summary-total">
                                <span>Estimated Total</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>

                            <p className="checkout-shipping-note">
                                Delivery charges will be confirmed separately.
                            </p>

                            <button
                                type="submit"
                                className="checkout-place-order"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Placing Order..."
                                    : "Place Order"}
                            </button>

                            <p className="checkout-terms-note">
                                By placing your order, you confirm that your
                                delivery details are correct.
                            </p>

                        </aside>

                    </div>
                </form>
            </div>
        </section>
    );
}
