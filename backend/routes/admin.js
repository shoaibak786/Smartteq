
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import db from "../config/db.js";
import adminAuth from "../middleware/adminAuth.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// =====================================
// ADMIN PRODUCT IMAGE UPLOAD API
// =====================================

router.post("/products/upload-image", adminAuth, (req, res) => {
    productImageUpload.single("image")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.code === "LIMIT_FILE_SIZE"
                    ? "Image size must not exceed 5 MB."
                    : error.message || "Image upload failed."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Product image uploaded successfully.",
            image: `/uploads/products/${req.file.filename}`
        });
    });
});

// =====================================
// PRODUCT IMAGE UPLOAD CONFIGURATION
// =====================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productUploadDir = path.join(
    __dirname,
    "..",
    "uploads",
    "products"
);

fs.mkdirSync(productUploadDir, { recursive: true });

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, productUploadDir);
    },

    filename: (req, file, cb) => {
        const extension = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif"
        }[file.mimetype];

        cb(null, `${crypto.randomUUID()}${extension}`);
    }
});

const productImageUpload = multer({
    storage: imageStorage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only JPG, PNG, WEBP and GIF images are allowed.")
            );
        }

        cb(null, true);
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }
});

const setupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false
});

// One-time Super Admin setup
router.post("/setup", setupLimiter, async (req, res) => {
    try {
        const setupKey = req.headers["x-admin-setup-key"];
        const expectedKey = process.env.ADMIN_SETUP_KEY;

        if (
            typeof setupKey !== "string" ||
            typeof expectedKey !== "string" ||
            Buffer.byteLength(setupKey) !== Buffer.byteLength(expectedKey) ||
            !crypto.timingSafeEqual(
                Buffer.from(setupKey),
                Buffer.from(expectedKey)
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid setup authorization."
            });
        }

        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            !/^[a-zA-Z0-9_]{3,50}$/.test(username) ||
            typeof password !== "string" ||
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Username must be 3-50 characters. Password must be 12-72 bytes."
            });
        }

        // Lock prevents two simultaneous setup requests
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            await connection.query(
                "SELECT GET_LOCK('smartteq_admin_setup', 10)"
            );

            const [admins] = await connection.execute(
                "SELECT id FROM admin_users LIMIT 1"
            );

            if (admins.length > 0) {
                await connection.rollback();

                return res.status(409).json({
                    success: false,
                    message: "Super Admin has already been created."
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            await connection.execute(
                `INSERT INTO admin_users
                 (id, username, password_hash, role, is_active)
                 VALUES (1, ?, ?, 'super_admin', TRUE)`,
                [username, passwordHash]
            );

            await connection.commit();

            return res.status(201).json({
                success: true,
                message: "Super Admin created successfully."
            });

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            await connection.query(
                "SELECT RELEASE_LOCK('smartteq_admin_setup')"
            );
            connection.release();
        }

    } catch (error) {
        console.error("Admin setup error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Admin setup failed."
        });
    }
});

// Super Admin login
router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            username.length > 100 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const [admins] = await db.execute(
            `SELECT id, username, password_hash, role, is_active
             FROM admin_users
             WHERE username = ?
             LIMIT 1`,
            [username]
        );

        if (admins.length === 0 || !admins[0].is_active) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const admin = admins[0];

        const passwordMatches = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = jwt.sign(
            {
                adminId: admin.id,
                username: admin.username,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            success: true,
            message: "Admin login successful.",
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Admin login failed."
        });
    }
});

// Verify admin session
router.get("/me", adminAuth, async (req, res) => {
    return res.json({
        success: true,
        admin: {
            id: req.admin.adminId,
            username: req.admin.username,
            role: req.admin.role
        }
    });
});




// =====================================
// SUPER ADMIN DASHBOARD API
// GET /api/admin/dashboard
// =====================================

