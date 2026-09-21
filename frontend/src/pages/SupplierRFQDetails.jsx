import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function SupplierRFQDetails() {
    const { rfq_id } = useParams();
    const navigate = useNavigate();

    const [rfq, setRfq] = useState(null);
    const [existingQuotation, setExistingQuotation] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [quotedPrice, setQuotedPrice] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [message, setMessage] = useState("");

    // ==========================================
    // FETCH RFQ + CHECK EXISTING QUOTATION
    // ==========================================

    useEffect(() => {
        fetchRFQ();
    }, [rfq_id]);

    const fetchRFQ = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // --------------------------------------
            // GET RFQ
            // --------------------------------------

            const rfqResponse = await API.get(
                `/rfqs/${rfq_id}`
            );

            const fetchedRFQ =
                rfqResponse.data.rfq;

            setRfq(fetchedRFQ);

            // --------------------------------------
            // GET SUPPLIER'S QUOTATIONS
            // --------------------------------------

            try {
                const quotationResponse =
                    await API.get("/quotations/my");

                const quotations =
                    Array.isArray(
                        quotationResponse.data.quotations
                    )
                        ? quotationResponse.data.quotations
                        : [];

                const quotation =
                    quotations.find(
                        (item) =>
                            Number(item.rfq_id) ===
                            Number(rfq_id)
                    );

                setExistingQuotation(
                    quotation || null
                );

            } catch (quotationError) {
                console.error(
                    "Get existing quotation error:",
                    quotationError
                );

                // Do not block RFQ page if quotation
                // lookup fails.
                setExistingQuotation(null);
            }

        } catch (err) {
            console.error(
                "Get RFQ error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load RFQ"
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // SUBMIT QUOTATION
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // --------------------------------------
        // BASIC VALIDATION
        // --------------------------------------

        if (!quotedPrice.trim()) {
            setError(
                "Please enter your quoted price."
            );
            return;
        }

        if (!deliveryTime.trim()) {
            setError(
                "Please enter the estimated delivery time."
            );
            return;
        }

        const price = Number(quotedPrice);

        if (!Number.isFinite(price)) {
            setError(
                "Please enter a valid quoted price."
            );
            return;
        }

        if (price <= 0) {
            setError(
                "Quoted price must be greater than 0."
            );
            return;
        }

        // --------------------------------------
        // CHECK EXISTING QUOTATION
        // --------------------------------------

        if (existingQuotation) {
            setError(
                "You have already submitted a quotation for this RFQ."
            );
            return;
        }

        // --------------------------------------
        // CHECK RFQ STATUS
        // --------------------------------------

        if (!rfq) {
            setError(
                "RFQ information is unavailable."
            );
            return;
        }

        if (rfq.status === "AWARDED") {
            setError(
                "This RFQ has already been awarded."
            );
            return;
        }

        if (rfq.status !== "OPEN") {
            setError(
                "This RFQ is no longer accepting quotations."
            );
            return;
        }

        // --------------------------------------
        // CHECK DEADLINE
        // --------------------------------------

        const deadline = new Date(
            rfq.deadline
        );

        if (
            Number.isNaN(deadline.getTime())
        ) {
            setError(
                "The RFQ deadline is invalid."
            );
            return;
        }

        if (deadline <= new Date()) {
            setError(
                "The RFQ deadline has passed. You can no longer submit a quotation."
            );
            return;
        }

        // --------------------------------------
        // SUBMIT
        // --------------------------------------

        try {
            setSubmitting(true);

            const response = await API.post(
                "/quotations",
                {
                    rfq_id: Number(rfq_id),
                    quoted_price: price,
                    estimated_delivery_time:
                        deliveryTime.trim(),
                    message:
                        message.trim() || null
                }
            );

            setSuccess(
                response.data.message ||
                "Quotation submitted successfully!"
            );

            // --------------------------------------
            // CLEAR FORM
            // --------------------------------------

            setQuotedPrice("");
            setDeliveryTime("");
            setMessage("");

            // --------------------------------------
            // SET EXISTING QUOTATION FROM RESPONSE
            // --------------------------------------

            if (response.data.quotation) {
                setExistingQuotation(
                    response.data.quotation
                );
            }

            // --------------------------------------
            // REDIRECT AFTER SUCCESS
            // --------------------------------------

            setTimeout(() => {
                navigate("/supplier");
            }, 1500);

        } catch (err) {
            console.error(
                "Submit quotation error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to submit quotation"
            );

        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // LOADING PAGE
    // ==========================================

    if (loading) {
        return (
            <div style={styles.loadingPage}>

                <div style={styles.loadingCard}>

                    <div style={styles.spinner}></div>

                    <h2 style={styles.loadingTitle}>
                        Loading RFQ...
                    </h2>

                    <p style={styles.loadingText}>
                        Please wait while we fetch the
                        RFQ details.
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // ERROR PAGE
    // ==========================================

    if (error && !rfq) {
        return (
            <div style={styles.page}>

                <header style={styles.header}>

                    <div style={styles.brand}>

                        <div
                            style={styles.logo}
                            onClick={() =>
                                navigate("/supplier")
                            }
                        >
                            RFQ
                        </div>

                        <div>
                            <div style={styles.brandName}>
                                B2B RFQ Marketplace
                            </div>

                            <div style={styles.brandSubtitle}>
                                Procurement made simple
                            </div>
                        </div>

                    </div>

                </header>

                <main style={styles.container}>

                    <div style={styles.errorPageCard}>

                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <h2 style={styles.errorTitle}>
                            Unable to load RFQ
                        </h2>

                        <p style={styles.errorPageText}>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                navigate("/supplier")
                            }
                            style={styles.primaryButton}
                        >
                            ← Back to Dashboard
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    // ==========================================
    // RFQ NOT FOUND
    // ==========================================

    if (!rfq) {
        return (
            <div style={styles.loadingPage}>

                <div style={styles.errorPageCard}>

                    <div style={styles.errorIcon}>
                        !
                    </div>

                    <h2 style={styles.errorTitle}>
                        RFQ Not Found
                    </h2>

                    <p style={styles.errorPageText}>
                        The requested RFQ could not be found.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/supplier")
                        }
                        style={styles.primaryButton}
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================
    // DATE / STATUS
    // ==========================================

    const deadline = new Date(
        rfq.deadline
    );

    const validDeadline =
        !Number.isNaN(
            deadline.getTime()
        );

    const isExpired =
        !validDeadline ||
        deadline <= new Date();

    const isAwarded =
        rfq.status === "AWARDED";

    const isOpen =
        rfq.status === "OPEN" &&
        !isExpired &&
        !isAwarded;

    // ==========================================
    // DISPLAY STATUS
    // ==========================================

    let displayStatus = rfq.status;

    if (isExpired && !isAwarded) {
        displayStatus = "EXPIRED";
    }

    if (isAwarded) {
        displayStatus = "AWARDED";
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div style={styles.page}>

            {/* ======================================
                HEADER
            ====================================== */}

            <header style={styles.header}>

                <div style={styles.brand}>

                    <div
                        style={styles.logo}
                        onClick={() =>
                            navigate("/supplier")
                        }
                    >
                        RFQ
                    </div>

                    <div>

                        <div style={styles.brandName}>
                            B2B RFQ Marketplace
                        </div>

                        <div style={styles.brandSubtitle}>
                            Procurement made simple
                        </div>

                    </div>

                </div>

                <button
                    onClick={() =>
                        navigate("/supplier")
                    }
                    style={styles.headerButton}
                >
                    ← Back to Dashboard
                </button>

            </header>


            {/* ======================================
                MAIN
            ====================================== */}

            <main style={styles.container}>

                {/* BREADCRUMB */}

                <div style={styles.breadcrumb}>
                    Supplier Dashboard / RFQ / Details
                </div>


                {/* TITLE */}

                <div style={styles.titleSection}>

                    <div>

                        <h1 style={styles.pageTitle}>
                            RFQ Details
                        </h1>

                        <p style={styles.pageSubtitle}>
                            Review the buyer's requirements
                            and submit your quotation.
                        </p>

                    </div>

                </div>


                {/* ======================================
                    RFQ INFORMATION CARD
                ====================================== */}

                <div style={styles.rfqCard}>

                    {/* CARD HEADER */}

                    <div style={styles.cardHeader}>

                        <div>

                            <span style={styles.rfqLabel}>
                                REQUEST FOR QUOTATION
                            </span>

                            <h2 style={styles.productName}>
                                {rfq.product_name}
                            </h2>

                            {rfq.created_at && (
                                <p style={styles.created}>
                                    Created on{" "}
                                    {new Date(
                                        rfq.created_at
                                    ).toLocaleString()}
                                </p>
                            )}

                        </div>

                        <span
                            style={{
                                ...styles.status,
                                ...getStatusStyle(
                                    displayStatus
                                )
                            }}
                        >
                            {displayStatus}
                        </span>

                    </div>


                    {/* DESCRIPTION */}

                    <div style={styles.descriptionSection}>

                        <h3 style={styles.subHeading}>
                            Requirements
                        </h3>

                        <p style={styles.description}>
                            {rfq.description ||
                                "No description provided."}
                        </p>

                    </div>


                    {/* DETAILS */}

                    <div style={styles.detailsGrid}>

                        <div style={styles.detailCard}>

                            <span style={styles.detailLabel}>
                                QUANTITY
                            </span>

                            <strong style={styles.detailValue}>
                                {rfq.quantity}
                            </strong>

                        </div>


                        <div style={styles.detailCard}>

                            <span style={styles.detailLabel}>
                                DELIVERY LOCATION
                            </span>

                            <strong style={styles.detailValue}>
                                {rfq.delivery_location}
                            </strong>

                        </div>


                        <div style={styles.detailCard}>

                            <span style={styles.detailLabel}>
                                DEADLINE
                            </span>

                            <strong
                                style={{
                                    ...styles.detailValue,
                                    color:
                                        isExpired
                                            ? "#dc2626"
                                            : "#111827"
                                }}
                            >
                                {validDeadline
                                    ? deadline.toLocaleString()
                                    : "Invalid deadline"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ======================================
                    SUCCESS MESSAGE
                ====================================== */}

                {success && (

                    <div style={styles.successBox}>

                        <div style={styles.successIcon}>
                            ✓
                        </div>

                        <div>

                            <strong style={styles.successTitle}>
                                Quotation Submitted
                            </strong>

                            <p style={styles.successText}>
                                {success}
                            </p>

                        </div>

                    </div>

                )}


                {/* ======================================
                    ERROR MESSAGE
                ====================================== */}

                {error && rfq && (

                    <div style={styles.errorBox}>

                        <div style={styles.errorSmallIcon}>
                            !
                        </div>

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* ======================================
                    EXISTING QUOTATION
                ====================================== */}

                {existingQuotation && (

                    <div style={styles.existingQuotationCard}>

                        <div style={styles.existingTop}>

                            <div>

                                <span
                                    style={
                                        styles.existingLabel
                                    }
                                >
                                    YOUR QUOTATION
                                </span>

                                <h2
                                    style={
                                        styles.existingTitle
                                    }
                                >
                                    Quotation Already Submitted
                                </h2>

                            </div>

                            <span
                                style={{
                                    ...styles.status,
                                    ...getStatusStyle(
                                        existingQuotation.status
                                    )
                                }}
                            >
                                {existingQuotation.status}
                            </span>

                        </div>


                        <div
                            style={
                                styles.existingDetails
                            }
                        >

                            <div
                                style={
                                    styles.existingDetail
                                }
                            >

                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    QUOTED PRICE
                                </span>

                                <strong
                                    style={
                                        styles.existingPrice
                                    }
                                >
                                    ₹
                                    {Number(
                                        existingQuotation.quoted_price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>


                            <div
                                style={
                                    styles.existingDetail
                                }
                            >

                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    DELIVERY TIME
                                </span>

                                <strong
                                    style={
                                        styles.existingValue
                                    }
                                >
                                    {
                                        existingQuotation.estimated_delivery_time
                                    }
                                </strong>

                            </div>


                            <div
                                style={
                                    styles.existingDetail
                                }
                            >

                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    SUBMITTED
                                </span>

                                <strong
                                    style={
                                        styles.existingValue
                                    }
                                >
                                    {existingQuotation.created_at
                                        ? new Date(
                                              existingQuotation.created_at
                                          ).toLocaleString()
                                        : "Recently"}
                                </strong>

                            </div>

                        </div>


                        {existingQuotation.message && (

                            <div
                                style={
                                    styles.existingMessage
                                }
                            >

                                <span>
                                    Supplier Message
                                </span>

                                <p>
                                    "
                                    {
                                        existingQuotation.message
                                    }
                                    "
                                </p>

                            </div>

                        )}


                        <div
                            style={
                                styles.existingNotice
                            }
                        >

                            <span
                                style={
                                    styles.noticeIcon
                                }
                            >
                                ✓
                            </span>

                            <span>
                                You have already submitted a
                                quotation for this RFQ. You
                                cannot submit another quotation.
                            </span>

                        </div>


                        <button
                            onClick={() =>
                                navigate("/supplier")
                            }
                            style={
                                styles.secondaryButton
                            }
                        >
                            ← Back to Supplier Dashboard
                        </button>

                    </div>

                )}


                {/* ======================================
                    EXPIRED
                ====================================== */}

                {!existingQuotation &&
                    isExpired && (

                    <div style={styles.warningCard}>

                        <div style={styles.warningIcon}>
                            ⏰
                        </div>

                        <div>

                            <h2 style={styles.warningTitle}>
                                RFQ Deadline Passed
                            </h2>

                            <p style={styles.warningText}>
                                This RFQ is no longer accepting
                                quotations because the submission
                                deadline has passed.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/supplier")
                                }
                                style={
                                    styles.secondaryButton
                                }
                            >
                                ← Back to Dashboard
                            </button>

                        </div>

                    </div>

                )}


                {/* ======================================
                    AWARDED
                ====================================== */}

                {!existingQuotation &&
                    !isExpired &&
                    isAwarded && (

                    <div style={styles.awardedCard}>

                        <div style={styles.awardedIcon}>
                            🏆
                        </div>

                        <div>

                            <h2 style={styles.awardedTitle}>
                                RFQ Already Awarded
                            </h2>

                            <p style={styles.awardedText}>
                                This RFQ has already been awarded
                                to a supplier and is no longer
                                accepting quotations.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/supplier")
                                }
                                style={
                                    styles.secondaryButton
                                }
                            >
                                ← Back to Dashboard
                            </button>

                        </div>

                    </div>

                )}


                {/* ======================================
                    CLOSED / OTHER STATUS
                ====================================== */}

                {!existingQuotation &&
                    !isExpired &&
                    !isAwarded &&
                    rfq.status !== "OPEN" && (

                    <div style={styles.warningCard}>

                        <div style={styles.warningIcon}>
                            ⚠
                        </div>

                        <div>

                            <h2 style={styles.warningTitle}>
                                RFQ Not Available
                            </h2>

                            <p style={styles.warningText}>
                                This RFQ is currently marked as{" "}
                                <strong>
                                    {rfq.status}
                                </strong>{" "}
                                and cannot receive quotations.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/supplier")
                                }
                                style={
                                    styles.secondaryButton
                                }
                            >
                                ← Back to Dashboard
                            </button>

                        </div>

                    </div>

                )}


                {/* ======================================
                    SUBMIT QUOTATION FORM
                ====================================== */}

                {!existingQuotation &&
                    isOpen && (

                    <div style={styles.formCard}>

                        <div style={styles.formHeader}>

                            <div>

                                <span style={styles.formLabel}>
                                    SUPPLIER RESPONSE
                                </span>

                                <h2 style={styles.formTitle}>
                                    Submit Your Quotation
                                </h2>

                                <p style={styles.formSubtitle}>
                                    Provide your best commercial
                                    offer and delivery commitment.
                                </p>

                            </div>

                        </div>


                        <form onSubmit={handleSubmit}>

                            {/* PRICE */}

                            <div style={styles.formGroup}>

                                <label
                                    htmlFor="quotedPrice"
                                    style={styles.label}
                                >
                                    Quoted Price{" "}
                                    <span style={styles.required}>
                                        *
                                    </span>
                                </label>

                                <div
                                    style={
                                        styles.priceInputWrapper
                                    }
                                >

                                    <span
                                        style={
                                            styles.currency
                                        }
                                    >
                                        ₹
                                    </span>

                                    <input
                                        id="quotedPrice"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={quotedPrice}
                                        onChange={(e) =>
                                            setQuotedPrice(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your price"
                                        style={
                                            styles.priceInput
                                        }
                                        disabled={submitting}
                                    />

                                </div>

                                <span
                                    style={
                                        styles.helperText
                                    }
                                >
                                    Enter the total price for
                                    fulfilling this RFQ.
                                </span>

                            </div>


                            {/* DELIVERY TIME */}

                            <div style={styles.formGroup}>

                                <label
                                    htmlFor="deliveryTime"
                                    style={styles.label}
                                >
                                    Estimated Delivery Time{" "}
                                    <span style={styles.required}>
                                        *
                                    </span>
                                </label>

                                <input
                                    id="deliveryTime"
                                    type="text"
                                    value={deliveryTime}
                                    onChange={(e) =>
                                        setDeliveryTime(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: 7 days"
                                    style={styles.input}
                                    disabled={submitting}
                                />

                                <span
                                    style={
                                        styles.helperText
                                    }
                                >
                                    Specify how long it will
                                    take to deliver the order.
                                </span>

                            </div>


                            {/* MESSAGE */}

                            <div style={styles.formGroup}>

                                <label
                                    htmlFor="message"
                                    style={styles.label}
                                >
                                    Message{" "}
                                    <span
                                        style={
                                            styles.optional
                                        }
                                    >
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) =>
                                        setMessage(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Add payment terms, product specifications, warranty information, or any other details for the buyer..."
                                    rows={5}
                                    maxLength={1000}
                                    style={
                                        styles.textarea
                                    }
                                    disabled={submitting}
                                />

                                <div
                                    style={
                                        styles.characterCount
                                    }
                                >
                                    {message.length}/1000
                                </div>

                            </div>


                            {/* FORM ACTIONS */}

                            <div style={styles.formActions}>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/supplier")
                                    }
                                    disabled={submitting}
                                    style={
                                        styles.cancelButton
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        ...styles.submitButton,
                                        ...(submitting
                                            ? styles.disabledButton
                                            : {})
                                    }}
                                >

                                    {submitting ? (
                                        <>
                                            <span
                                                style={
                                                    styles.buttonSpinner
                                                }
                                            ></span>

                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            ✓ Submit Quotation
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                )}

            </main>

        </div>
    );
}


// =====================================================
// STATUS STYLE
// =====================================================

function getStatusStyle(status) {

    if (status === "ACCEPTED") {
        return {
            backgroundColor: "#dcfce7",
            color: "#166534"
        };
    }

    if (status === "REJECTED") {
        return {
            backgroundColor: "#fee2e2",
            color: "#991b1b"
        };
    }

    if (status === "EXPIRED") {
        return {
            backgroundColor: "#fee2e2",
            color: "#991b1b"
        };
    }

    if (status === "AWARDED") {
        return {
            backgroundColor: "#dcfce7",
            color: "#166534"
        };
    }

    if (status === "OPEN") {
        return {
            backgroundColor: "#dbeafe",
            color: "#1d4ed8"
        };
    }

    return {
        backgroundColor: "#fef3c7",
        color: "#92400e"
    };
}


// =====================================================
// STYLES
// =====================================================

const styles = {

    // ==========================================
    // PAGE
    // ==========================================

    page: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        color: "#0f172a"
    },

    // ==========================================
    // HEADER
    // ==========================================

    header: {
        height: "68px",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },

    brand: {
        display: "flex",
        alignItems: "center",
        gap: "11px"
    },

    logo: {
        width: "40px",
        height: "40px",
        borderRadius: "9px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "800",
        cursor: "pointer"
    },

    brandName: {
        fontSize: "15px",
        fontWeight: "750",
        color: "#111827"
    },

    brandSubtitle: {
        fontSize: "10px",
        color: "#64748b",
        marginTop: "2px"
    },

    headerButton: {
        backgroundColor: "#ffffff",
        border: "1px solid #dbe1ea",
        color: "#475569",
        padding: "9px 14px",
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: "650",
        cursor: "pointer"
    },

    // ==========================================
    // MAIN
    // ==========================================

    container: {
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "32px 24px 60px"
    },

    breadcrumb: {
        fontSize: "11px",
        fontWeight: "600",
        color: "#64748b",
        marginBottom: "9px"
    },

    titleSection: {
        marginBottom: "24px"
    },

    pageTitle: {
        margin: 0,
        fontSize: "30px",
        fontWeight: "800",
        letterSpacing: "-0.5px",
        color: "#0f172a"
    },

    pageSubtitle: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: "1.5"
    },

    // ==========================================
    // RFQ CARD
    // ==========================================

    rfqCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "23px",
        marginBottom: "20px",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.03)"
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px"
    },

    rfqLabel: {
        fontSize: "9px",
        fontWeight: "800",
        color: "#64748b",
        letterSpacing: "0.8px"
    },

    productName: {
        margin: "5px 0 0",
        fontSize: "23px",
        fontWeight: "800",
        color: "#111827"
    },

    created: {
        margin: "5px 0 0",
        color: "#94a3b8",
        fontSize: "10px"
    },

    status: {
        padding: "6px 11px",
        borderRadius: "20px",
        fontSize: "9px",
        fontWeight: "800",
        whiteSpace: "nowrap"
    },

    descriptionSection: {
        marginTop: "19px",
        paddingTop: "18px",
        borderTop: "1px solid #eef2f7"
    },

    subHeading: {
        margin: 0,
        fontSize: "12px",
        fontWeight: "800",
        color: "#334155",
        textTransform: "uppercase",
        letterSpacing: "0.4px"
    },

    description: {
        margin: "8px 0 0",
        color: "#475569",
        fontSize: "13px",
        lineHeight: "1.6"
    },

    detailsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "14px",
        marginTop: "20px"
    },

    detailCard: {
        padding: "14px",
        backgroundColor: "#f8fafc",
        border: "1px solid #eef2f7",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },

    detailLabel: {
        color: "#94a3b8",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.5px"
    },

    detailValue: {
        color: "#334155",
        fontSize: "13px",
        fontWeight: "700",
        lineHeight: "1.4"
    },

    // ==========================================
    // SUCCESS
    // ==========================================

    successBox: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "13px 15px",
        marginBottom: "15px",
        borderRadius: "8px",
        border: "1px solid #bbf7d0",
        backgroundColor: "#f0fdf4",
        color: "#166534"
    },

    successIcon: {
        width: "28px",
        height: "28px",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "#16a34a",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800"
    },

    successTitle: {
        fontSize: "12px"
    },

    successText: {
        margin: "3px 0 0",
        fontSize: "11px"
    },

    // ==========================================
    // ERROR
    // ==========================================

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "12px 14px",
        marginBottom: "15px",
        borderRadius: "8px",
        border: "1px solid #fecaca",
        backgroundColor: "#fef2f2",
        color: "#991b1b",
        fontSize: "12px"
    },

    errorSmallIcon: {
        width: "21px",
        height: "21px",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "#dc2626",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800"
    },

    // ==========================================
    // EXISTING QUOTATION
    // ==========================================

    existingQuotationCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #86efac",
        borderRadius: "12px",
        padding: "23px",
        marginBottom: "20px",
        boxShadow:
            "0 3px 10px rgba(22,163,74,0.06)"
    },

    existingTop: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "20px"
    },

    existingLabel: {
        fontSize: "9px",
        fontWeight: "800",
        color: "#16a34a",
        letterSpacing: "0.8px"
    },

    existingTitle: {
        margin: "5px 0 0",
        fontSize: "19px",
        fontWeight: "800",
        color: "#166534"
    },

    existingDetails: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px",
        marginTop: "20px",
        paddingTop: "18px",
        borderTop: "1px solid #dcfce7"
    },

    existingDetail: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },

    existingPrice: {
        fontSize: "20px",
        fontWeight: "800",
        color: "#111827"
    },

    existingValue: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155"
    },

    existingMessage: {
        marginTop: "18px",
        padding: "13px 15px",
        backgroundColor: "#f0fdf4",
        borderRadius: "8px",
        border: "1px solid #dcfce7"
    },

    existingMessage: {
        marginTop: "18px",
        padding: "13px 15px",
        backgroundColor: "#f0fdf4",
        borderRadius: "8px",
        border: "1px solid #dcfce7"
    },

    existingNotice: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        marginTop: "16px",
        padding: "12px",
        backgroundColor: "#f8fafc",
        borderRadius: "7px",
        color: "#475569",
        fontSize: "11px"
    },

    noticeIcon: {
        width: "22px",
        height: "22px",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "#16a34a",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800"
    },

    // ==========================================
    // FORM
    // ==========================================

    formCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "20px",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.03)"
    },

    formHeader: {
        paddingBottom: "19px",
        marginBottom: "22px",
        borderBottom: "1px solid #eef2f7"
    },

    formLabel: {
        fontSize: "9px",
        fontWeight: "800",
        color: "#2563eb",
        letterSpacing: "0.8px"
    },

    formTitle: {
        margin: "5px 0 0",
        fontSize: "20px",
        fontWeight: "800",
        color: "#111827"
    },

    formSubtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "12px"
    },

    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        marginBottom: "20px"
    },

    label: {
        color: "#334155",
        fontSize: "12px",
        fontWeight: "750"
    },

    required: {
        color: "#dc2626"
    },

    optional: {
        color: "#94a3b8",
        fontWeight: "500"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px",
        border: "1px solid #dbe1ea",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#111827",
        fontSize: "12px",
        outline: "none"
    },

    priceInputWrapper: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        border: "1px solid #dbe1ea",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        overflow: "hidden"
    },

    currency: {
        padding: "11px 12px",
        backgroundColor: "#f8fafc",
        borderRight: "1px solid #e5e7eb",
        color: "#475569",
        fontSize: "13px",
        fontWeight: "700"
    },

    priceInput: {
        flex: 1,
        minWidth: 0,
        boxSizing: "border-box",
        padding: "11px 12px",
        border: "none",
        outline: "none",
        color: "#111827",
        fontSize: "13px",
        backgroundColor: "#ffffff"
    },

    helperText: {
        color: "#94a3b8",
        fontSize: "10px"
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px",
        border: "1px solid #dbe1ea",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#111827",
        fontSize: "12px",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        lineHeight: "1.5",
        resize: "vertical",
        outline: "none"
    },

    characterCount: {
        textAlign: "right",
        color: "#94a3b8",
        fontSize: "9px"
    },

    formActions: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "10px",
        paddingTop: "5px"
    },

    cancelButton: {
        padding: "10px 16px",
        border: "1px solid #dbe1ea",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#475569",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "650"
    },

    submitButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "160px",
        padding: "10px 17px",
        border: "none",
        borderRadius: "7px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "750"
    },

    disabledButton: {
        opacity: 0.65,
        cursor: "not-allowed"
    },

    buttonSpinner: {
        display: "inline-block",
        width: "11px",
        height: "11px",
        marginRight: "7px",
        border: "2px solid rgba(255,255,255,0.4)",
        borderTop: "2px solid #ffffff",
        borderRadius: "50%"
    },

    primaryButton: {
        border: "none",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        padding: "10px 16px",
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer"
    },

    secondaryButton: {
        marginTop: "16px",
        border: "1px solid #dbe1ea",
        backgroundColor: "#ffffff",
        color: "#475569",
        padding: "9px 14px",
        borderRadius: "7px",
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer"
    },

    // ==========================================
    // WARNING / EXPIRED
    // ==========================================

    warningCard: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        backgroundColor: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        color: "#92400e"
    },

    warningIcon: {
        fontSize: "24px",
        flexShrink: 0
    },

    warningTitle: {
        margin: 0,
        fontSize: "17px",
        fontWeight: "800"
    },

    warningText: {
        margin: "6px 0 0",
        fontSize: "12px",
        lineHeight: "1.5"
    },

    // ==========================================
    // AWARDED
    // ==========================================

    awardedCard: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        color: "#166534"
    },

    awardedIcon: {
        fontSize: "24px",
        flexShrink: 0
    },

    awardedTitle: {
        margin: 0,
        fontSize: "17px",
        fontWeight: "800"
    },

    awardedText: {
        margin: "6px 0 0",
        fontSize: "12px",
        lineHeight: "1.5"
    },

    // ==========================================
    // LOADING
    // ==========================================

    loadingPage: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
    },

    loadingCard: {
        textAlign: "center",
        padding: "40px"
    },

    spinner: {
        width: "32px",
        height: "32px",
        border: "4px solid #dbeafe",
        borderTop: "4px solid #2563eb",
        borderRadius: "50%",
        margin: "0 auto 15px",
        animation: "spin 1s linear infinite"
    },

    loadingTitle: {
        margin: 0,
        color: "#111827",
        fontSize: "18px"
    },

    loadingText: {
        marginTop: "7px",
        color: "#64748b",
        fontSize: "12px"
    },

    // ==========================================
    // ERROR PAGE
    // ==========================================

    errorPageCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #fecaca",
        borderRadius: "12px",
        padding: "45px",
        textAlign: "center",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.03)"
    },

    errorIcon: {
        width: "40px",
        height: "40px",
        margin: "0 auto 13px",
        borderRadius: "50%",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "20px"
    },

    errorTitle: {
        margin: 0,
        fontSize: "19px",
        color: "#111827"
    },

    errorPageText: {
        margin: "8px 0 20px",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.5"
    }
};

export default SupplierRFQDetails;