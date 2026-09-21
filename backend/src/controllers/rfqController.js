const db = require("../config/db");


// ==========================================
// CREATE RFQ
// ==========================================

const createRFQ = async (req, res) => {
    try {
        const {
            product_name,
            description,
            quantity,
            delivery_location,
            deadline
        } = req.body;

        if (
            !product_name ||
            !description ||
            !quantity ||
            !delivery_location ||
            !deadline
        ) {
            return res.status(400).json({
                message: "All RFQ fields are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const [result] = await db.query(
            `INSERT INTO rfqs
            (buyer_id, product_name, description, quantity, delivery_location, deadline)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                product_name,
                description,
                quantity,
                delivery_location,
                deadline
            ]
        );

        res.status(201).json({
            message: "RFQ created successfully",
            rfq: {
                id: result.insertId,
                buyer_id: req.user.id,
                product_name,
                description,
                quantity,
                delivery_location,
                deadline,
                status: "OPEN"
            }
        });

    } catch (error) {
        console.error("Create RFQ error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET ALL RFQs
// SUPPLIER USE
// ==========================================

const getAllRFQs = async (req, res) => {
    try {
        const [rows] = await db.query(
    `SELECT
        id,
        buyer_id,
        product_name,
        description,
        quantity,
        delivery_location,
        deadline,
        status,
        created_at
     FROM rfqs
     WHERE status = 'OPEN'
       AND deadline > NOW()
     ORDER BY created_at DESC`
);

        res.json({
            message: "RFQs fetched successfully",
            rfqs: rows
        });

    } catch (error) {
        console.error("Get RFQs error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET MY RFQs
// BUYER USE
// ==========================================

const getMyRFQs = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                id,
                buyer_id,
                product_name,
                description,
                quantity,
                delivery_location,
                deadline,
                status,
                created_at
             FROM rfqs
             WHERE buyer_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            message: "Your RFQs fetched successfully",
            rfqs: rows
        });

    } catch (error) {
        console.error("Get my RFQs error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET SINGLE RFQ
// BUYER / SUPPLIER
// ==========================================

const getRFQById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rfqs] = await db.query(
            `SELECT
                id,
                buyer_id,
                product_name,
                description,
                quantity,
                delivery_location,
                deadline,
                status,
                created_at
             FROM rfqs
             WHERE id = ?`,
            [id]
        );

        // RFQ doesn't exist
        if (rfqs.length === 0) {
            return res.status(404).json({
                message: "RFQ not found"
            });
        }

        const rfq = rfqs[0];

        // BUYER can only view their own RFQ
        if (
            req.user.role === "BUYER" &&
            rfq.buyer_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this RFQ"
            });
        }

        // SUPPLIER can view the RFQ
        // because suppliers need to see RFQs before submitting quotations

        res.json({
            message: "RFQ fetched successfully",
            rfq
        });

    } catch (error) {
        console.error("Get RFQ by ID error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    createRFQ,
    getAllRFQs,
    getMyRFQs,
    getRFQById
};