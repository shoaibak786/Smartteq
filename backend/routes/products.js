
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Permanent Smartteq product categories
const PRODUCT_CATEGORIES = [
  "Laptop",
  "Gaming PC & Desktop",
  "Accessories",
  "Toner Ink & Chip",
  "Printer & Scanner",
];

const formatProduct = (product) => ({
  id: Number(product.id),
  name: product.name,
  brand: product.brand,
  category: product.category,
  description: product.description,
  image: product.image,
  price: Number(product.price),
  oldPrice:
    product.old_price === null
      ? null
      : Number(product.old_price),
  stock: Number(product.stock),
  featured: Boolean(product.featured),
});

const columns = `
  id, name, brand, category, description, image,
  price, old_price, stock, featured
`;

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "")
      .trim()
      .slice(0, 100);

    const category = String(req.query.category || "").trim();
    const sort = String(req.query.sort || "featured");

    const allowedSorts = {
      featured: "featured DESC, id DESC",
      "price-asc": "price ASC",
      "price-desc": "price DESC",
      name: "name ASC",
      discount:
        "(CASE WHEN old_price > price THEN ((old_price - price) / old_price) ELSE 0 END) DESC",
      newest: "created_at DESC",
    };

    const orderBy =
      allowedSorts[sort] || allowedSorts.featured;

    const conditions = ["is_active = TRUE"];
    const params = [];

    if (search) {
      conditions.push(
        "(name LIKE ? OR brand LIKE ? OR description LIKE ?)"
      );

      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category && category !== "all") {
      conditions.push("category = ?");
      params.push(category);
    }

    const where = conditions.join(" AND ");

    const [products] = await db.execute(
      `SELECT ${columns}
       FROM products
       WHERE ${where}
       ORDER BY ${orderBy}`,
      params
    );

    const [statsRows] = await db.execute(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(stock > 0), 0) AS inStock,
        COALESCE(SUM(stock <= 0), 0) AS outOfStock,
        COALESCE(SUM(GREATEST(stock, 0)), 0) AS totalUnits,
        MAX(
          CASE
            WHEN old_price > price AND old_price > 0
            THEN ROUND(
              ((old_price - price) / old_price) * 100
            )
            ELSE 0
          END
        ) AS maxOff
      FROM products
      WHERE is_active = TRUE
    `);

    const [categoryRows] = await db.execute(`
      SELECT
        category,
        COUNT(*) AS count,
        COALESCE(SUM(GREATEST(stock, 0)), 0) AS units,
        COALESCE(SUM(stock > 0), 0) AS inStock,
        COALESCE(SUM(stock <= 0), 0) AS outOfStock
      FROM products
      WHERE is_active = TRUE
      GROUP BY category
    `);

    // Include all five categories, even when they have zero products
    const categoryMap = new Map(
      categoryRows.map((row) => [row.category, row])
    );

    const categories = PRODUCT_CATEGORIES.map((name) => {
      const row = categoryMap.get(name);

      return {
        value: name,
        label: name,
        count: Number(row?.count || 0),
        units: Number(row?.units || 0),
        inStock: Number(row?.inStock || 0),
        outOfStock: Number(row?.outOfStock || 0),
      };
    });

    const stats = statsRows[0];

    res.json({
      success: true,
      products: products.map(formatProduct),

      stats: {
        total: Number(stats.total || 0),
        inStock: Number(stats.inStock || 0),
        outOfStock: Number(stats.outOfStock || 0),
        totalUnits: Number(stats.totalUnits || 0),
        maxOff: Number(stats.maxOff || 0),
      },

      categories,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load products.",
    });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const [rows] = await db.execute(
      `SELECT ${columns}
       FROM products
       WHERE id = ? AND is_active = TRUE
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      product: formatProduct(rows[0]),
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load product.",
    });
  }
});

export default router;
