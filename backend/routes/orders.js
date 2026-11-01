
import express from "express";
import crypto from "crypto";
import db from "../config/db.js";

const router = express.Router();

const formatPrice = (value) =>
    Math.round(Number(value) * 100) / 100;

// =====================================
// SECURE ORDER TRACKING API
// =====================================

router.get("/track/:token", async (req, res) => {
    let connection;

    try {
        const { token } = req.params;

        if (!/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tracking link.",
            });
        }

        const trackingTokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        connection = await db.getConnection();

        const [orders] = await connection.execute(
            `SELECT
        order_id,
        customer_name,
                payment_method,
        status,
        total,
        created_at
       FROM orders
       WHERE tracking_token_hash = ?
       LIMIT 1`,
            [trackingTokenHash]
        );

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "Order not found or tracking link is invalid.",
            });
        }

        const order = orders[0];

        const [items] = await connection.execute(
            `SELECT
        product_id,
        product_name,
        price,
        quantity
       FROM order_items
       WHERE order_id = ?`,
            [order.order_id]
        );

        return res.json({
            success: true,
            order: {
                orderId: order.order_id,
                status: order.status,
                total: Number(order.total),
                paymentMethod: order.payment_method,
                orderDate: order.created_at,
                customer: {
                    fullName: order.customer_name,
                },
                items: items.map((item) => ({
                    id: item.product_id,
                    name: item.product_name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                })),
            },
        });

    } catch (error) {
        console.error("Order tracking error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to track your order.",
        });

    } finally {
        connection?.release();
    }
});

// =====================================
// ORDER LOOKUP API
// =====================================


router.post("/lookup", async (req, res) => {
    let connection;

    try {
        const orderId = String(req.body?.orderId || "")
            .trim()
            .toUpperCase();

        const phone = String(req.body?.phone || "")
            .replace(/[\s\-+]/g, "");

        if (
            !/^STQ-[A-F0-9]{8}$/.test(orderId) ||
            !/^\d{10,15}$/.test(phone)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid Order ID and phone number.",
            });
        }

        connection = await db.getConnection();

        const [orders] = await connection.execute(
            `SELECT
        order_id,
        customer_name,
        phone,
              payment_method,
        status,
        total,
        created_at
       FROM orders
       WHERE order_id = ?
         AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ?
       LIMIT 1`,
            [orderId, phone]
        );

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "Order ID or phone number does not match our records.",
            });
        }

        const order = orders[0];

        const [items] = await connection.execute(
            `SELECT
        product_id,
        product_name,
        price,
        quantity
       FROM order_items
       WHERE order_id = ?`,
            [order.order_id]
        );

        return res.json({
            success: true,
            order: {
                orderId: order.order_id,
                status: order.status,
                total: Number(order.total),
                paymentMethod: order.payment_method,
                orderDate: order.created_at,
                customer: {
                    fullName: order.customer_name,
                },
                items: items.map((item) => ({
                    id: item.product_id,
                    name: item.product_name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                })),
            },
        });

    } catch (error) {
        console.error("Order lookup error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify your order. Please try again.",
        });

    } finally {
        connection?.release();
    }
});


// =====================================
// PLACE ORDER
// =====================================

