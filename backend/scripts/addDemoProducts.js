
import db from "../config/db.js";

const products = [
  // LAPTOP (6)
  {
    name: "Core i5 Business Laptop",
    brand: "Smartteq Demo",
    category: "Laptop",
    description: "Demo Core i5 business laptop with 8GB RAM and SSD storage.",
    price: 85000,
    oldPrice: 95000,
    stock: 5,
  },
  {
    name: "Core i7 Professional Laptop",
    brand: "Smartteq Demo",
    category: "Laptop",
    description: "Demo Core i7 laptop for professional work.",
    price: 125000,
    oldPrice: 139999,
    stock: 3,
  },
  {
    name: "Core i3 Student Laptop",
    brand: "Smartteq Demo",
    category: "Laptop",
    description: "Demo budget laptop for students and everyday tasks.",
    price: 55000,
    oldPrice: 62000,
    stock: 7,
  },
  {
    name: "Business Laptop 16GB RAM",
    brand: "Smartteq Demo",
    category: "Laptop",
    description: "Demo business laptop with 16GB RAM.",
    price: 99000,
    oldPrice: 109000,
    stock: 4,
  },
  {
    name: "Slim Portable Laptop",
    brand: "Smartteq Demo",
    category: "Laptop",
    description: "Demo lightweight laptop for everyday use.",
    price: 78000,
    oldPrice: 85000,
    stock: 6,
  },
  {
    name: "Performance Laptop 512GB SSD",
    brand: "Smartteq Demo",
    category: "Laptop",
    description: "Demo performance laptop with 512GB SSD.",
    price: 115000,
    oldPrice: 129000,
    stock: 2,
  },

  // GAMING PC & DESKTOP (6)
  {
    name: "Gaming Desktop Core i5",
    brand: "Smartteq Demo",
    category: "Gaming PC & Desktop",
    description: "Demo gaming desktop configuration.",
    price: 145000,
    oldPrice: 159000,
    stock: 3,
  },
  {
    name: "Gaming Desktop Core i7",
    brand: "Smartteq Demo",
    category: "Gaming PC & Desktop",
    description: "Demo high-performance gaming desktop.",
    price: 195000,
    oldPrice: 215000,
    stock: 2,
  },
  {
    name: "Office Desktop Computer",
    brand: "Smartteq Demo",
    category: "Gaming PC & Desktop",
    description: "Demo desktop computer for office work.",
    price: 65000,
    oldPrice: 72000,
    stock: 5,
  },
  {
    name: "RGB Gaming PC",
    brand: "Smartteq Demo",
    category: "Gaming PC & Desktop",
    description: "Demo RGB gaming PC configuration.",
    price: 175000,
    oldPrice: 189000,
    stock: 2,
  },
  {
    name: "Compact Mini Desktop",
    brand: "Smartteq Demo",
    category: "Gaming PC & Desktop",
    description: "Demo compact desktop computer.",
    price: 58000,
    oldPrice: 65000,
    stock: 4,
  },
  {
    name: "Professional Workstation PC",
    brand: "Smartteq Demo",
    category: "Gaming PC & Desktop",
    description: "Demo workstation PC for professional workloads.",
    price: 225000,
    oldPrice: 245000,
    stock: 1,
  },

  // ACCESSORIES (6)
  {
    name: "Wireless Keyboard and Mouse",
    brand: "Smartteq Demo",
    category: "Accessories",
    description: "Demo wireless keyboard and mouse combo.",
    price: 3500,
    oldPrice: 4500,
    stock: 15,
  },
  {
    name: "USB Type C Hub",
    brand: "Smartteq Demo",
    category: "Accessories",
    description: "Demo multiport USB Type C hub.",
    price: 4500,
    oldPrice: 5500,
    stock: 12,
  },
  {
    name: "16GB DDR4 Desktop RAM",
    brand: "Smartteq Demo",
    category: "Accessories",
    description: "Demo 16GB DDR4 desktop memory.",
    price: 14500,
    oldPrice: 16000,
    stock: 8,
  },
  {
    name: "512GB SATA SSD",
    brand: "Smartteq Demo",
    category: "Accessories",
    description: "Demo 512GB SATA solid state drive.",
    price: 12500,
    oldPrice: 14000,
    stock: 10,
  },
  {
    name: "Wireless Optical Mouse",
    brand: "Smartteq Demo",
    category: "Accessories",
    description: "Demo wireless optical mouse.",
    price: 1800,
    oldPrice: 2300,
    stock: 20,
  },
  {
    name: "Laptop Cooling Pad",
    brand: "Smartteq Demo",
    category: "Accessories",
    description: "Demo laptop cooling pad.",
    price: 2800,
    oldPrice: 3500,
    stock: 9,
  },

  // TONER INK & CHIP (6)
  {
    name: "Black Laser Printer Toner",
    brand: "Smartteq Demo",
    category: "Toner Ink & Chip",
    description: "Demo black laser printer toner cartridge.",
    price: 4500,
    oldPrice: 5200,
    stock: 12,
  },
  {
    name: "Cyan Printer Ink",
    brand: "Smartteq Demo",
    category: "Toner Ink & Chip",
    description: "Demo cyan printer ink cartridge.",
    price: 1800,
    oldPrice: 2200,
    stock: 15,
  },
  {
    name: "Magenta Printer Ink",
    brand: "Smartteq Demo",
    category: "Toner Ink & Chip",
    description: "Demo magenta printer ink cartridge.",
    price: 1800,
    oldPrice: 2200,
    stock: 15,
  },
  {
    name: "Yellow Printer Ink",
    brand: "Smartteq Demo",
    category: "Toner Ink & Chip",
    description: "Demo yellow printer ink cartridge.",
    price: 1800,
    oldPrice: 2200,
    stock: 15,
  },
  {
    name: "Universal Toner Chip",
    brand: "Smartteq Demo",
    category: "Toner Ink & Chip",
    description: "Demo universal toner replacement chip.",
    price: 1200,
    oldPrice: 1500,
    stock: 20,
  },
  {
    name: "Black Printer Ink Bottle",
    brand: "Smartteq Demo",
    category: "Toner Ink & Chip",
    description: "Demo black printer ink refill bottle.",
    price: 1400,
    oldPrice: 1700,
    stock: 18,
  },

  // PRINTER & SCANNER (6)
  {
    name: "All-in-One Inkjet Printer",
    brand: "Smartteq Demo",
    category: "Printer & Scanner",
    description: "Demo all-in-one inkjet printer.",
    price: 28500,
    oldPrice: 32000,
    stock: 4,
  },
  {
    name: "Monochrome Laser Printer",
    brand: "Smartteq Demo",
    category: "Printer & Scanner",
    description: "Demo monochrome laser printer.",
    price: 42000,
    oldPrice: 46000,
    stock: 3,
  },
  {
    name: "Flatbed Document Scanner",
    brand: "Smartteq Demo",
    category: "Printer & Scanner",
    description: "Demo flatbed document scanner.",
    price: 32000,
    oldPrice: 36000,
    stock: 2,
  },
  {
    name: "Color Inkjet Printer",
    brand: "Smartteq Demo",
    category: "Printer & Scanner",
    description: "Demo color inkjet printer.",
    price: 22500,
    oldPrice: 26000,
    stock: 5,
  },
  {
    name: "Portable Document Scanner",
    brand: "Smartteq Demo",
    category: "Printer & Scanner",
    description: "Demo portable document scanner.",
    price: 18500,
    oldPrice: 21000,
    stock: 3,
  },
  {
    name: "Multifunction Office Printer",
    brand: "Smartteq Demo",
    category: "Printer & Scanner",
    description: "Demo multifunction office printer.",
    price: 55000,
    oldPrice: 62000,
    stock: 2,
  },
];

async function addDemoProducts() {
  let inserted = 0;
  let skipped = 0;

  try {
    for (const product of products) {
      const [existing] = await db.execute(
        `SELECT id FROM products
         WHERE name = ? AND brand = ? AND category = ?
         LIMIT 1`,
        [product.name, product.brand, product.category]
      );

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await db.execute(
        `INSERT INTO products
          (name, brand, category, description, image, price,
           old_price, stock, featured, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.brand,
          product.category,
          product.description,
          "/products/demo-placeholder.svg",
          product.price,
          product.oldPrice,
          product.stock,
          false,
          true,
        ]
      );

      inserted++;
    }

    console.log(`Demo products inserted: ${inserted}`);
    console.log(`Already existed (skipped): ${skipped}`);

    const [summary] = await db.query(
      `SELECT category, COUNT(*) AS total
       FROM products
       WHERE is_active = TRUE
       GROUP BY category
       ORDER BY category`
    );

    console.table(summary);
  } catch (error) {
    console.error("Demo product insertion failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

addDemoProducts();