router.get("/dashboard", adminAuth, async (req, res) => {
    try {
        // 1. Order statistics and delivered revenue
        const [orderStats] = await db.execute(`
            SELECT
                COUNT(*) AS totalOrders,

                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(status) = 'delivered'
                            THEN total
                            ELSE 0
                        END
                    ),
                    0
                ) AS revenue,

                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(status) = 'pending'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS pendingOrders,

                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(status) = 'delivered'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS deliveredOrders

            FROM orders
        `);

        // 2. Active product statistics
        const [productStats] = await db.execute(`
            SELECT
                COUNT(*) AS totalProducts,
                COALESCE(SUM(GREATEST(stock, 0)), 0) AS totalStock,
                COALESCE(SUM(stock <= 0), 0) AS outOfStock

            FROM products
            WHERE is_active = TRUE
        `);

        // 3. Unique customers based on phone number
        const [customerStats] = await db.execute(`
            SELECT
                COUNT(
                    DISTINCT REPLACE(
                        REPLACE(
                            REPLACE(phone, ' ', ''),
                            '-',
                            ''
                        ),
                        '+',
                        ''
                    )
                ) AS totalCustomers

            FROM orders
            WHERE phone IS NOT NULL
              AND TRIM(phone) <> ''
        `);

        // 4. Latest 5 orders
        const [recentOrders] = await db.execute(`
            SELECT
                order_id,
                customer_name,
                total,
                status,
                created_at

            FROM orders

            ORDER BY created_at DESC

            LIMIT 5
        `);

        const orders = orderStats[0];
        const products = productStats[0];
        const customers = customerStats[0];

        return res.json({
            success: true,

            stats: {
                revenue: Number(orders.revenue || 0),
                totalOrders: Number(orders.totalOrders || 0),
                pendingOrders: Number(orders.pendingOrders || 0),
                deliveredOrders: Number(orders.deliveredOrders || 0),
                totalProducts: Number(products.totalProducts || 0),
                totalStock: Number(products.totalStock || 0),
                outOfStock: Number(products.outOfStock || 0),
                totalCustomers: Number(customers.totalCustomers || 0)
            },

            recentOrders: recentOrders.map((order) => ({
                orderId: order.order_id,
                customerName: order.customer_name,
                total: Number(order.total),
                status: order.status,
                createdAt: order.created_at
            }))
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load dashboard data."
        });
    }
});


// =====================================
// SUPER ADMIN ORDERS MANAGEMENT APIs
// =====================================

// GET /api/admin/orders
// Fetch orders with search and status filters

router.get("/orders", adminAuth, async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim();

        const allowedStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered"
        ];

        if (search.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search text is too long."
            });
        }

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        let sql = `
            SELECT
                id,
                order_id,
                customer_name,
                phone,
                email,
                city,
                total,
                payment_method,
                status,
                created_at
            FROM orders
            WHERE 1 = 1
        `;

        const params = [];

        if (search) {
            sql += `
                AND (
                    order_id LIKE ?
                    OR customer_name LIKE ?
                    OR phone LIKE ?
                )
            `;

            const term = `%${search}%`;

            params.push(term, term, term);
        }

        if (status) {
            sql += " AND status = ?";
            params.push(status);
        }

        sql += " ORDER BY created_at DESC LIMIT 500";

        const [orders] = await db.execute(sql, params);

        return res.json({
            success: true,
            total: orders.length,
            orders: orders.map((order) => ({
                id: order.id,
                orderId: order.order_id,
                customerName: order.customer_name,
                phone: order.phone,
                email: order.email,
                city: order.city,
                total: Number(order.total),
                paymentMethod: order.payment_method,
                status: order.status,
                createdAt: order.created_at
            }))
        });

    } catch (error) {
        console.error("Admin orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load orders."
        });
    }
});


// GET /api/admin/orders/:orderId
// Fetch complete order details

