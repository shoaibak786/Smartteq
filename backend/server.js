import express from "express";
import cors from "cors";
import db from "./config/db.js";
import ordersRouter from "./routes/orders.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smartteq Order Backend is running!",
    });
});

app.get("/api/db-check", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS connected");

        res.json({
            success: true,
            message: "Smartteq database connected successfully!",
            result: rows[0],
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed!",
        });
    }
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/cart", cartRouter);

app.listen(PORT, () => {
    console.log(`Smartteq backend running on port ${PORT}`);
});
