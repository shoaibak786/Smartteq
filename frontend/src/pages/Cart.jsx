import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    ShoppingCart,
    ShieldCheck,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../styles/Cart.css";

const formatPrice = (price) =>
    `PKR ${price.toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function Cart() {
    const {
        cartItems,
        subtotal,
        updateQuantity,
        removeFromCart,
    } = useCart();

    const reduce = useReducedMotion();

    if (cartItems.length === 0) {
        return (
            <section className="cart-page">
                <div className="cart-bg" aria-hidden="true">
                    <span className="cart-orb cart-orb-a" />
                    <span className="cart-orb cart-orb-b" />
                </div>

                <motion.div
                    className="cart-empty"
                    initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="cart-empty-icon">
                        <span className="cart-empty-ring" aria-hidden="true" />
                        <span className="cart-empty-ring cart-empty-ring-2" aria-hidden="true" />
                        <ShoppingBag size={48} />
                    </div>

                    <h1>Your Cart is Empty</h1>
                    <p>
                        Looks like you haven't added anything to your cart yet.
                        Explore our products and find something you love.
                    </p>

                    <Link to="/products" className="cart-shop-button">
                        <ShoppingCart size={18} />
                        Start Shopping
                    </Link>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="cart-page">
            <div className="cart-bg" aria-hidden="true">
                <span className="cart-orb cart-orb-a" />
                <span className="cart-orb cart-orb-b" />
            </div>

            <div className="cart-container">
                <motion.div
                    className="cart-heading"
                    initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div>
                        <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
                        <h1>Shopping Cart</h1>
                        <p>
                            You have {cartItems.length} product(s) in your cart.
                        </p>
                    </div>

                    <Link to="/products" className="continue-shopping">
                        <ArrowLeft size={17} />
                        Continue Shopping
                    </Link>
                </motion.div>

                <div className="cart-layout">
                    <div className="cart-items">
                        <AnimatePresence mode="popLayout">
                            {cartItems.map((item, index) => (
                                <motion.article
                                    className="cart-item"
                                    key={item.id}
                                    layout={!reduce}
                                    initial={reduce ? false : { opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40, scale: 0.97 }}
                                    transition={{
                                        duration: 0.45,
                                        ease: [0.22, 1, 0.36, 1],
                                        delay: reduce ? 0 : Math.min(index, 6) * 0.07,
                                    }}
                                >
                                    <div className="cart-product-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>

                                    <div className="cart-product-info">
                                        <span>{item.category}</span>
                                        <h3>{item.name}</h3>
                                        <strong>{formatPrice(item.price)}</strong>

                                        <button
                                            className="cart-remove-mobile"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 size={15} />
                                            Remove
                                        </button>
                                    </div>

                                    <div className="cart-quantity">
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.id, item.quantity - 1)
                                            }
                                            disabled={item.quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={15} />
                                        </button>

                                        <motion.span
                                            key={item.quantity}
                                            initial={reduce ? false : { scale: 1.35, color: "#2563eb" }}
                                            animate={{ scale: 1, color: "#111827" }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {item.quantity}
                                        </motion.span>

                                        <button
                                            onClick={() =>
                                                updateQuantity(item.id, item.quantity + 1)
                                            }
                                            disabled={
                                                item.stock != null &&
                                                item.quantity >= item.stock
                                            }
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={15} />
                                        </button>
                                    </div>

                                    <div className="cart-item-total">
                                        <strong>
                                            {formatPrice(item.price * item.quantity)}
                                        </strong>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label={`Remove ${item.name}`}
                                            className="cart-remove-desktop"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>

                    <motion.aside
                        className="cart-summary"
                        initial={reduce ? false : { opacity: 0, x: 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <strong>Calculated at checkout</strong>
                        </div>

                        <div className="summary-divider" />

                        <div className="summary-total">
                            <span>Estimated Total</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>

                        <Link to="/checkout" className="cart-checkout-button">
                            Proceed to Checkout
                        </Link>

                        <p className="cart-secure-note">
                            <ShieldCheck size={14} />
                            Secure checkout coming soon.
                        </p>
                    </motion.aside>
                </div>
            </div>
        </section>
    );
}