router.get("/orders/:orderId", adminAuth, async (req, res) => {
    try {
        const orderId = String(req.params.orderId || "").trim();

        if (!/^STQ-[A-F0-9]{8}$/i.test(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const [orders] = await db.execute(
            `
                SELECT
                    id,
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
                    created_at
                FROM orders
                WHERE order_id = ?
                LIMIT 1
            `,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const order = orders[0];

        const [items] = await db.execute(
            `
                SELECT
                    product_id,
                    product_name,
                    price,
                    quantity
                FROM order_items
                WHERE order_id = ?
            `,
            [order.order_id]
        );

        return res.json({
            success: true,
            order: {
                id: order.id,
                orderId: order.order_id,
                customerName: order.customer_name,
                phone: order.phone,
                email: order.email,
                address: order.address,
                area: order.area,
                city: order.city,
                postalCode: order.postal_code,
                notes: order.notes,
                subtotal: Number(order.subtotal),
                shipping: Number(order.shipping || 0),
                total: Number(order.total),
                paymentMethod: order.payment_method,
                status: order.status,
                createdAt: order.created_at,
                items: items.map((item) => ({
                    productId: item.product_id,
                    productName: item.product_name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                    lineTotal:
                        Number(item.price) * Number(item.quantity)
                }))
            }
        });

    } catch (error) {
        console.error("Admin order details error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load order details."
        });
    }
});


// PATCH /api/admin/orders/:orderId/status
// Update order status

router.patch(
    "/orders/:orderId/status",
    adminAuth,
    async (req, res) => {
        try {
            const orderId = String(req.params.orderId || "").trim();
            const { status } = req.body;

            const allowedStatuses = [
                "Pending",
                "Processing",
                "Shipped",
                "Delivered"
            ];

            if (!/^STQ-[A-F0-9]{8}$/i.test(orderId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order ID."
                });
            }

            if (
                typeof status !== "string" ||
                !allowedStatuses.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order status."
                });
            }

            const [result] = await db.execute(
                `
                    UPDATE orders
                    SET status = ?
                    WHERE order_id = ?
                `,
                [status, orderId]
            );

            if (result.affectedRows === 0) {
                const [existing] = await db.execute(
                    "SELECT id FROM orders WHERE order_id = ? LIMIT 1",
                    [orderId]
                );

                if (existing.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Order not found."
                    });
                }
            }

            return res.json({
                success: true,
                message: "Order status updated successfully.",
                orderId,
                status
            });

        } catch (error) {
            console.error("Admin order status update error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update order status."
            });
        }
    }
);




// =====================================
// ADMIN CATEGORIES MANAGEMENT APIs
// =====================================

// GET /api/admin/categories
// Get all categories with product counts

