
import db from "../config/db.js";

async function createCartTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_sessions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_cart_token_hash (token_hash),
        INDEX idx_cart_expiry (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        cart_id BIGINT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        quantity INT UNSIGNED NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_cart_product (cart_id, product_id),
        INDEX idx_cart_product (product_id),
        CONSTRAINT fk_cart_items_session
          FOREIGN KEY (cart_id)
          REFERENCES cart_sessions(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_cart_items_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("Cart database tables created successfully.");

    const [tables] = await db.query(`
      SHOW TABLES LIKE 'cart%'
    `);

    console.table(tables);
  } catch (error) {
    console.error("Cart table creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

createCartTables();
