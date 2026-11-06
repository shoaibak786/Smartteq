import db from "./config/db.js";

try {
    const [tables] = await db.query("SHOW TABLES");

    console.log("\n===== DATABASE TABLES =====");

    for (const row of tables) {
        const table = Object.values(row)[0];

        console.log(`\n===== ${table} =====`);

        const [columns] = await db.query(
            `DESCRIBE \`${table}\``
        );

        console.table(columns.map(c => ({
            Field: c.Field,
            Type: c.Type,
            Null: c.Null,
            Key: c.Key,
            Default: c.Default
        })));
    }
} catch (error) {
    console.error("Database inspection failed:", error.message);
} finally {
    await db.end();
}