router.get("/categories", adminAuth, async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT
                c.id,
                c.name,
                c.created_at,
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category = c.name
            GROUP BY c.id, c.name, c.created_at
            ORDER BY c.name ASC
        `);

        return res.json({
            success: true,
            total: categories.length,
            categories: categories.map(category => ({
                id: Number(category.id),
                name: category.name,
                productCount: Number(category.product_count),
                createdAt: category.created_at
            }))
        });

    } catch (error) {
        console.error("Admin categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load categories."
        });
    }
});


// POST /api/admin/categories
// Add new category

router.post("/categories", adminAuth, async (req, res) => {
    try {
        const name = typeof req.body.name === "string"
            ? req.body.name.trim()
            : "";

        if (!name || name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Category name is required (maximum 100 characters)."
            });
        }

        const [result] = await db.execute(
            "INSERT INTO categories (name) VALUES (?)",
            [name]
        );

        return res.status(201).json({
            success: true,
            message: "Category added successfully.",
            category: {
                id: Number(result.insertId),
                name,
                productCount: 0
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This category already exists."
            });
        }

        console.error("Add category error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to add category."
        });
    }
});


// PUT /api/admin/categories/:id
// Rename category and update associated products

router.put("/categories/:id", adminAuth, async (req, res) => {
    let connection;

    try {
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            id > 4294967295
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        const name = typeof req.body.name === "string"
            ? req.body.name.trim()
            : "";

        if (!name || name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Category name is required (maximum 100 characters)."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [existing] = await connection.execute(
            "SELECT id, name FROM categories WHERE id = ? FOR UPDATE",
            [id]
        );

        if (existing.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        const oldName = existing[0].name;

        if (oldName === name) {
            await connection.commit();

            return res.json({
                success: true,
                message: "Category name is unchanged."
            });
        }

        const [duplicates] = await connection.execute(
            "SELECT id FROM categories WHERE name = ? AND id != ?",
            [name, id]
        );

        if (duplicates.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This category name already exists."
            });
        }

        await connection.execute(
            "UPDATE categories SET name = ? WHERE id = ?",
            [name, id]
        );

        const [productUpdate] = await connection.execute(
            "UPDATE products SET category = ? WHERE category = ?",
            [name, oldName]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Category renamed successfully.",
            category: {
                id,
                name
            },
            updatedProducts: productUpdate.affectedRows
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This category name already exists."
            });
        }

        console.error("Rename category error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to rename category."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// DELETE /api/admin/categories/:id
// Prevent deletion when products use this category

router.delete("/categories/:id", adminAuth, async (req, res) => {
    let connection;

    try {
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            id > 4294967295
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [existing] = await connection.execute(
            "SELECT id, name FROM categories WHERE id = ? FOR UPDATE",
            [id]
        );

        if (existing.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        const [products] = await connection.execute(
            "SELECT COUNT(*) AS total FROM products WHERE category = ?",
            [existing[0].name]
        );

        const productCount = Number(products[0].total);

        if (productCount > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: `Cannot delete this category. ${productCount} product(s) are assigned to it.`
            });
        }

        await connection.execute(
            "DELETE FROM categories WHERE id = ?",
            [id]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Category deleted successfully."
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete category."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// =====================================
// ADMIN PRODUCTS MANAGEMENT APIs
// =====================================


const validateProduct = async (body) => {
    const {
        name, brand, category, description,
        image, price, oldPrice, stock, featured
    } = body;

    if (
        typeof name !== "string" || !name.trim() ||
        name.trim().length > 255
    ) {
        return "Product name is required (maximum 255 characters).";
    }

    if (
        typeof brand !== "string" ||
        !brand.trim() || brand.trim().length > 150
    ) {
        return "Valid product brand is required.";
    }

    // Validate category from MySQL database
    if (
        typeof category !== "string" ||
        !category.trim() ||
        category.trim().length > 100
    ) {
        return "Valid product category is required.";
    }

    const [categoryRows] = await db.execute(
        "SELECT id FROM categories WHERE name = ? LIMIT 1",
        [category.trim()]
    );

    if (categoryRows.length === 0) {
        return "Invalid product category.";
    }

    if (
        price === "" || price === null ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0 || Number(price) > 999999999999
    ) {
        return "Invalid product price.";
    }

    if (
        oldPrice !== null && oldPrice !== "" &&
        (!Number.isFinite(Number(oldPrice)) || Number(oldPrice) < 0)
    ) {
        return "Invalid old price.";
    }

    if (
        stock === "" || !Number.isInteger(Number(stock)) ||
        Number(stock) < 0 || Number(stock) > 4294967295
    ) {
        return "Stock must be a valid non-negative whole number.";
    }

    if (typeof featured !== "boolean") {
        return "Invalid featured product setting.";
    }

    if (
        description != null &&
        (typeof description !== "string" || description.length > 20000)
    ) {
        return "Invalid product description.";
    }

    if (
        image != null &&
        (typeof image !== "string" || image.length > 500)
    ) {
        return "Invalid product image.";
    }

    return null;
};



const formatAdminProduct = (p) => ({
    id: Number(p.id),
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description,
    image: p.image,
    price: Number(p.price),
    oldPrice: p.old_price === null ? null : Number(p.old_price),
    stock: Number(p.stock),
    featured: Boolean(p.featured),
    isActive: Boolean(p.is_active),
    createdAt: p.created_at
});

// GET ALL PRODUCTS (INCLUDING SEARCH)

router.get("/products", adminAuth, async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();

        if (search.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search text is too long."
            });
        }

        const [products] = await db.execute(
            `SELECT
                id, name, brand, category, description,
                image, price, old_price, stock, featured,
                is_active, created_at
             FROM products
         WHERE
    is_active = TRUE
    AND (
        name LIKE ?
        OR brand LIKE ?
        OR category LIKE ?
    )
             ORDER BY created_at DESC, id DESC
             LIMIT 500`,
            [`%${search}%`, `%${search}%`, `%${search}%`]
        );

        return res.json({
            success: true,
            total: products.length,
            products: products.map(formatAdminProduct)
        });

    } catch (error) {
        console.error("Admin products error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load products."
        });
    }
});


// ADD NEW PRODUCT

router.post("/products", adminAuth, async (req, res) => {
    try {
        const validationError = await validateProduct(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const {
            name, brand, category, description,
            image, price, oldPrice, stock, featured
        } = req.body;

        const [result] = await db.execute(
            `INSERT INTO products (
                name, brand, category, description,
                image, price, old_price, stock,
                featured, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
                name.trim(),
                brand.trim(),
                category,
                description?.trim() || null,
                image?.trim() || null,
                Number(price),
                oldPrice === "" || oldPrice == null
                    ? null
                    : Number(oldPrice),
                Number(stock),
                featured ? 1 : 0
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Product added successfully.",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Add product error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to add product."
        });
    }
});


// UPDATE EXISTING PRODUCT

