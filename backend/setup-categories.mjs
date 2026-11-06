import db from "./config/db.js";

try {
    await db.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        INSERT IGNORE INTO categories (name)
        SELECT DISTINCT TRIM(category)
        FROM products
        WHERE category IS NOT NULL
        AND TRIM(category) != ''
    `);

    const [rows] = await db.query(
        "SELECT * FROM categories ORDER BY name"
    );

    console.log("CATEGORIES DATABASE READY");
    console.table(rows);
} catch (error) {
    console.error("ERROR:", error.message);
} finally {
    await db.end();
}
