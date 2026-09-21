import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function Quotations() {
    const { rfq_id } = useParams();
    const navigate = useNavigate();

    const [rfq, setRfq] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // AUTH HANDLER
    // =====================================================

    const handleUnauthorized = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    }, [navigate]);

    // =====================================================
    // FETCH QUOTATIONS
    // =====================================================

    const fetchQuotations = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await API.get(
                    `/quotations/rfq/${rfq_id}`
                );

                const data = response.data || {};

                setRfq(data.rfq || null);
                setQuotations(
                    Array.isArray(data.quotations)
                        ? data.quotations
                        : []
                );
            } catch (err) {
                console.error("Get quotations error:", err);

                if (err.response?.status === 401) {
                    handleUnauthorized();
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Failed to load quotations. Please try again."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [rfq_id, handleUnauthorized]
    );

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        if (!rfq_id) {
            setError("Invalid RFQ.");
            setLoading(false);
            return;
        }

        fetchQuotations();
    }, [rfq_id, fetchQuotations]);

    // =====================================================
    // ACCEPT QUOTATION
    // =====================================================

    const acceptQuotation = async (quotationId) => {
        const quotation = quotations.find(
            (item) => item.id === quotationId
        );

        if (!quotation) {
            return;
        }

        if (quotation.status !== "PENDING") {
            setError(
                "Only pending quotations can be accepted."
            );
            return;
        }

        if (rfq?.status === "AWARDED") {
            setError(
                "This RFQ has already been awarded."
            );
            return;
        }

        if (rfq?.status === "EXPIRED") {
            setError(
                "This RFQ has expired and can no longer be awarded."
            );
            return;
        }

        const supplierName =
            quotation.supplier_name || "this supplier";

        const confirmed = window.confirm(
            `Are you sure you want to accept the quotation from ${supplierName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setAcceptingId(quotationId);
            setError("");
            setSuccess("");

            const response = await API.put(
                `/quotations/${quotationId}/accept`
            );

            setSuccess(
                response.data?.message ||
                "Quotation accepted successfully!"
            );

            await fetchQuotations(true);
        } catch (err) {
            console.error(
                "Accept quotation error:",
                err
            );

            if (err.response?.status === 401) {
                handleUnauthorized();
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to accept quotation. Please try again."
            );
        } finally {
            setAcceptingId(null);
        }
    };

    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.loadingCard}>
                    <div style={styles.spinner}></div>

                    <h2 style={styles.loadingTitle}>
                        Loading quotations...
                    </h2>

                    <p style={styles.loadingText}>
                        Please wait while we fetch supplier
                        quotations.
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR PAGE
    // =====================================================

    if (error && !rfq) {
        return (
            <div style={styles.page}>
                <header style={styles.header}>
                    <Brand
                        navigate={navigate}
                    />
                </header>

                <main style={styles.container}>
                    <div style={styles.errorCard}>
                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <h2 style={styles.errorTitle}>
                            Unable to load quotations
                        </h2>

                        <p style={styles.errorText}>
                            {error}
                        </p>

                        <div style={styles.errorActions}>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/buyer")
                                }
                                style={styles.primaryButton}
                            >
                                ← Back to Dashboard
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    fetchQuotations()
                                }
                                style={styles.secondaryButton}
                            >
                                ↻ Try Again
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // =====================================================
    // DERIVED DATA
    // =====================================================

    const acceptedQuotation = quotations.find(
        (quotation) =>
            quotation.status === "ACCEPTED"
    );

    const pendingCount = quotations.filter(
        (quotation) =>
            quotation.status === "PENDING"
    ).length;

    const isAwarded =
        rfq?.status === "AWARDED" ||
        Boolean(acceptedQuotation);

    const isExpired =
        rfq?.status === "EXPIRED" ||
        (rfq?.deadline &&
            !Number.isNaN(
                new Date(rfq.deadline).getTime()
            ) &&
            new Date(rfq.deadline) < new Date());

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div style={styles.page}>
            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>
                <Brand navigate={navigate} />

                <button
                    type="button"
                    onClick={() => navigate("/buyer")}
                    style={styles.headerButton}
                >
                    ← Back to Dashboard
                </button>
            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>
                {/* BREADCRUMB */}

                <div style={styles.breadcrumb}>
                    Buyer Dashboard / RFQ / Quotations
                </div>

                {/* PAGE HEADING */}

                <div style={styles.pageHeading}>
                    <div>
                        <h1 style={styles.pageTitle}>
                            Supplier Quotations
                        </h1>

                        <p style={styles.pageSubtitle}>
                            Review supplier offers and select
                            the quotation that best meets your
                            requirements.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchQuotations(true)
                        }
                        disabled={refreshing}
                        style={{
                            ...styles.refreshButton,
                            ...(refreshing
                                ? styles.disabledButton
                                : {}),
                        }}
                    >
                        {refreshing
                            ? "↻ Refreshing..."
                            : "↻ Refresh"}
                    </button>
                </div>

                {/* =================================================
                    RFQ SUMMARY
                ================================================= */}

                {rfq && (
                    <div style={styles.rfqCard}>
                        <div style={styles.rfqTop}>
                            <div>
                                <span style={styles.rfqLabel}>
                                    REQUEST FOR QUOTATION
                                </span>

                                <h2 style={styles.rfqName}>
                                    {rfq.product_name ||
                                        "Unnamed Product"}
                                </h2>
                            </div>

                            <span
                                style={{
                                    ...styles.rfqStatus,
                                    ...getRFQStatusStyle(
                                        isAwarded
                                            ? "AWARDED"
                                            : isExpired
                                                ? "EXPIRED"
                                                : rfq.status
                                    ),
                                }}
                            >
                                {isAwarded
                                    ? "AWARDED"
                                    : isExpired
                                        ? "EXPIRED"
                                        : rfq.status ||
                                          "OPEN"}
                            </span>
                        </div>

                        <div style={styles.rfqDescription}>
                            {rfq.description ||
                                "No description provided."}
                        </div>

                        <div style={styles.rfqDetails}>
                            <div style={styles.rfqDetail}>
                                <span style={styles.detailLabelSmall}>
                                    QUANTITY
                                </span>

                                <strong>
                                    {rfq.quantity ??
                                        "Not specified"}
                                </strong>
                            </div>

                            <div style={styles.rfqDetail}>
                                <span style={styles.detailLabelSmall}>
                                    DELIVERY LOCATION
                                </span>

                                <strong>
                                    {rfq.delivery_location ||
                                        "Not specified"}
                                </strong>
                            </div>

                            <div style={styles.rfqDetail}>
                                <span style={styles.detailLabelSmall}>
                                    DEADLINE
                                </span>

                                <strong
                                    style={{
                                        color: isExpired
                                            ? "#dc2626"
                                            : "#334155",
                                    }}
                                >
                                    {formatDateTime(
                                        rfq.deadline
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (
                    <div style={styles.successBox}>
                        <div style={styles.successIcon}>
                            ✓
                        </div>

                        <div>
                            <strong>
                                Quotation Accepted
                            </strong>

                            <p style={styles.alertText}>
                                {success}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                            style={styles.closeButton}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div style={styles.errorBox}>
                        <div style={styles.errorSmallIcon}>
                            !
                        </div>

                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            style={styles.closeButton}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* =================================================
                    AWARDED NOTICE
                ================================================= */}

                {acceptedQuotation && (
                    <div style={styles.awardedNotice}>
                        <div style={styles.awardedIcon}>
                            🏆
                        </div>

                        <div>
                            <strong>
                                RFQ Awarded
                            </strong>

                            <p style={styles.noticeText}>
                                This RFQ has been awarded to{" "}
                                <strong>
                                    {acceptedQuotation.supplier_name ||
                                        "the selected supplier"}
                                </strong>
                                .
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================
                    EXPIRED NOTICE
                ================================================= */}

                {!acceptedQuotation &&
                    isExpired && (
                        <div style={styles.expiredNotice}>
                            <div style={styles.expiredIcon}>
                                ⏰
                            </div>

                            <div>
                                <strong>
                                    RFQ Deadline Passed
                                </strong>

                                <p style={styles.noticeText}>
                                    This RFQ has expired and
                                    quotations can no longer
                                    be accepted.
                                </p>
                            </div>
                        </div>
                    )}

                {/* =================================================
                    QUOTATIONS SECTION HEADER
                ================================================= */}

                <div style={styles.sectionHeader}>
                    <div>
                        <h2 style={styles.sectionTitle}>
                            Supplier Quotations
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            {quotations.length === 0
                                ? "No quotations received yet."
                                : `${quotations.length} quotation${
                                      quotations.length !==
                                      1
                                          ? "s"
                                          : ""
                                  } received${
                                      pendingCount > 0
                                          ? ` • ${pendingCount} pending`
                                          : ""
                                  }`}
                        </p>
                    </div>
                </div>

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {quotations.length === 0 ? (
                    <div style={styles.emptyCard}>
                        <div style={styles.emptyIcon}>
                            📄
                        </div>

                        <h2 style={styles.emptyTitle}>
                            No quotations yet
                        </h2>

                        <p style={styles.emptyText}>
                            Suppliers have not submitted any
                            quotations for this RFQ yet.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                fetchQuotations(true)
                            }
                            disabled={refreshing}
                            style={styles.primaryButton}
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "↻ Refresh"}
                        </button>
                    </div>
                ) : (
                    <div style={styles.quotationList}>
                        {quotations.map(
                            (quotation, index) => {
                                const isAccepted =
                                    quotation.status ===
                                    "ACCEPTED";

                                const isRejected =
                                    quotation.status ===
                                    "REJECTED";

                                const isPending =
                                    quotation.status ===
                                    "PENDING";

                                const isAccepting =
                                    acceptingId ===
                                    quotation.id;

                                return (
                                    <div
                                        key={
                                            quotation.id ||
                                            `quotation-${index}`
                                        }
                                        style={{
                                            ...styles.quotationCard,
                                            ...(isAccepted
                                                ? styles.acceptedCard
                                                : {}),
                                        }}
                                    >
                                        {/* CARD TOP */}

                                        <div
                                            style={
                                                styles.cardTop
                                            }
                                        >
                                            <div
                                                style={
                                                    styles.supplierSection
                                                }
                                            >
                                                <div
                                                    style={
                                                        styles.supplierAvatar
                                                    }
                                                >
                                                    {getInitial(
                                                        quotation.supplier_name
                                                    )}
                                                </div>

                                                <div>
                                                    <h3
                                                        style={
                                                            styles.supplierName
                                                        }
                                                    >
                                                        {quotation.supplier_name ||
                                                            "Unknown Supplier"}
                                                    </h3>

                                                    <p
                                                        style={
                                                            styles.supplierEmail
                                                        }
                                                    >
                                                        {quotation.supplier_email ||
                                                            "Email not available"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                style={
                                                    styles.cardRight
                                                }
                                            >
                                                <span
                                                    style={
                                                        styles.rank
                                                    }
                                                >
                                                    #
                                                    {index +
                                                        1}
                                                </span>

                                                <span
                                                    style={{
                                                        ...styles.status,
                                                        ...getStatusStyle(
                                                            quotation.status
                                                        ),
                                                    }}
                                                >
                                                    {quotation.status ||
                                                        "PENDING"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* QUOTE DETAILS */}

                                        <div
                                            style={
                                                styles.quoteDetails
                                            }
                                        >
                                            <div
                                                style={
                                                    styles.quoteDetail
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
                                                        styles.price
                                                    }
                                                >
                                                    ₹
                                                    {formatPrice(
                                                        quotation.quoted_price
                                                    )}
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    styles.verticalLine
                                                }
                                            ></div>

                                            <div
                                                style={
                                                    styles.quoteDetail
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
                                                        styles.delivery
                                                    }
                                                >
                                                    {quotation.estimated_delivery_time ||
                                                        "Not specified"}
                                                </strong>
                                            </div>

                                            <div
                                                style={
                                                    styles.verticalLine
                                                }
                                            ></div>

                                            <div
                                                style={
                                                    styles.quoteDetail
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
                                                        styles.submitted
                                                    }
                                                >
                                                    {formatDate(
                                                        quotation.created_at
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* MESSAGE */}

                                        {quotation.message && (
                                            <div
                                                style={
                                                    styles.messageBox
                                                }
                                            >
                                                <div
                                                    style={
                                                        styles.messageTitle
                                                    }
                                                >
                                                    Supplier Message
                                                </div>

                                                <p
                                                    style={
                                                        styles.messageText
                                                    }
                                                >
                                                    “
                                                    {
                                                        quotation.message
                                                    }
                                                    ”
                                                </p>
                                            </div>
                                        )}

                                        {/* SUBMISSION TIME */}

                                        <div
                                            style={
                                                styles.submittedTime
                                            }
                                        >
                                            Submitted on{" "}
                                            {formatDateTime(
                                                quotation.created_at
                                            )}
                                        </div>

                                        {/* ACCEPT BUTTON */}

                                        {isPending &&
                                            !isAwarded &&
                                            !isExpired && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        acceptQuotation(
                                                            quotation.id
                                                        )
                                                    }
                                                    disabled={
                                                        isAccepting ||
                                                        acceptingId !==
                                                            null
                                                    }
                                                    style={{
                                                        ...styles.acceptButton,
                                                        ...(isAccepting ||
                                                        acceptingId !==
                                                            null
                                                            ? styles.disabledButton
                                                            : {}),
                                                    }}
                                                >
                                                    {isAccepting ? (
                                                        <>
                                                            <span
                                                                style={
                                                                    styles.buttonSpinner
                                                                }
                                                            ></span>

                                                            Accepting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            ✓ Accept
                                                            Quotation
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                        {/* ACCEPTED MESSAGE */}

                                        {isAccepted && (
                                            <div
                                                style={
                                                    styles.acceptedMessage
                                                }
                                            >
                                                <span
                                                    style={
                                                        styles.checkCircle
                                                    }
                                                >
                                                    ✓
                                                </span>

                                                <div>
                                                    <strong>
                                                        This quotation
                                                        has been accepted
                                                    </strong>

                                                    <p
                                                        style={
                                                            styles.smallMessage
                                                        }
                                                    >
                                                        This supplier
                                                        has been selected
                                                        for this RFQ.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* REJECTED MESSAGE */}

                                        {isRejected && (
                                            <div
                                                style={
                                                    styles.rejectedMessage
                                                }
                                            >
                                                <span
                                                    style={
                                                        styles.rejectCircle
                                                    }
                                                >
                                                    ✕
                                                </span>

                                                <div>
                                                    <strong>
                                                        Quotation
                                                        Rejected
                                                    </strong>

                                                    <p
                                                        style={
                                                            styles.smallMessage
                                                        }
                                                    >
                                                        This quotation
                                                        was not selected.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// =====================================================
// BRAND COMPONENT
// =====================================================

function Brand({ navigate }) {
    return (
        <div
            style={styles.brand}
            onClick={() => navigate("/buyer")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (
                    e.key === "Enter" ||
                    e.key === " "
                ) {
                    navigate("/buyer");
                }
            }}
        >
            <div style={styles.logo}>RFQ</div>

            <div>
                <div style={styles.brandName}>
                    B2B RFQ Marketplace
                </div>

                <div style={styles.brandSubtitle}>
                    Procurement made simple
                </div>
            </div>
        </div>
    );
}

// =====================================================
// HELPERS
// =====================================================

function getInitial(name) {
    if (!name) {
        return "S";
    }

    return String(name)
        .trim()
        .charAt(0)
        .toUpperCase();
}

function formatPrice(price) {
    const number = Number(price);

    if (Number.isNaN(number)) {
        return "0";
    }

    return number.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatDate(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// =====================================================
// RFQ STATUS STYLE
// =====================================================

function getRFQStatusStyle(status) {
    const normalizedStatus =
        String(status || "").toUpperCase();

    if (normalizedStatus === "AWARDED") {
        return {
            backgroundColor: "#dcfce7",
            color: "#166534",
        };
    }

    if (normalizedStatus === "EXPIRED") {
        return {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
        };
    }

    if (normalizedStatus === "CLOSED") {
        return {
            backgroundColor: "#f1f5f9",
            color: "#475569",
        };
    }

    return {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
    };
}

// =====================================================
// QUOTATION STATUS STYLE
// =====================================================

function getStatusStyle(status) {
    const normalizedStatus =
        String(status || "PENDING").toUpperCase();

    if (normalizedStatus === "ACCEPTED") {
        return {
            backgroundColor: "#dcfce7",
            color: "#166534",
        };
    }

    if (normalizedStatus === "REJECTED") {
        return {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
        };
    }

    return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
    };
}

// =====================================================
// STYLES
// =====================================================

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        color: "#0f172a",
    },

    // HEADER

    header: {
        minHeight: "68px",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        position: "sticky",
        top: 0,
        zIndex: 20,
    },

    brand: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        cursor: "pointer",
        userSelect: "none",
    },

    logo: {
        width: "40px",
        height: "40px",
        flexShrink: 0,
        borderRadius: "9px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "800",
    },

    brandName: {
        fontSize: "15px",
        fontWeight: "750",
        color: "#111827",
    },

    brandSubtitle: {
        fontSize: "10px",
        color: "#64748b",
        marginTop: "2px",
    },

    headerButton: {
        backgroundColor: "#ffffff",
        border: "1px solid #dbe1ea",
        color: "#475569",
        padding: "9px 14px",
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: "650",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },

    // MAIN

    container: {
        width: "100%",
        maxWidth: "1050px",
        boxSizing: "border-box",
        margin: "0 auto",
        padding: "32px 24px 60px",
    },

    breadcrumb: {
        fontSize: "11px",
        fontWeight: "600",
        color: "#64748b",
        marginBottom: "9px",
    },

    pageHeading: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "24px",
    },

    pageTitle: {
        margin: 0,
        fontSize: "30px",
        lineHeight: "1.2",
        fontWeight: "800",
        letterSpacing: "-0.5px",
        color: "#0f172a",
    },

    pageSubtitle: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: "1.5",
    },

    refreshButton: {
        border: "1px solid #dbe1ea",
        backgroundColor: "#ffffff",
        color: "#475569",
        padding: "9px 14px",
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: "650",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },

    // RFQ CARD

    rfqCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "22px",
        marginBottom: "20px",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.03)",
    },

    rfqTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
    },

    rfqLabel: {
        fontSize: "9px",
        fontWeight: "800",
        color: "#64748b",
        letterSpacing: "0.8px",
    },

    rfqName: {
        margin: "5px 0 0",
        fontSize: "21px",
        fontWeight: "750",
        color: "#111827",
    },

    rfqStatus: {
        padding: "6px 11px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "800",
        whiteSpace: "nowrap",
    },

    rfqDescription: {
        marginTop: "14px",
        paddingTop: "14px",
        borderTop: "1px solid #eef2f7",
        color: "#475569",
        fontSize: "13px",
        lineHeight: "1.55",
    },

    rfqDetails: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "18px",
        marginTop: "18px",
    },

    rfqDetail: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        minWidth: 0,
        color: "#334155",
        fontSize: "13px",
    },

    detailLabelSmall: {
        color: "#94a3b8",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.5px",
    },

    // ALERTS

    successBox: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "13px 15px",
        marginBottom: "15px",
        borderRadius: "8px",
        border: "1px solid #bbf7d0",
        backgroundColor: "#f0fdf4",
        color: "#166534",
        fontSize: "12px",
    },

    successIcon: {
        width: "26px",
        height: "26px",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "#16a34a",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
    },

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
        fontSize: "12px",
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
        fontWeight: "800",
    },

    closeButton: {
        marginLeft: "auto",
        border: "none",
        background: "transparent",
        color: "currentColor",
        fontSize: "18px",
        lineHeight: 1,
        cursor: "pointer",
        padding: "2px 5px",
    },

    alertText: {
        margin: "3px 0 0",
        color: "#166534",
    },

    noticeText: {
        margin: "4px 0 0",
        fontSize: "12px",
        lineHeight: "1.5",
    },

    awardedNotice: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "15px",
        marginBottom: "24px",
        borderRadius: "9px",
        border: "1px solid #fde68a",
        backgroundColor: "#fffbeb",
        color: "#92400e",
    },

    awardedIcon: {
        fontSize: "23px",
        flexShrink: 0,
    },

    expiredNotice: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "15px",
        marginBottom: "24px",
        borderRadius: "9px",
        border: "1px solid #fecaca",
        backgroundColor: "#fef2f2",
        color: "#991b1b",
    },

    expiredIcon: {
        fontSize: "23px",
        flexShrink: 0,
    },

    // SECTION

    sectionHeader: {
        marginBottom: "14px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "19px",
        fontWeight: "750",
        color: "#111827",
    },

    sectionSubtitle: {
        margin: "4px 0 0",
        color: "#64748b",
        fontSize: "11px",
    },

    // QUOTATION LIST

    quotationList: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },

    quotationCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "11px",
        padding: "21px",
        boxShadow:
            "0 2px 7px rgba(15,23,42,0.03)",
    },

    acceptedCard: {
        border: "1px solid #86efac",
        boxShadow:
            "0 3px 10px rgba(22,163,74,0.07)",
    },

    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
    },

    supplierSection: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        minWidth: 0,
    },

    supplierAvatar: {
        width: "40px",
        height: "40px",
        flexShrink: 0,
        borderRadius: "9px",
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        fontWeight: "800",
    },

    supplierName: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "750",
        color: "#111827",
    },

    supplierEmail: {
        margin: "3px 0 0",
        fontSize: "11px",
        color: "#64748b",
        overflowWrap: "anywhere",
    },

    cardRight: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
    },

    rank: {
        color: "#94a3b8",
        fontSize: "10px",
        fontWeight: "700",
    },

    status: {
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "9px",
        fontWeight: "800",
        whiteSpace: "nowrap",
    },

    // QUOTE DETAILS

    quoteDetails: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1px 1fr 1px 1fr",
        alignItems: "center",
        marginTop: "20px",
        padding: "18px 0",
        borderTop: "1px solid #eef2f7",
        borderBottom: "1px solid #eef2f7",
    },

    quoteDetail: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "0 16px",
        minWidth: 0,
    },

    detailLabel: {
        color: "#94a3b8",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.5px",
    },

    price: {
        color: "#111827",
        fontSize: "20px",
        fontWeight: "800",
    },

    delivery: {
        color: "#334155",
        fontSize: "14px",
        fontWeight: "700",
        overflowWrap: "anywhere",
    },

    submitted: {
        color: "#334155",
        fontSize: "13px",
        fontWeight: "650",
    },

    verticalLine: {
        width: "1px",
        height: "42px",
        backgroundColor: "#e5e7eb",
    },

    // MESSAGE

    messageBox: {
        marginTop: "16px",
        padding: "13px 15px",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #eef2f7",
    },

    messageTitle: {
        color: "#475569",
        fontSize: "10px",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
    },

    messageText: {
        margin: "7px 0 0",
        color: "#475569",
        fontSize: "12px",
        lineHeight: "1.55",
        overflowWrap: "anywhere",
    },

    submittedTime: {
        marginTop: "12px",
        color: "#94a3b8",
        fontSize: "10px",
    },

    // BUTTONS

    acceptButton: {
        marginTop: "16px",
        width: "100%",
        border: "none",
        borderRadius: "7px",
        padding: "11px",
        backgroundColor: "#16a34a",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "750",
        cursor: "pointer",
    },

    disabledButton: {
        opacity: 0.65,
        cursor: "not-allowed",
    },

    buttonSpinner: {
        display: "inline-block",
        width: "11px",
        height: "11px",
        marginRight: "7px",
        border: "2px solid rgba(255,255,255,0.4)",
        borderTop: "2px solid #ffffff",
        borderRadius: "50%",
        verticalAlign: "middle",
    },

    primaryButton: {
        border: "none",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        padding: "10px 16px",
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    secondaryButton: {
        border: "1px solid #d7dee8",
        backgroundColor: "#ffffff",
        color: "#475569",
        padding: "10px 16px",
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    // ACCEPTED

    acceptedMessage: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "16px",
        padding: "13px",
        backgroundColor: "#f0fdf4",
        color: "#166534",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        fontSize: "11px",
    },

    checkCircle: {
        width: "25px",
        height: "25px",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "#16a34a",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
    },

    // REJECTED

    rejectedMessage: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "16px",
        padding: "13px",
        backgroundColor: "#fef2f2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        fontSize: "11px",
    },

    rejectCircle: {
        width: "25px",
        height: "25px",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "#dc2626",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
    },

    smallMessage: {
        margin: "3px 0 0",
        color: "inherit",
        opacity: 0.85,
    },

    // EMPTY

    emptyCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "55px 30px",
        textAlign: "center",
    },

    emptyIcon: {
        fontSize: "34px",
        marginBottom: "10px",
    },

    emptyTitle: {
        margin: "0 0 7px",
        fontSize: "19px",
        color: "#111827",
    },

    emptyText: {
        maxWidth: "480px",
        margin: "0 auto 18px",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.5",
    },

    // LOADING

    loadingPage: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    },

    loadingCard: {
        textAlign: "center",
        padding: "40px",
    },

    spinner: {
        width: "32px",
        height: "32px",
        border: "4px solid #dbeafe",
        borderTop: "4px solid #2563eb",
        borderRadius: "50%",
        margin: "0 auto 15px",
        animation: "spin 0.8s linear infinite",
    },

    loadingTitle: {
        margin: 0,
        fontSize: "18px",
        color: "#111827",
    },

    loadingText: {
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.5",
    },

    // ERROR PAGE

    errorCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #fecaca",
        borderRadius: "12px",
        padding: "45px",
        textAlign: "center",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.03)",
    },

    errorIcon: {
        width: "38px",
        height: "38px",
        margin: "0 auto 12px",
        borderRadius: "50%",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "20px",
    },

    errorTitle: {
        margin: 0,
        fontSize: "20px",
        color: "#111827",
    },

    errorText: {
        maxWidth: "550px",
        margin: "8px auto 20px",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: "1.5",
    },

    errorActions: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
    },
};

export default Quotations;