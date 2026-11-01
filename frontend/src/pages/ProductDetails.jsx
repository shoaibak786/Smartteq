
import React, { useEffect, useState } from "react";
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
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import "../styles/product-details.css";

const money = (value) =>
    `PKR ${Number(value || 0).toLocaleString("en-PK")}`;

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
            <div className="pd-container">
                <button
                    className="pd-back"
                    onClick={() => navigate("/products")}
                >
                    <FiArrowLeft />
                    Back to Products
                </button>

                <div className="pd-breadcrumb">
                    Home <span>/</span> Products <span>/</span>
                    <strong>{product.name}</strong>
                </div>

                <section className="pd-main">
                    <div className="pd-gallery">
                        <div className="pd-image-box">
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
                    </div>

                    <div className="pd-info">
                        <div className="pd-category">
                            {product.category}
                        </div>

                        <h1>{product.name}</h1>

                        <div className="pd-brand">
                            Brand: <strong>{product.brand || "Generic"}</strong>
                        </div>

                        <div className="pd-rating">
                            <FiCheckCircle />
                            Genuine Smartteq Product
                        </div>

                        <div className="pd-divider" />

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

                        <div
                            className={`pd-stock ${outOfStock ? "pd-stock-out" : ""
                                }`}
                        >
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

                        <div className="pd-divider" />

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

                                    <strong>{quantity}</strong>

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
                            </div>
                        )}

                        <div className="pd-actions">
                            <button
                                className="pd-add-cart"
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
                            <FiPackage size={22} />
                            <div>
                                <strong>Smartteq Shopping</strong>
                                <p>Quality products at competitive prices.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