router.post("/", async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { customer, items } = req.body || {};

        // CUSTOMER VALIDATION

        const fullName = String(customer?.fullName || "").trim();
        const phone = String(customer?.phone || "").trim();
        const email = String(customer?.email || "").trim();
        const address = String(customer?.address || "").trim();
        const area = String(customer?.area || "").trim();
        const city = String(customer?.city || "").trim();
        const postalCode = String(customer?.postalCode || "").trim();
        const notes = String(customer?.notes || "").trim();

        if (!fullName || !phone || !address || !city) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required customer details.",
            });
        }

        if (
            fullName.length > 150 ||
            phone.length > 30 ||
            address.length > 500 ||
            city.length > 100 ||
            area.length > 100 ||
            postalCode.length > 20 ||
            notes.length > 1000 ||
            email.length > 150
        ) {
            return res.status(400).json({
                success: false,
                message: "Some customer details exceed the allowed length.",
            });
        }

        if (!/^[+0-9\s()-]{10,20}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid phone number.",
            });
        }

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        // PAYMENT VALIDATION

        const paymentMethod = "Cash on Delivery";

        // ITEM VALIDATION

        if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Your order must contain between 1 and 50 products.",
            });
        }

        // Combine duplicate product IDs.
        // Never trust frontend prices or product names.

        const quantityMap = new Map();

        for (const item of items) {
            const id = Number(item?.id);
            const quantity = Number(item?.quantity);

            if (
                !Number.isSafeInteger(id) ||
                id < 1 ||
                !Number.isSafeInteger(quantity) ||
                quantity < 1 ||
                quantity > 1000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID or quantity.",
                });
            }

            const previousQuantity = quantityMap.get(id) || 0;
            const totalQuantity = previousQuantity + quantity;

            if (totalQuantity > 1000) {
                return res.status(400).json({
                    success: false,
                    message: "Requested product quantity is too high.",
                });
            }

            quantityMap.set(id, totalQuantity);
        }

        // Sort IDs to maintain a consistent lock order.
        const requestedIds = [...quantityMap.keys()].sort(
            (a, b) => a - b
        );

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // LOCK AND VERIFY DATABASE PRODUCTS

        const placeholders = requestedIds.map(() => "?").join(", ");

        const [products] = await connection.execute(
            `SELECT id, name, price, stock
       FROM products
       WHERE id IN (${placeholders})
         AND is_active = TRUE
       ORDER BY id
       FOR UPDATE`,
            requestedIds
        );

        if (products.length !== requestedIds.length) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "One or more products are unavailable.",
            });
        }

        const productMap = new Map(
            products.map((product) => [
                Number(product.id),
                product,
            ])
        );

        const verifiedItems = [];
        let subtotal = 0;

        for (const id of requestedIds) {
            const product = productMap.get(id);
            const quantity = quantityMap.get(id);

            const price = formatPrice(product.price);
            const stock = Number(product.stock);

            if (!Number.isFinite(price) || price < 0) {
                throw new Error("Invalid database product price.");
            }

            if (!Number.isSafeInteger(stock) || stock < quantity) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(409).json({
                    success: false,
                    message: `${product.name} does not have enough stock. Available stock: ${Math.max(stock, 0)}.`,
                });
            }

            subtotal += price * quantity;

            verifiedItems.push({
                id,
                name: product.name,
                price,
                quantity,
            });
        }

        subtotal = formatPrice(subtotal);

        // GENERATE SECURE ORDER DETAILS

        const orderId = `STQ-${crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()}`;

        const trackingToken = crypto.randomBytes(32).toString("hex");

        const trackingTokenHash = crypto
            .createHash("sha256")
            .update(trackingToken)
            .digest("hex");

        // SAVE ORDER

        await connection.execute(
            `INSERT INTO orders (
        order_id,
        customer_name,
        phone,
        email,
        address,
        area,
        city,
        postal_code,
        notes,
        subtotal,
        shipping,
        total,
        payment_method,
        status,
        tracking_token_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderId,
                fullName,
                phone,
                email || null,
                address,
                area || null,
                city,
                postalCode || null,
                notes || null,
                subtotal,
                0,
                subtotal,
                paymentMethod,
                "Pending",
                trackingTokenHash,
            ]
        );

        // SAVE VERIFIED ORDER ITEMS

        for (const item of verifiedItems) {
            await connection.execute(
                `INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          price,
          quantity
        ) VALUES (?, ?, ?, ?, ?)`,
                [
                    orderId,
                    String(item.id),
                    item.name,
                    item.price,
                    item.quantity,
                ]
            );
        }

        // DEDUCT STOCK SAFELY

        for (const item of verifiedItems) {
            const [result] = await connection.execute(
                `UPDATE products
         SET stock = stock - ?
         WHERE id = ?
           AND stock >= ?
           AND is_active = TRUE`,
                [
                    item.quantity,
                    item.id,
                    item.quantity,
                ]
            );

            if (result.affectedRows !== 1) {
                throw new Error(
                    `Stock update failed for product ${item.id}.`
                );
            }
        }

        // COMMIT TRANSACTION

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Your order has been placed successfully!",
            order: {
                orderId,
                subtotal,
                total: subtotal,
                status: "Pending",
                paymentMethod,
                trackingToken,
            },
        });

    } catch (error) {
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Order rollback error:", rollbackError);
            }
        }

        console.error("Place order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to place your order. Please try again.",
        });

    } finally {
        connection?.release();
    }
});

export default router;
