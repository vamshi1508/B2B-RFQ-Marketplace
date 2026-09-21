require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const rfqRoutes = require("./routes/rfqRoutes");
const quotationRoutes = require("./routes/quotationRoutes");

const authenticate = require("./middleware/authMiddleware");
const authorize = require("./middleware/roleMiddleware");

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "B2B RFQ Marketplace API is running"
    });
});


// ===============================
// DATABASE TEST ROUTE
// ===============================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            message: "Database connected successfully",
            data: rows
        });

    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});


// ===============================
// AUTHENTICATION ROUTES
// ===============================

app.use("/api/auth", authRoutes);


// ===============================
// RFQ ROUTES
// ===============================

app.use("/api/rfqs", rfqRoutes);
// Quotation routes
app.use("/api/quotations", quotationRoutes);

// ===============================
// PROTECTED TEST ROUTE
// ===============================

app.get("/api/protected", authenticate, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});


// ===============================
// BUYER-ONLY TEST ROUTE
// ===============================

app.get(
    "/api/buyer-only",
    authenticate,
    authorize("BUYER"),
    (req, res) => {
        res.json({
            message: "Buyer access granted",
            user: req.user
        });
    }
);


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});