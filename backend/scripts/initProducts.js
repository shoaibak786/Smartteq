import db from "../config/db.js";

const products = [
  {
    name: "DDR4 Ram 16GB",
    brand: "SK Hynix",
    category: "Memory",
    description: "SKHynix PC4 3200AA 16Gb, SA2-11",
    image: "/products/ddr4-ram-16gb.png",
    price: 16999,
    oldPrice: 17999,
    stock: 0,
    featured: true,
  },
  {
    name: "SSD M1",
    brand: "Samsung",
    category: "Storage",
    description: "Branded Pulled Samsung SSD PM851, mSata, 128GB, Health 100%",
    image: "/products/ssd-m1.png",
    price: 4999,
    oldPrice: 5999,
    stock: 1,
    featured: true,
  },
  {
    name: "Ram DDR4",
    brand: "Samsung",
    category: "Memory",
    description: "Branded Pulled Samsung Ram DDR-4, 16GB, 3200mhz",
    image: "/products/ram-ddr4.png",
    price: 17999,
    oldPrice: 19999,
    stock: 0,
    featured: true,
  },
  {
    name: "Ram PC3L",
    brand: "Adata",
    category: "Memory",
    description: "Adata PC3L 4GB 12800S",
    image: "/products/ram-pc3l.png",
    price: 1999,
    oldPrice: 2499,
    stock: 5,
    featured: true,
  },
  {
    name: "1TB SSD M.2 2280",
    brand: "Branded Pulled",
    category: "Storage",
    description: "Adata M.2 2280 Legend 710 1TB SSD Health 100%",
    image: "/products/ssd.jpg",
    price: 36999,
    oldPrice: 39999,
    stock: 2,
    featured: true,
  },
  {
    name: "3-in-1 Mini DP Thunderbolt to HDMI/VGA/DVI",
    brand: "Branded Refurbished",
    category: "Adapters",
    description: "SWEES 3-in-1 Mini DisplayPort Thunderbolt to HDMI/VGA/DVI Adapter Cable Converter Full HD 1080p",
    image: "/products/mini-dp.jpg",
    price: 2999,
    oldPrice: 4999,
    stock: 5,
    featured: true,
  },
  {
    name: "4K HDMI to DisplayPort Converter",
    brand: "Tripp Lite Refurbished",
    category: "Adapters",
    description: "TRIPP LITE 4K HDMI to DisplayPort Video Converter with USB Power, 4Kx2K @ 30Hz",
    image: "/products/hdmi-dp.jpg",
    price: 4999,
    oldPrice: 6999,
    stock: 0,
    featured: true,
  },
  {
    name: "Acer Aspire V5 Laptop Battery",
    brand: "ACER",
    category: "Batteries",
    description: "Acer Aspire V5-431, V5-471P, V5-471G, V5-571G, V5-571P AL12A72 4 Cell Laptop Battery",
    image: "/products/acer-battery.jpg",
    price: 4800,
    oldPrice: 5999.99,
    stock: 12,
    featured: true,
  },
];

async function initializeProducts() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(150) NOT NULL DEFAULT '',
        category VARCHAR(100) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        price DECIMAL(12, 2) NOT NULL,
        old_price DECIMAL(12, 2) DEFAULT NULL,
        stock INT UNSIGNED NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_products_category (category),
        INDEX idx_products_active (is_active),
        INDEX idx_products_featured (featured)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [rows] = await db.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    if (Number(rows[0].total) === 0) {
      for (const product of products) {
        await db.execute(
          `INSERT INTO products
            (name, brand, category, description, image, price,
             old_price, stock, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.brand,
            product.category,
            product.description,
            product.image,
            product.price,
            product.oldPrice,
            product.stock,
            product.featured,
          ]
        );
      }

      console.log("Successfully inserted 8 Smartteq products.");
    } else {
      console.log(
        `Products table already contains ${rows[0].total} products. No seed data inserted.`
      );
    }

    const [result] = await db.query(
      `SELECT id, name, category, price, stock
       FROM products
       ORDER BY id`
    );

    console.table(result);
  } catch (error) {
    console.error("Products initialization failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

initializeProducts();
