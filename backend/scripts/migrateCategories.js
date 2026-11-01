import db from "../config/db.js";

async function migrateCategories() {
  try {
    const [result] = await db.execute(`
      UPDATE products
      SET category = 'Accessories'
      WHERE category IN (
        'Memory',
        'Storage',
        'Adapters',
        'Batteries'
      )
    `);

    console.log(
      `Successfully updated ${result.affectedRows} existing products to Accessories.`
    );

    const [rows] = await db.query(`
      SELECT category, COUNT(*) AS total
      FROM products
      GROUP BY category
      ORDER BY category
    `);

    console.table(rows);
  } catch (error) {
    console.error("Category migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

migrateCategories();
