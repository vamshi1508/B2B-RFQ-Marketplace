const express = require("express");

const {
    createRFQ,
    getAllRFQs,
    getMyRFQs,
    getRFQById
} = require("../controllers/rfqController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// CREATE RFQ
// BUYER ONLY
// ==========================================

router.post(
    "/",
    authenticate,
    authorize("BUYER"),
    createRFQ
);


// ==========================================
// GET ALL RFQs
// SUPPLIER ONLY
// ==========================================

router.get(
    "/",
    authenticate,
    authorize("SUPPLIER"),
    getAllRFQs
);


// ==========================================
// GET MY RFQs
// BUYER ONLY
// ==========================================

router.get(
    "/my",
    authenticate,
    authorize("BUYER"),
    getMyRFQs
);


// ==========================================
// GET SINGLE RFQ
// BUYER / SUPPLIER
// ==========================================

router.get(
    "/:id",
    authenticate,
    getRFQById
);


module.exports = router;