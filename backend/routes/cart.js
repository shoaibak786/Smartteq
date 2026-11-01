
import express from "express";
import crypto from "crypto";
import db from "../config/db.js";

const router = express.Router();

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;
const SESSION_DAYS = 30;

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const createToken = () => crypto.randomBytes(32).toString("hex");

const getExpiryDate = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + SESSION_DAYS);
    return expiry;
};

// Find an existing cart session using its private token.
async function findSession(token) {
    if (!token || !TOKEN_PATTERN.test(token)) {
        return null;
    }

    const tokenHash = hashToken(token);

    const [rows] = await db.execute(
        `SELECT id
         FROM cart_sessions
         WHERE token_hash = ? AND expires_at > NOW()
         LIMIT 1`,
        [tokenHash]
    );

    if (rows.length === 0) {
        return null;
    }

    await db.execute(
        `UPDATE cart_sessions
         SET expires_at = ?
         WHERE id = ?`,
        [getExpiryDate(), rows[0].id]
    );

    return rows[0].id;
}

// Create a new cart session.
async function createSession() {
    const token = createToken();

    const [result] = await db.execute(
        `INSERT INTO cart_sessions (token_hash, expires_at)
         VALUES (?, ?)`,
        [hashToken(token), getExpiryDate()]
    );

    return {
        id: result.insertId,
        token,
    };
}

// Read cart contents using the same product format as /api/products.
async function getCartItems(cartId) {
    const [rows] = await db.execute(
        `SELECT
            p.id,
            p.name,
            p.brand,
            p.category,
            p.description,
            p.image,
            p.price,
            p.old_price,
            p.stock,
            p.featured,
            ci.quantity
         FROM cart_items ci
         INNER JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = ? AND p.is_active = TRUE
         ORDER BY ci.created_at DESC`,
        [cartId]
    );

    return rows.map((item) => ({
        id: Number(item.id),
        name: item.name,
        brand: item.brand,
        category: item.category,
        description: item.description,
        image: item.image,
        price: Number(item.price),
        oldPrice:
            item.old_price === null ? null : Number(item.old_price),
        stock: Number(item.stock),
        featured: Boolean(item.featured),
        quantity: Number(item.quantity),
    }));
}

// GET /api/cart
// Creates a session if the browser does not have a valid cart token.
router.get("/", async (req, res) => {
    try {
        const token = String(req.get("x-cart-token") || "").trim();

        let cartId = await findSession(token);
        let newToken = null;

        if (!cartId) {
            const session = await createSession();
            cartId = session.id;
            newToken = session.token;
        }

        const items = await getCartItems(cartId);

        res.json({
            success: true,
            token: newToken,
            items,
        });
    } catch (error) {
        console.error("Get cart error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load your cart.",
        });
    }
});

// POST /api/cart/items
// Adds a quantity of a product to the cart.
router.post("/items", async (req, res) => {
    let connection;

    try {
        const token = String(req.get("x-cart-token") || "").trim();

        if (!TOKEN_PATTERN.test(token)) {
            return res.status(401).json({
                success: false,
                message:
                    "Your cart session is missing or invalid. Please reload your cart.",
            });
        }

        const productId = Number(req.body.productId);
        const quantity = Number(req.body.quantity ?? 1);

        if (
            !Number.isSafeInteger(productId) ||
            productId < 1 ||
            !Number.isSafeInteger(quantity) ||
            quantity < 1 ||
            quantity > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product or quantity.",
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [sessions] = await connection.execute(
            `SELECT id
             FROM cart_sessions
             WHERE token_hash = ? AND expires_at > NOW()
             FOR UPDATE`,
            [hashToken(token)]
        );

        if (sessions.length === 0) {
            await connection.rollback();

            return res.status(401).json({
                success: false,
                message:
                    "Your cart session has expired. Please reload your cart.",
            });
        }

        const cartId = sessions[0].id;

        const [products] = await connection.execute(
            `SELECT id, stock
             FROM products
             WHERE id = ? AND is_active = TRUE
             FOR UPDATE`,
            [productId]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "This product is no longer available.",
            });
        }

        const stock = Number(products[0].stock);

        const [existingItems] = await connection.execute(
            `SELECT quantity
             FROM cart_items
             WHERE cart_id = ? AND product_id = ?
             FOR UPDATE`,
            [cartId, productId]
        );

        const currentQuantity = Number(existingItems[0]?.quantity || 0);
        const newQuantity = currentQuantity + quantity;

        if (newQuantity > stock) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message:
                    stock <= 0
                        ? "This product is out of stock."
                        : `Only ${stock} unit(s) are available.`,
            });
        }

        await connection.execute(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
            [cartId, productId, newQuantity]
        );

        await connection.execute(
            `UPDATE cart_sessions
             SET expires_at = ?
             WHERE id = ?`,
            [getExpiryDate(), cartId]
        );

        await connection.commit();

        const items = await getCartItems(cartId);

        res.json({
            success: true,
            message: "Product added to cart.",
            items,
        });
    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Add cart item error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to add this product to your cart.",
        });
    } finally {
        if (connection) connection.release();
    }
});

