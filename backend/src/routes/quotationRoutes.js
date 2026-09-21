const express = require("express");

const {
    createQuotation,
    getQuotationsForRFQ,
    acceptQuotation,
    getMyQuotations
} = require("../controllers/quotationController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// CREATE QUOTATION
// SUPPLIER ONLY
// ==========================================

router.post(
    "/",
    authenticate,
    authorize("SUPPLIER"),
    createQuotation
);


// ==========================================
// GET QUOTATIONS FOR AN RFQ
// BUYER ONLY
// ==========================================

router.get(
    "/rfq/:rfq_id",
    authenticate,
    authorize("BUYER"),
    getQuotationsForRFQ
);

// ==========================================
// GET MY QUOTATIONS
// SUPPLIER ONLY
// ==========================================

router.get(
    "/my",
    authenticate,
    authorize("SUPPLIER"),
    getMyQuotations
);
// ==========================================
// ACCEPT QUOTATION
// BUYER ONLY
// ==========================================

router.put(
    "/:quotation_id/accept",
    authenticate,
    authorize("BUYER"),
    acceptQuotation
);


module.exports = router;