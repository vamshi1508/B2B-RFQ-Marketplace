import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function BuyerDashboard() {
    const navigate = useNavigate();

    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    // ==========================================
    // FETCH BUYER RFQs
    // ==========================================

    useEffect(() => {
        fetchRFQs();
    }, []);

    const fetchRFQs = async () => {
        try {
            setLoading(true);
            setError("");

            // Buyer should fetch only their own RFQs
            const response = await API.get("/rfqs/my");

            console.log("BUYER RFQ RESPONSE:", response.data);

            setRfqs(
                Array.isArray(response.data.rfqs)
                    ? response.data.rfqs
                    : []
            );
        } catch (err) {
            console.error("Buyer dashboard error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load RFQs"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ==========================================
    // GET DISPLAY STATUS
    // ==========================================

    const getDisplayStatus = (rfq) => {
        if (!rfq) {
            return "UNKNOWN";
        }

        if (rfq.status === "AWARDED") {
            return "AWARDED";
        }

        const deadline = new Date(rfq.deadline);

        if (
            !Number.isNaN(deadline.getTime()) &&
            deadline < new Date() &&
            rfq.status === "OPEN"
        ) {
            return "EXPIRED";
        }

        return rfq.status || "OPEN";
    };

    // ==========================================
    // STATISTICS
    // ==========================================

    const openCount = rfqs.filter(
        (rfq) =>
            getDisplayStatus(rfq) === "OPEN"
    ).length;

    const awardedCount = rfqs.filter(
        (rfq) =>
            getDisplayStatus(rfq) === "AWARDED"
    ).length;

    const expiredCount = rfqs.filter(
        (rfq) =>
            getDisplayStatus(rfq) === "EXPIRED"
    ).length;

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div style={styles.center}>
                <div style={styles.loadingBox}>
                    <div style={styles.spinner}></div>

                    <h2 style={styles.loadingTitle}>
                        Loading Buyer Dashboard...
                    </h2>

                    <p style={styles.loadingText}>
                        Please wait while we fetch your RFQs.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div style={styles.page}>

            {/* ==================================
                HEADER
            ================================== */}

            <header style={styles.header}>

                <div style={styles.logoSection}>

                    <div style={styles.logoIcon}>
                        B2B
                    </div>

                    <div>
                        <h2 style={styles.logo}>
                            RFQ Marketplace
                        </h2>

                        <span style={styles.logoSubtitle}>
                            Buyer Portal
                        </span>
                    </div>

                </div>

                <div style={styles.headerRight}>

                    <div style={styles.userInfo}>

                        <div style={styles.avatar}>
                            {(
                                user.name ||
                                user.email ||
                                "B"
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>

                            <span style={styles.userLabel}>
                                Buyer
                            </span>

                            <strong style={styles.userName}>
                                {user.name ||
                                    user.email ||
                                    "Buyer"}
                            </strong>

                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        style={styles.logoutButton}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* ==================================
                MAIN
            ================================== */}

            <main style={styles.container}>

                {/* ==================================
                    TITLE
                ================================== */}

                <div style={styles.titleSection}>

                    <div>

                        <span style={styles.eyebrow}>
                            PROCUREMENT MANAGEMENT
                        </span>

                        <h1 style={styles.title}>
                            Buyer Dashboard
                        </h1>

                        <p style={styles.subtitle}>
                            Create RFQs, compare supplier
                            quotations, and manage your
                            procurement requests.
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/buyer/create-rfq")
                        }
                        style={styles.createButton}
                    >
                        <span style={styles.createIcon}>
                            +
                        </span>

                        Create New RFQ
                    </button>

                </div>

                {/* ==================================
                    ERROR
                ================================== */}

                {error && (
                    <div style={styles.error}>

                        <span style={styles.errorIcon}>
                            !
                        </span>

                        <div>

                            <strong>
                                Unable to load RFQs
                            </strong>

                            <p style={styles.errorText}>
                                {error}
                            </p>

                        </div>

                        <button
                            onClick={fetchRFQs}
                            style={styles.retryButton}
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* ==================================
                    STATISTICS
                ================================== */}

                <div style={styles.statsGrid}>

                    {/* TOTAL */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.blueIcon
                            }}
                        >
                            📋
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                Total RFQs
                            </span>

                            <strong style={styles.statNumber}>
                                {rfqs.length}
                            </strong>

                        </div>

                    </div>

                    {/* OPEN */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.greenIcon
                            }}
                        >
                            🔓
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                Open RFQs
                            </span>

                            <strong style={styles.statNumber}>
                                {openCount}
                            </strong>

                        </div>

                    </div>

                    {/* AWARDED */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.orangeIcon
                            }}
                        >
                            🏆
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                Awarded
                            </span>

                            <strong style={styles.statNumber}>
                                {awardedCount}
                            </strong>

                        </div>

                    </div>

                    {/* EXPIRED */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.redIcon
                            }}
                        >
                            ⏰
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                Expired
                            </span>

                            <strong style={styles.statNumber}>
                                {expiredCount}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* ==================================
                    RFQ SECTION
                ================================== */}

                <section style={styles.rfqSection}>

                    <div style={styles.sectionHeader}>

                        <div>

                            <h2 style={styles.sectionTitle}>
                                My RFQs
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                Manage your requests for
                                quotation and review supplier
                                responses.
                            </p>

                        </div>

                        <button
                            onClick={fetchRFQs}
                            style={styles.refreshButton}
                        >
                            ↻ Refresh
                        </button>

                    </div>

                    {/* ==================================
                        EMPTY STATE
                    ================================== */}

                    {rfqs.length === 0 ? (

                        <div style={styles.empty}>

                            <div style={styles.emptyIcon}>
                                📋
                            </div>

                            <h3 style={styles.emptyTitle}>
                                No RFQs created yet
                            </h3>

                            <p style={styles.emptyText}>
                                Create your first RFQ to start
                                receiving quotations from
                                suppliers.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/buyer/create-rfq"
                                    )
                                }
                                style={styles.emptyButton}
                            >
                                + Create Your First RFQ
                            </button>

                        </div>

                    ) : (

                        <div style={styles.tableWrapper}>

                            <table style={styles.table}>

                                <thead>

                                    <tr>

                                        <th style={styles.th}>
                                            Product
                                        </th>

                                        <th style={styles.th}>
                                            Quantity
                                        </th>

                                        <th style={styles.th}>
                                            Delivery Location
                                        </th>

                                        <th style={styles.th}>
                                            Deadline
                                        </th>

                                        <th style={styles.th}>
                                            Status
                                        </th>

                                        <th
                                            style={{
                                                ...styles.th,
                                                textAlign: "right"
                                            }}
                                        >
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {rfqs.map((rfq) => {

                                        const status =
                                            getDisplayStatus(rfq);

                                        const deadline =
                                            new Date(
                                                rfq.deadline
                                            );

                                        return (
                                            <tr
                                                key={rfq.id}
                                                style={styles.tableRow}
                                            >

                                                {/* PRODUCT */}

                                                <td style={styles.td}>

                                                    <div
                                                        style={
                                                            styles.productCell
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.productIcon
                                                            }
                                                        >
                                                            📦
                                                        </div>

                                                        <div>

                                                            <strong
                                                                style={
                                                                    styles.productName
                                                                }
                                                            >
                                                                {
                                                                    rfq.product_name
                                                                }
                                                            </strong>

                                                            <span
                                                                style={
                                                                    styles.rfqId
                                                                }
                                                            >
                                                                RFQ #
                                                                {rfq.id}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* QUANTITY */}

                                                <td style={styles.td}>
                                                    <strong>
                                                        {rfq.quantity}
                                                    </strong>
                                                </td>

                                                {/* LOCATION */}

                                                <td style={styles.td}>

                                                    <span
                                                        style={
                                                            styles.location
                                                        }
                                                    >
                                                        📍{" "}
                                                        {
                                                            rfq.delivery_location
                                                        }
                                                    </span>

                                                </td>

                                                {/* DEADLINE */}

                                                <td style={styles.td}>

                                                    <div
                                                        style={
                                                            styles.deadlineCell
                                                        }
                                                    >

                                                        <strong
                                                            style={{
                                                                color:
                                                                    status ===
                                                                    "EXPIRED"
                                                                        ? "#dc2626"
                                                                        : "#374151"
                                                            }}
                                                        >
                                                            {Number.isNaN(
                                                                deadline.getTime()
                                                            )
                                                                ? "Invalid date"
                                                                : deadline.toLocaleDateString(
                                                                      "en-IN",
                                                                      {
                                                                          day: "2-digit",
                                                                          month: "short",
                                                                          year: "numeric"
                                                                      }
                                                                  )}
                                                        </strong>

                                                        {!Number.isNaN(
                                                            deadline.getTime()
                                                        ) && (
                                                            <span
                                                                style={
                                                                    styles.deadlineTime
                                                                }
                                                            >
                                                                {deadline.toLocaleTimeString(
                                                                    "en-IN",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit"
                                                                    }
                                                                )}
                                                            </span>
                                                        )}

                                                    </div>

                                                </td>

                                                {/* STATUS */}

                                                <td style={styles.td}>

                                                    <span
                                                        style={{
                                                            ...styles.status,
                                                            ...getStatusStyle(
                                                                status
                                                            )
                                                        }}
                                                    >

                                                        <span
                                                            style={
                                                                styles.statusDot
                                                            }
                                                        ></span>

                                                        {status}

                                                    </span>

                                                </td>

                                                {/* ACTION */}

                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        textAlign: "right"
                                                    }}
                                                >

                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/buyer/rfq/${rfq.id}`
                                                            )
                                                        }
                                                        style={
                                                            styles.viewButton
                                                        }
                                                    >
                                                        View Details
                                                        <span>
                                                            →
                                                        </span>
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

            {/* ==================================
                FOOTER
            ================================== */}

            <footer style={styles.footer}>

                <span>
                    B2B RFQ Marketplace
                </span>

                <span>
                    Buyer Procurement Portal
                </span>

            </footer>

        </div>
    );
}

// ==========================================
// STATUS STYLE
// ==========================================

function getStatusStyle(status) {

    switch (status) {

        case "OPEN":
            return {
                backgroundColor: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0"
            };

        case "AWARDED":
            return {
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe"
            };

        case "EXPIRED":
            return {
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca"
            };

        case "CLOSED":
            return {
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #e5e7eb"
            };

        default:
            return {
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a"
            };
    }
}

// ==========================================
// STYLES
// ==========================================

const styles = {

    page: {
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        fontFamily:
            "Inter, Arial, Helvetica, sans-serif",
        color: "#111827"
    },

    // ==========================================
    // HEADER
    // ==========================================

    header: {
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        minHeight: "72px",
        padding: "0 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box"
    },

    logoSection: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    logoIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "9px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "0.5px"
    },

    logo: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "700",
        color: "#111827"
    },

    logoSubtitle: {
        display: "block",
        marginTop: "2px",
        fontSize: "11px",
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },

    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: "22px"
    },

    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    avatar: {
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        fontSize: "15px"
    },

    userLabel: {
        display: "block",
        color: "#9ca3af",
        fontSize: "11px",
        marginBottom: "2px"
    },

    userName: {
        display: "block",
        color: "#374151",
        fontSize: "14px"
    },

    logoutButton: {
        padding: "9px 16px",
        border: "1px solid #fecaca",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#dc2626",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px"
    },

    // ==========================================
    // MAIN
    // ==========================================

    container: {
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "42px 24px 60px"
    },

    titleSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "30px",
        marginBottom: "32px"
    },

    eyebrow: {
        display: "block",
        color: "#2563eb",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1px",
        marginBottom: "8px"
    },

    title: {
        margin: 0,
        fontSize: "32px",
        lineHeight: "1.2",
        fontWeight: "750",
        color: "#111827"
    },

    subtitle: {
        margin: "9px 0 0",
        color: "#6b7280",
        fontSize: "15px",
        lineHeight: "1.6",
        maxWidth: "650px"
    },

    createButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 18px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "14px",
        whiteSpace: "nowrap",
        boxShadow:
            "0 4px 10px rgba(37,99,235,0.18)"
    },

    createIcon: {
        fontSize: "20px",
        lineHeight: "14px",
        fontWeight: "400"
    },

    // ==========================================
    // ERROR
    // ==========================================

    error: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
        color: "#991b1b",
        padding: "14px 16px",
        borderRadius: "8px",
        marginBottom: "24px"
    },

    errorIcon: {
        width: "27px",
        height: "27px",
        borderRadius: "50%",
        backgroundColor: "#fee2e2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800"
    },

    errorText: {
        margin: "3px 0 0",
        fontSize: "13px"
    },

    retryButton: {
        marginLeft: "auto",
        padding: "7px 13px",
        border: "1px solid #fecaca",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        color: "#991b1b",
        cursor: "pointer",
        fontWeight: "600"
    },

    // ==========================================
    // STATISTICS
    // ==========================================

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "42px"
    },

    statCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow:
            "0 2px 6px rgba(0,0,0,0.03)"
    },

    statIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px"
    },

    blueIcon: {
        backgroundColor: "#dbeafe"
    },

    greenIcon: {
        backgroundColor: "#dcfce7"
    },

    orangeIcon: {
        backgroundColor: "#ffedd5"
    },

    redIcon: {
        backgroundColor: "#fee2e2"
    },

    statContent: {
        display: "flex",
        flexDirection: "column",
        gap: "3px"
    },

    statLabel: {
        fontSize: "13px",
        color: "#6b7280"
    },

    statNumber: {
        fontSize: "26px",
        color: "#111827",
        lineHeight: "1"
    },

    // ==========================================
    // RFQ SECTION
    // ==========================================

    rfqSection: {
        marginTop: "5px"
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "18px"
    },

    sectionTitle: {
        margin: 0,
        fontSize: "21px",
        color: "#111827"
    },

    sectionSubtitle: {
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: "13px"
    },

    refreshButton: {
        padding: "8px 14px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#374151",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600"
    },

    // ==========================================
    // TABLE
    // ==========================================

    tableWrapper: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        overflowX: "auto",
        boxShadow:
            "0 2px 8px rgba(0,0,0,0.03)"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "900px"
    },

    th: {
        padding: "14px 16px",
        textAlign: "left",
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        color: "#6b7280",
        fontSize: "11px",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        whiteSpace: "nowrap"
    },

    tableRow: {
        borderBottom: "1px solid #f1f5f9"
    },

    td: {
        padding: "17px 16px",
        color: "#374151",
        fontSize: "13px",
        verticalAlign: "middle"
    },

    productCell: {
        display: "flex",
        alignItems: "center",
        gap: "11px"
    },

    productIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "8px",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px"
    },

    productName: {
        display: "block",
        color: "#111827",
        fontSize: "14px",
        marginBottom: "3px"
    },

    rfqId: {
        display: "block",
        color: "#9ca3af",
        fontSize: "11px"
    },

    location: {
        color: "#4b5563",
        whiteSpace: "nowrap"
    },

    deadlineCell: {
        display: "flex",
        flexDirection: "column",
        gap: "3px"
    },

    deadlineTime: {
        color: "#9ca3af",
        fontSize: "11px"
    },

    status: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "800",
        whiteSpace: "nowrap"
    },

    statusDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: "currentColor"
    },

    viewButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 12px",
        border: "1px solid #bfdbfe",
        borderRadius: "6px",
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700",
        whiteSpace: "nowrap"
    },

    // ==========================================
    // EMPTY STATE
    // ==========================================

    empty: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "60px 25px",
        textAlign: "center",
        boxShadow:
            "0 2px 8px rgba(0,0,0,0.03)"
    },

    emptyIcon: {
        width: "62px",
        height: "62px",
        borderRadius: "50%",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        fontSize: "27px"
    },

    emptyTitle: {
        margin: 0,
        color: "#111827",
        fontSize: "19px"
    },

    emptyText: {
        maxWidth: "460px",
        margin: "8px auto 20px",
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: "1.6"
    },

    emptyButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "7px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px"
    },

    // ==========================================
    // LOADING
    // ==========================================

    center: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fb",
        fontFamily:
            "Inter, Arial, Helvetica, sans-serif"
    },

    loadingBox: {
        textAlign: "center",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "40px",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.05)"
    },

    spinner: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "4px solid #dbeafe",
        borderTop: "4px solid #2563eb",
        margin: "0 auto 18px"
    },

    loadingTitle: {
        margin: 0,
        color: "#111827",
        fontSize: "18px"
    },

    loadingText: {
        margin: "7px 0 0",
        color: "#6b7280",
        fontSize: "13px"
    },

    // ==========================================
    // FOOTER
    // ==========================================

    footer: {
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        color: "#9ca3af",
        fontSize: "12px"
    }
};

export default BuyerDashboard;