
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiUrl } from "../config/api";

const CartContext = createContext(null);

const CART_TOKEN_KEY = "smartteq-cart-token";
const CART_CACHE_KEY = "smartteq-cart";
const LEGACY_CART_BACKUP_KEY = "smartteq-cart-legacy-backup";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotificationState] = useState("");

  const tokenRef = useRef(
    localStorage.getItem(CART_TOKEN_KEY) || ""
  );

  const readyPromiseRef = useRef(null);
  const mutationQueueRef = useRef(Promise.resolve());
  const notificationTimerRef = useRef(null);

  // Central notification handler
  const notify = useCallback((message) => {
    setNotificationState(message);

    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    notificationTimerRef.current = setTimeout(() => {
      setNotificationState("");
    }, 3000);
  }, []);

  const setNotification = useCallback((message) => {
    notify(message);
  }, [notify]);

  // Save cart token securely enough for a guest browser session.
  const saveToken = useCallback((token) => {
    if (!token) return;

    tokenRef.current = token;
    localStorage.setItem(CART_TOKEN_KEY, token);
  }, []);

  // Common API request handler
  const cartRequest = useCallback(async (endpoint, options = {}) => {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(tokenRef.current
        ? { "x-cart-token": tokenRef.current }
        : {}),
      ...options.headers,
    };

    const response = await fetch(apiUrl(endpoint), {
      ...options,
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      const error = new Error(
        data.message || "Cart request failed."
      );

      error.status = response.status;
      throw error;
    }

    if (data.token) {
      saveToken(data.token);
    }

    return data;
  }, [saveToken]);

  // Load the database cart and initialize the guest session.
  const loadCart = useCallback(async () => {
    const data = await cartRequest("/api/cart", {
      method: "GET",
    });

    const items = Array.isArray(data.items) ? data.items : [];

    setCartItems(items);

    return true;
  }, [cartRequest]);

  // Preserve the previous local cart before switching to database data.
  useEffect(() => {
    try {
      const oldCart = localStorage.getItem(CART_CACHE_KEY);

      if (
        oldCart &&
        !localStorage.getItem(LEGACY_CART_BACKUP_KEY)
      ) {
        localStorage.setItem(
          LEGACY_CART_BACKUP_KEY,
          oldCart
        );
      }
    } catch (error) {
      console.error("Cart backup failed:", error);
    }

    readyPromiseRef.current = loadCart().catch((error) => {
      console.error("Database cart loading failed:", error);
      notify("Unable to connect to your cart. Please refresh the page.");
      return false;
    });

    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, [loadCart, notify]);

  // Keep a local cache for quick display on the next visit.
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_CACHE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Cart cache save failed:", error);
    }
  }, [cartItems]);

  // Serialize cart mutations to avoid overlapping requests.
  const queueMutation = useCallback((operation) => {
    const task = mutationQueueRef.current.then(async () => {
      const ready = await readyPromiseRef.current;

      if (!ready) {
        // Retry session/cart initialization if the first load failed.
        try {
          readyPromiseRef.current = loadCart();
          await readyPromiseRef.current;
        } catch {
          throw new Error("Your cart is not connected. Please try again.");
        }
      }

      const data = await operation();

      if (Array.isArray(data.items)) {
        setCartItems(data.items);
      }

      return data;
    });

    // Keep the queue usable even if one request fails.
    mutationQueueRef.current = task.catch(() => { });

    return task;
  }, [loadCart]);

  // Add a product using its database ID.
  const addToCart = useCallback((product, quantity = 1) => {
    const requestedQuantity = Number(quantity);

    if (!product?.id) {
      notify("Invalid product.");
      return;
    }

    if (
      !Number.isSafeInteger(requestedQuantity) ||
      requestedQuantity < 1 ||
      requestedQuantity > 100
    ) {
      notify("Please select a valid quantity (1–100).");
      return;
    }

    return queueMutation(() =>
      cartRequest("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(product.id),
          quantity: requestedQuantity,
        }),
      })
    )
      .then(() => {
        notify("Product added to cart successfully!");
        return true;
      })
      .catch((error) => {
        console.error("Add to cart failed:", error);
        notify(error.message || "Could not add product to cart.");
        return false;
      });
  }, [cartRequest, notify, queueMutation]);

  // Keep compatibility with existing product components.
  useEffect(() => {
    const handleAddToCart = (event) => {
      const product = event.detail?.product;

      if (product) {
        addToCart(product, event.detail?.quantity ?? 1);
      }
    };

    window.addEventListener(
      "smartteq:add-to-cart",
      handleAddToCart
    );

    return () => {
      window.removeEventListener(
        "smartteq:add-to-cart",
        handleAddToCart
      );
    };
  }, [addToCart]);

  // Set an exact quantity on the backend.
  const updateQuantity = useCallback((id, quantity) => {
    const productId = Number(id);
    const newQuantity = Number(quantity);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return;
    }

    return queueMutation(() =>
      cartRequest(`/api/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      })
    ).catch((error) => {
      console.error("Cart quantity update failed:", error);
      notify(error.message || "Could not update quantity.");
    });
  }, [cartRequest, notify, queueMutation]);

  // Remove a product from the backend cart.
  const removeFromCart = useCallback((id) => {
    const productId = Number(id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return;
    }

    return queueMutation(() =>
      cartRequest(`/api/cart/items/${productId}`, {
        method: "DELETE",
      })
    )
      .then(() => {
        notify("Product removed from cart.");
      })
      .catch((error) => {
        console.error("Remove from cart failed:", error);
        notify(error.message || "Could not remove product.");
      });
  }, [cartRequest, notify, queueMutation]);

  // Clear the complete backend cart.
  const clearCart = useCallback(() => {
    return queueMutation(() =>
      cartRequest("/api/cart", {
        method: "DELETE",
      })
    )
      .then(() => {
        notify("Cart cleared successfully.");
      })
      .catch((error) => {
        console.error("Clear cart failed:", error);
        notify(error.message || "Could not clear cart.");
      });
  }, [cartRequest, notify, queueMutation]);

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        notification,
        setNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