// PATCH /api/cart/items/:productId
// Sets the exact quantity of an existing cart item.
router.patch("/items/:productId", async (req, res) => {
    let connection;

    try {
        const token = String(req.get("x-cart-token") || "").trim();
        const productId = Number(req.params.productId);
        const quantity = Number(req.body.quantity);

        if (!TOKEN_PATTERN.test(token)) {
            return res.status(401).json({
                success: false,
                message: "Your cart session is missing or invalid.",
            });
        }

        if (
            !Number.isSafeInteger(productId) ||
            productId < 1 ||
            !Number.isSafeInteger(quantity) ||
            quantity < 1 ||
            quantity > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product or quantity.",
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [sessions] = await connection.execute(
            `SELECT id
             FROM cart_sessions
             WHERE token_hash = ? AND expires_at > NOW()
             FOR UPDATE`,
            [hashToken(token)]
        );

        if (sessions.length === 0) {
            await connection.rollback();

            return res.status(401).json({
                success: false,
                message: "Your cart session has expired.",
            });
        }

        const cartId = sessions[0].id;

        const [products] = await connection.execute(
            `SELECT id, stock
             FROM products
             WHERE id = ? AND is_active = TRUE
             FOR UPDATE`,
            [productId]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "This product is no longer available.",
            });
        }

        if (quantity > Number(products[0].stock)) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: `Only ${Number(products[0].stock)} unit(s) are available.`,
            });
        }

        const [existingItems] = await connection.execute(
            `SELECT id
             FROM cart_items
             WHERE cart_id = ? AND product_id = ?
             FOR UPDATE`,
            [cartId, productId]
        );

        if (existingItems.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "This item is not in your cart.",
            });
        }

        // Update the exact quantity.
        await connection.execute(
            `UPDATE cart_items
             SET quantity = ?
             WHERE cart_id = ? AND product_id = ?`,
            [quantity, cartId, productId]
        );

        await connection.execute(
            `UPDATE cart_sessions
             SET expires_at = ?
             WHERE id = ?`,
            [getExpiryDate(), cartId]
        );

        await connection.commit();

        res.json({
            success: true,
            items: await getCartItems(cartId),
        });
    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Update cart item error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update cart quantity.",
        });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE /api/cart/items/:productId
// Removes one product from the cart.
router.delete("/items/:productId", async (req, res) => {
    try {
        const token = String(req.get("x-cart-token") || "").trim();
        const productId = Number(req.params.productId);

        if (!TOKEN_PATTERN.test(token)) {
            return res.status(401).json({
                success: false,
                message: "Your cart session is missing or invalid.",
            });
        }

        if (!Number.isSafeInteger(productId) || productId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const cartId = await findSession(token);

        if (!cartId) {
            return res.status(401).json({
                success: false,
                message: "Your cart session has expired.",
            });
        }

        await db.execute(
            `DELETE FROM cart_items
             WHERE cart_id = ? AND product_id = ?`,
            [cartId, productId]
        );

        res.json({
            success: true,
            items: await getCartItems(cartId),
        });
    } catch (error) {
        console.error("Remove cart item error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to remove this item.",
        });
    }
});

// DELETE /api/cart
// Clears all products from the cart.
router.delete("/", async (req, res) => {
    try {
        const token = String(req.get("x-cart-token") || "").trim();

        if (!TOKEN_PATTERN.test(token)) {
            return res.status(401).json({
                success: false,
                message: "Your cart session is missing or invalid.",
            });
        }

        const cartId = await findSession(token);

        if (!cartId) {
            return res.status(401).json({
                success: false,
                message: "Your cart session has expired.",
            });
        }

        await db.execute(
            `DELETE FROM cart_items
             WHERE cart_id = ?`,
            [cartId]
        );

        res.json({
            success: true,
            items: [],
        });
    } catch (error) {
        console.error("Clear cart error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to clear your cart.",
        });
    }
});

export default router;
