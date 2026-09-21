const db = require("../config/db");


// ==========================================
// CREATE QUOTATION
// SUPPLIER USE
// ==========================================

const createQuotation = async (req, res) => {
    try {
        const {
            rfq_id,
            quoted_price,
            estimated_delivery_time,
            message
        } = req.body;

        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (
            !rfq_id ||
            !quoted_price ||
            !estimated_delivery_time
        ) {
            return res.status(400).json({
                message:
                    "RFQ ID, quoted price and estimated delivery time are required"
            });
        }

        // ==========================================
        // VALIDATE QUOTED PRICE
        // ==========================================

        if (quoted_price <= 0) {
            return res.status(400).json({
                message: "Quoted price must be greater than 0"
            });
        }

        // ==========================================
        // CHECK WHETHER RFQ EXISTS
        // ==========================================

        const [rfqs] = await db.query(
            `SELECT
                id,
                deadline,
                status
             FROM rfqs
             WHERE id = ?`,
            [rfq_id]
        );

        if (rfqs.length === 0) {
            return res.status(404).json({
                message: "RFQ not found"
            });
        }

        const rfq = rfqs[0];

        // ==========================================
        // CHECK WHETHER RFQ IS ALREADY AWARDED
        // ==========================================

        if (rfq.status === "AWARDED") {
            return res.status(400).json({
                message:
                    "This RFQ is no longer open for quotations."
            });
        }

        // ==========================================
        // CHECK WHETHER RFQ DEADLINE HAS PASSED
        // ==========================================

        const currentTime = new Date();
        const deadline = new Date(rfq.deadline);

        if (currentTime > deadline) {
            return res.status(400).json({
                message:
                    "The RFQ deadline has passed. You can no longer submit a quotation."
            });
        }

        // ==========================================
        // CHECK WHETHER A QUOTATION
        // HAS ALREADY BEEN ACCEPTED
        // ==========================================

        const [acceptedQuotations] = await db.query(
            `SELECT id
             FROM quotations
             WHERE rfq_id = ?
             AND status = 'ACCEPTED'
             LIMIT 1`,
            [rfq_id]
        );

        if (acceptedQuotations.length > 0) {
            return res.status(400).json({
                message:
                    "A quotation for this RFQ has already been accepted. You can no longer submit a quotation."
            });
        }

        // ==========================================
        // CHECK WHETHER THIS SUPPLIER
        // ALREADY SUBMITTED A QUOTATION
        // ==========================================

        const [existingQuotations] = await db.query(
            `SELECT id
             FROM quotations
             WHERE rfq_id = ?
             AND supplier_id = ?`,
            [rfq_id, req.user.id]
        );

        if (existingQuotations.length > 0) {
            return res.status(400).json({
                message:
                    "You have already submitted a quotation for this RFQ"
            });
        }

        // ==========================================
        // INSERT QUOTATION
        // ==========================================

        const [result] = await db.query(
            `INSERT INTO quotations
            (
                rfq_id,
                supplier_id,
                quoted_price,
                estimated_delivery_time,
                message
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                rfq_id,
                req.user.id,
                quoted_price,
                estimated_delivery_time,
                message || null
            ]
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({
            message: "Quotation submitted successfully",

            quotation: {
                id: result.insertId,
                rfq_id,
                supplier_id: req.user.id,
                quoted_price,
                estimated_delivery_time,
                message: message || null,
                status: "PENDING"
            }
        });

    } catch (error) {
        console.error(
            "Create quotation error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET QUOTATIONS FOR BUYER'S RFQ
// BUYER USE
// ==========================================

const getQuotationsForRFQ = async (req, res) => {
    try {
        const { rfq_id } = req.params;

        // ==========================================
        // CHECK WHETHER RFQ BELONGS TO BUYER
        // AND GET COMPLETE RFQ DETAILS
        // ==========================================

        const [rfqs] = await db.query(
            `SELECT
                id,
                product_name,
                description,
                quantity,
                delivery_location,
                deadline,
                status,
                buyer_id
             FROM rfqs
             WHERE id = ?
             AND buyer_id = ?`,
            [rfq_id, req.user.id]
        );

        if (rfqs.length === 0) {
            return res.status(404).json({
                message:
                    "RFQ not found or you are not authorized to view it"
            });
        }

        // ==========================================
        // GET QUOTATIONS
        // ==========================================

        const [quotations] = await db.query(
            `SELECT
                q.id,
                q.rfq_id,
                q.supplier_id,
                q.quoted_price,
                q.estimated_delivery_time,
                q.message,
                q.status,
                q.created_at,
                u.name AS supplier_name,
                u.email AS supplier_email
             FROM quotations q
             JOIN users u
                ON q.supplier_id = u.id
             WHERE q.rfq_id = ?
             ORDER BY q.quoted_price ASC`,
            [rfq_id]
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({
            message: "Quotations fetched successfully",

            rfq: {
                id: rfqs[0].id,
                product_name: rfqs[0].product_name,
                description: rfqs[0].description,
                quantity: rfqs[0].quantity,
                delivery_location: rfqs[0].delivery_location,
                deadline: rfqs[0].deadline,
                status: rfqs[0].status
            },

            quotations
        });

    } catch (error) {
        console.error(
            "Get quotations error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// ACCEPT QUOTATION
// BUYER USE
// ==========================================

const acceptQuotation = async (req, res) => {
    try {
        const { quotation_id } = req.params;

        // ==========================================
        // FIND QUOTATION
        // VERIFY RFQ OWNERSHIP
        // ==========================================

        const [quotations] = await db.query(
            `SELECT
                q.id,
                q.rfq_id,
                q.status,
                r.buyer_id,
                r.status AS rfq_status
             FROM quotations q
             JOIN rfqs r
                ON q.rfq_id = r.id
             WHERE q.id = ?`,
            [quotation_id]
        );

        if (quotations.length === 0) {
            return res.status(404).json({
                message: "Quotation not found"
            });
        }

        const quotation = quotations[0];

        // ==========================================
        // CHECK RFQ OWNERSHIP
        // ==========================================

        if (Number(quotation.buyer_id) !== Number(req.user.id)) {
            return res.status(403).json({
                message:
                    "You are not authorized to accept this quotation"
            });
        }

        // ==========================================
        // CHECK WHETHER RFQ IS ALREADY AWARDED
        // ==========================================

        if (quotation.rfq_status === "AWARDED") {
            return res.status(400).json({
                message:
                    "This RFQ has already been awarded"
            });
        }

        // ==========================================
        // CHECK WHETHER QUOTATION IS ALREADY ACCEPTED
        // ==========================================

        if (quotation.status === "ACCEPTED") {
            return res.status(400).json({
                message:
                    "Quotation is already accepted"
            });
        }

        // ==========================================
        // CHECK WHETHER ANOTHER QUOTATION
        // HAS ALREADY BEEN ACCEPTED
        // ==========================================

        const [acceptedQuotations] = await db.query(
            `SELECT id
             FROM quotations
             WHERE rfq_id = ?
             AND status = 'ACCEPTED'`,
            [quotation.rfq_id]
        );

        if (acceptedQuotations.length > 0) {
            return res.status(400).json({
                message:
                    "Another quotation for this RFQ has already been accepted"
            });
        }

        // ==========================================
        // ACCEPT SELECTED QUOTATION
        // ==========================================

        await db.query(
            `UPDATE quotations
             SET status = 'ACCEPTED'
             WHERE id = ?`,
            [quotation_id]
        );

        // ==========================================
        // MARK RFQ AS AWARDED
        // ==========================================

        await db.query(
            `UPDATE rfqs
             SET status = 'AWARDED'
             WHERE id = ?`,
            [quotation.rfq_id]
        );

        // ==========================================
        // REJECT ALL OTHER PENDING QUOTATIONS
        // ==========================================

        await db.query(
            `UPDATE quotations
             SET status = 'REJECTED'
             WHERE rfq_id = ?
             AND id != ?
             AND status = 'PENDING'`,
            [quotation.rfq_id, quotation_id]
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({
            message:
                "Quotation accepted successfully",

            quotation_id: Number(quotation_id),

            status: "ACCEPTED",

            rfq_status: "AWARDED"
        });

    } catch (error) {
        console.error(
            "Accept quotation error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET MY QUOTATIONS
// SUPPLIER USE
// ==========================================

const getMyQuotations = async (req, res) => {
    try {
        const [quotations] = await db.query(
            `SELECT
                q.id,
                q.rfq_id,
                q.supplier_id,
                q.quoted_price,
                q.estimated_delivery_time,
                q.message,
                q.status,
                q.created_at,
                r.product_name,
                r.quantity,
                r.delivery_location,
                r.deadline,
                r.status AS rfq_status
             FROM quotations q
             JOIN rfqs r
                ON q.rfq_id = r.id
             WHERE q.supplier_id = ?
             ORDER BY q.created_at DESC`,
            [req.user.id]
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({
            message:
                "Your quotations fetched successfully",

            quotations
        });

    } catch (error) {
        console.error(
            "Get my quotations error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    createQuotation,
    getQuotationsForRFQ,
    acceptQuotation,
    getMyQuotations
};