
import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    ShoppingCart,
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

    if (cartItems.length === 0) {
        return (
            <section className="cart-page">
                <div className="cart-empty">
                    <div className="cart-empty-icon">
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
                </div>
            </section>
        );
    }

    return (
        <section className="cart-page">
            <div className="cart-container">
                <div className="cart-heading">
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
                </div>

                <div className="cart-layout">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <article className="cart-item" key={item.id}>
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

                                    <span>{item.quantity}</span>

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
                            </article>
                        ))}
                    </div>

                    <aside className="cart-summary">
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
                            Secure checkout coming soon.
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
}