router.put("/products/:id", adminAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1 || id > 4294967295) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const validationError = await validateProduct(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const {
            name, brand, category, description,
            image, price, oldPrice, stock, featured
        } = req.body;

        const [result] = await db.execute(
            `UPDATE products SET
                name = ?,
                brand = ?,
                category = ?,
                description = ?,
                image = ?,
                price = ?,
                old_price = ?,
                stock = ?,
                featured = ?
             WHERE id = ? AND is_active = TRUE`,
            [
                name.trim(),
                brand.trim(),
                category,
                description?.trim() || null,
                image?.trim() || null,
                Number(price),
                oldPrice === "" || oldPrice == null
                    ? null
                    : Number(oldPrice),
                Number(stock),
                featured ? 1 : 0,
                id
            ]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.execute(
                "SELECT id FROM products WHERE id = ? AND is_active = TRUE",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Active product not found."
                });
            }
        }

        return res.json({
            success: true,
            message: "Product updated successfully."
        });

    } catch (error) {
        console.error("Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update product."
        });
    }
});


// ARCHIVE PRODUCT (SAFE SOFT DELETE)

router.delete("/products/:id", adminAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1 || id > 4294967295) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const [result] = await db.execute(
            `UPDATE products
             SET is_active = FALSE, featured = FALSE
             WHERE id = ? AND is_active = TRUE`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Active product not found."
            });
        }

        return res.json({
            success: true,
            message: "Product archived successfully."
        });

    } catch (error) {
        console.error("Archive product error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to archive product."
        });
    }
});


// =====================================
// ADMIN CUSTOMERS MANAGEMENT API
// =====================================

// GET /api/admin/customers

router.get("/customers", adminAuth, async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();

        if (search.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search text is too long."
            });
        }

        const customerKey = `
            COALESCE(
                NULLIF(
                    REPLACE(
                        REPLACE(
                            REPLACE(TRIM(phone), ' ', ''),
                            '-', ''
                        ),
                        '+', ''
                    ),
                    ''
                ),
                NULLIF(LOWER(TRIM(email)), ''),
                CONCAT('order-', id)
            )
        `;

        const [customers] = await db.execute(
            `
            SELECT *
            FROM (
                SELECT
                    ${customerKey} AS customerKey,
                    MAX(customer_name) AS name,
                    MAX(phone) AS phone,
                    MAX(email) AS email,
                    MAX(city) AS city,
                    COUNT(*) AS totalOrders,
                    SUM(total) AS totalSpent,
                    MAX(created_at) AS lastOrder
                FROM orders
                GROUP BY customerKey
            ) AS customer_data
            WHERE
                name LIKE ?
                OR phone LIKE ?
                OR email LIKE ?
                OR city LIKE ?
            ORDER BY lastOrder DESC
            LIMIT 500
            `,
            [
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`
            ]
        );

        return res.json({
            success: true,
            total: customers.length,
            customers: customers.map(customer => ({
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                city: customer.city,
                totalOrders: Number(customer.totalOrders),
                totalSpent: Number(customer.totalSpent || 0),
                lastOrder: customer.lastOrder
            }))
        });

    } catch (error) {
        console.error("Admin customers error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load customers."
        });
    }
});

// =====================================
// ADMIN INVENTORY MANAGEMENT APIs
// =====================================

// GET /api/admin/inventory

router.get("/inventory", adminAuth, async (req, res) => {
    try {
        const [products] = await db.execute(`
            SELECT
                id,
                name,
                brand,
                category,
                stock,
                image
            FROM products
            WHERE is_active = TRUE
            ORDER BY stock ASC, name ASC
            LIMIT 500
        `);

        return res.json({
            success: true,
            total: products.length,
            inventory: products.map(product => ({
                id: Number(product.id),
                name: product.name,
                sku: null,
                brand: product.brand,
                category: product.category,
                stock: Number(product.stock),
                image: product.image
            }))
        });

    } catch (error) {
        console.error("Admin inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load inventory."
        });
    }
});


// PATCH /api/admin/inventory/:id

router.patch("/inventory/:id", adminAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { stock } = req.body;

        if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            id > 4294967295
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        if (
            stock === "" ||
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0 ||
            Number(stock) > 4294967295
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid stock quantity."
            });
        }

        const [result] = await db.execute(
            `
            UPDATE products
            SET stock = ?
            WHERE id = ? AND is_active = TRUE
            `,
            [Number(stock), id]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.execute(
                "SELECT id FROM products WHERE id = ? AND is_active = TRUE",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Active product not found."
                });
            }
        }

        return res.json({
            success: true,
            message: "Inventory updated successfully."
        });

    } catch (error) {
        console.error("Inventory update error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update inventory."
        });
    }
});

export default router;


