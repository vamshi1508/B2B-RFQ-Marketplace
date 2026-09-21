import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function SupplierDashboard() {
    const navigate = useNavigate();

    const [rfqs, setRfqs] = useState([]);
    const [quotations, setQuotations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const user = useMemo(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user") || "{}"
            );
        } catch {
            return {};
        }
    }, []);

    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    const fetchDashboard = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [rfqResponse, quotationResponse] =
                await Promise.all([
                    API.get("/rfqs"),
                    API.get("/quotations/my"),
                ]);

            const fetchedRFQs = Array.isArray(
                rfqResponse.data?.rfqs
            )
                ? rfqResponse.data.rfqs
                : [];

            const fetchedQuotations = Array.isArray(
                quotationResponse.data?.quotations
            )
                ? quotationResponse.data.quotations
                : [];

            setRfqs(fetchedRFQs);
            setQuotations(fetchedQuotations);

        } catch (err) {
            console.error(
                "Supplier dashboard error:",
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
                "Failed to load supplier dashboard"
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        fetchDashboard();
    }, []);

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ==========================================
    // FIND MY QUOTATION FOR AN RFQ
    // ==========================================

    const getQuotationForRFQ = (rfqId) => {
        return quotations.find(
            (quotation) =>
                Number(quotation.rfq_id) ===
                Number(rfqId)
        );
    };

    // ==========================================
    // CHECK VALID DEADLINE
    // ==========================================

    const getDeadline = (deadline) => {
        const date = new Date(deadline);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    };

    // ==========================================
    // CHECK WHETHER RFQ IS OPEN
    // ==========================================

    const isRFQOpen = (rfq) => {
        if (!rfq) {
            return false;
        }

        if (rfq.status !== "OPEN") {
            return false;
        }

        const deadline = getDeadline(rfq.deadline);

        if (!deadline) {
            return false;
        }

        return deadline > new Date();
    };

    // ==========================================
    // AVAILABLE RFQs
    // ==========================================

    const availableRFQs = useMemo(() => {
        return rfqs.filter((rfq) =>
            isRFQOpen(rfq)
        );
    }, [rfqs]);

    // ==========================================
    // GET DISPLAY STATUS
    // ==========================================

    const getDisplayStatus = (rfq, quotation) => {
        if (!rfq) {
            return "UNKNOWN";
        }

        /*
         * If supplier already submitted a quotation,
         * quotation status should be displayed first.
         */
        if (quotation) {
            return quotation.status;
        }

        /*
         * RFQ was awarded.
         */
        if (rfq.status === "AWARDED") {
            return "AWARDED";
        }

        /*
         * Check deadline.
         */
        const deadline = getDeadline(
            rfq.deadline
        );

        if (
            !deadline ||
            deadline <= new Date()
        ) {
            return "EXPIRED";
        }

        /*
         * Other RFQ statuses.
         */
        if (rfq.status !== "OPEN") {
            return rfq.status;
        }

        return "OPEN";
    };

    // ==========================================
    // QUOTATION STATISTICS
    // ==========================================

    const acceptedCount = quotations.filter(
        (quotation) =>
            quotation.status === "ACCEPTED"
    ).length;

    const rejectedCount = quotations.filter(
        (quotation) =>
            quotation.status === "REJECTED"
    ).length;

    const pendingCount = quotations.filter(
        (quotation) =>
            quotation.status === "PENDING"
    ).length;

    // ==========================================
    // TOTAL RFQs
    // ==========================================

    const expiredRFQCount = rfqs.filter((rfq) => {
        if (rfq.status !== "OPEN") {
            return false;
        }

        const deadline = getDeadline(
            rfq.deadline
        );

        return (
            !deadline ||
            deadline <= new Date()
        );
    }).length;

    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.loadingCard}>
                    <div style={styles.spinner}></div>

                    <h2 style={styles.loadingTitle}>
                        Loading Supplier Dashboard
                    </h2>

                    <p style={styles.loadingText}>
                        Fetching available RFQs and your quotations...
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

            {/* ======================================
                HEADER
            ====================================== */}

            <header style={styles.header}>

                <div style={styles.headerInner}>

                    {/* BRAND */}

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

                    {/* USER AREA */}

                    <div style={styles.headerRight}>

                        <div style={styles.userInfo}>

                            <div style={styles.userAvatar}>
                                {(
                                    user.name ||
                                    user.email ||
                                    "S"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div style={styles.userDetails}>

                                <span
                                    style={
                                        styles.userRole
                                    }
                                >
                                    SUPPLIER
                                </span>

                                <strong
                                    style={
                                        styles.userName
                                    }
                                >
                                    {user.name ||
                                        user.email ||
                                        "Supplier"}
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

                </div>

            </header>


            {/* ======================================
                MAIN
            ====================================== */}

            <main style={styles.container}>

                {/* BREADCRUMB */}

                <div style={styles.breadcrumb}>
                    Supplier Dashboard
                </div>


                {/* PAGE TITLE */}

                <div style={styles.titleSection}>

                    <div>

                        <h1 style={styles.title}>
                            Supplier Dashboard
                        </h1>

                        <p style={styles.subtitle}>
                            Find buyer requirements, submit quotations,
                            and track your quotation status.
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            fetchDashboard(true)
                        }
                        disabled={refreshing}
                        style={{
                            ...styles.refreshButton,
                            ...(refreshing
                                ? styles.disabledButton
                                : {}),
                        }}
                    >
                        {refreshing ? (
                            <>
                                <span
                                    style={
                                        styles.smallSpinner
                                    }
                                ></span>
                                Refreshing...
                            </>
                        ) : (
                            <>↻ Refresh</>
                        )}
                    </button>

                </div>


                {/* ======================================
                    ERROR
                ====================================== */}

                {error && (

                    <div style={styles.errorBox}>

                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <div style={styles.errorContent}>

                            <strong>
                                Something went wrong
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                fetchDashboard(true)
                            }
                            style={styles.errorRetry}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* ======================================
                    STATISTICS
                ====================================== */}

                <div style={styles.statsGrid}>

                    {/* AVAILABLE RFQs */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.blueIcon,
                            }}
                        >
                            📋
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                Available RFQs
                            </span>

                            <strong
                                style={styles.statNumber}
                            >
                                {availableRFQs.length}
                            </strong>

                            <span style={styles.statHint}>
                                Open for quotations
                            </span>

                        </div>

                    </div>


                    {/* MY QUOTATIONS */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.purpleIcon,
                            }}
                        >
                            📄
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                My Quotations
                            </span>

                            <strong
                                style={styles.statNumber}
                            >
                                {quotations.length}
                            </strong>

                            <span style={styles.statHint}>
                                Submitted by you
                            </span>

                        </div>

                    </div>


                    {/* ACCEPTED */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.greenIcon,
                            }}
                        >
                            ✓
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                Accepted
                            </span>

                            <strong
                                style={styles.statNumber}
                            >
                                {acceptedCount}
                            </strong>

                            <span style={styles.statHint}>
                                Won quotations
                            </span>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div style={styles.statCard}>

                        <div
                            style={{
                                ...styles.statIcon,
                                ...styles.orangeIcon,
                            }}
                        >
                            ⏳
                        </div>

                        <div style={styles.statContent}>

                            <span style={styles.statLabel}>
                                Pending
                            </span>

                            <strong
                                style={styles.statNumber}
                            >
                                {pendingCount}
                            </strong>

                            <span style={styles.statHint}>
                                Awaiting buyer decision
                            </span>

                        </div>

                    </div>

                </div>


                {/* ======================================
                    QUICK SUMMARY
                ====================================== */}

                <div style={styles.summaryBar}>

                    <div style={styles.summaryItem}>

                        <span
                            style={
                                styles.summaryDotGreen
                            }
                        ></span>

                        <span>
                            <strong>
                                {availableRFQs.length}
                            </strong>{" "}
                            open RFQs
                        </span>

                    </div>

                    <div style={styles.summaryDivider}></div>

                    <div style={styles.summaryItem}>

                        <span
                            style={
                                styles.summaryDotOrange
                            }
                        ></span>

                        <span>
                            <strong>
                                {pendingCount}
                            </strong>{" "}
                            pending quotations
                        </span>

                    </div>

                    <div style={styles.summaryDivider}></div>

                    <div style={styles.summaryItem}>

                        <span
                            style={
                                styles.summaryDotBlue
                            }
                        ></span>

                        <span>
                            <strong>
                                {rejectedCount}
                            </strong>{" "}
                            rejected quotations
                        </span>

                    </div>

                    <div style={styles.summaryDivider}></div>

                    <div style={styles.summaryItem}>

                        <span
                            style={
                                styles.summaryDotRed
                            }
                        ></span>

                        <span>
                            <strong>
                                {expiredRFQCount}
                            </strong>{" "}
                            expired RFQs
                        </span>

                    </div>

                </div>


                {/* ======================================
                    AVAILABLE RFQs
                ====================================== */}

                <section style={styles.section}>

                    <div style={styles.sectionHeader}>

                        <div>

                            <div
                                style={
                                    styles.sectionTitleRow
                                }
                            >

                                <h2
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Available RFQs
                                </h2>

                                <span
                                    style={
                                        styles.countBadge
                                    }
                                >
                                    {availableRFQs.length}
                                </span>

                            </div>

                            <p
                                style={
                                    styles.sectionSubtitle
                                }
                            >
                                Review buyer requirements and
                                submit competitive quotations.
                            </p>

                        </div>

                    </div>


                    {/* NO AVAILABLE RFQs */}

                    {availableRFQs.length === 0 ? (

                        <div style={styles.emptyCard}>

                            <div
                                style={
                                    styles.emptyIconWrapper
                                }
                            >
                                📋
                            </div>

                            <h3
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No RFQs available
                            </h3>

                            <p
                                style={
                                    styles.emptyText
                                }
                            >
                                There are currently no open RFQs
                                that require supplier quotations.
                                Check again later.
                            </p>

                            <button
                                onClick={() =>
                                    fetchDashboard(true)
                                }
                                disabled={refreshing}
                                style={
                                    styles.secondaryButton
                                }
                            >
                                ↻ Check Again
                            </button>

                        </div>

                    ) : (

                        <div style={styles.grid}>

                            {availableRFQs.map((rfq) => {

                                const quotation =
                                    getQuotationForRFQ(
                                        rfq.id
                                    );

                                const status =
                                    getDisplayStatus(
                                        rfq,
                                        quotation
                                    );

                                const deadline =
                                    getDeadline(
                                        rfq.deadline
                                    );

                                const hasQuotation =
                                    Boolean(quotation);

                                return (

                                    <div
                                        key={rfq.id}
                                        style={{
                                            ...styles.card,
                                            ...(hasQuotation
                                                ? styles.submittedCard
                                                : {}),
                                        }}
                                    >

                                        {/* CARD TOP */}

                                        <div
                                            style={
                                                styles.cardHeader
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.productWrapper
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

                                                    <h3
                                                        style={
                                                            styles.productName
                                                        }
                                                    >
                                                        {
                                                            rfq.product_name ||
                                                            "Unnamed Product"
                                                        }
                                                    </h3>

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

                                            <span
                                                style={{
                                                    ...styles.status,
                                                    ...getStatusStyle(
                                                        status
                                                    ),
                                                }}
                                            >
                                                {status}
                                            </span>

                                        </div>


                                        {/* DESCRIPTION */}

                                        <div
                                            style={
                                                styles.descriptionWrapper
                                            }
                                        >

                                            <p
                                                style={
                                                    styles.description
                                                }
                                            >
                                                {rfq.description ||
                                                    "No description provided."}
                                            </p>

                                        </div>


                                        {/* DETAILS */}

                                        <div
                                            style={
                                                styles.details
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.detail
                                                }
                                            >

                                                <span
                                                    style={
                                                        styles.detailLabel
                                                    }
                                                >
                                                    QUANTITY
                                                </span>

                                                <strong
                                                    style={
                                                        styles.detailValue
                                                    }
                                                >
                                                    {rfq.quantity}
                                                </strong>

                                            </div>


                                            <div
                                                style={
                                                    styles.detail
                                                }
                                            >

                                                <span
                                                    style={
                                                        styles.detailLabel
                                                    }
                                                >
                                                    DELIVERY LOCATION
                                                </span>

                                                <strong
                                                    style={{
                                                        ...styles.detailValue,
                                                        ...styles.locationValue,
                                                    }}
                                                >
                                                    📍{" "}
                                                    {rfq.delivery_location ||
                                                        "Not specified"}
                                                </strong>

                                            </div>


                                            <div
                                                style={
                                                    styles.detail
                                                }
                                            >

                                                <span
                                                    style={
                                                        styles.detailLabel
                                                    }
                                                >
                                                    DEADLINE
                                                </span>

                                                <strong
                                                    style={
                                                        styles.detailValue
                                                    }
                                                >
                                                    {deadline
                                                        ? deadline.toLocaleString()
                                                        : "Invalid date"}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* EXISTING QUOTATION */}

                                        {quotation && (

                                            <div
                                                style={
                                                    styles.quotationBox
                                                }
                                            >

                                                <div
                                                    style={
                                                        styles.quotationHeader
                                                    }
                                                >

                                                    <span
                                                        style={
                                                            styles.quotationLabel
                                                        }
                                                    >
                                                        YOUR QUOTATION
                                                    </span>

                                                    <span
                                                        style={{
                                                            ...styles.miniStatus,
                                                            ...getStatusStyle(
                                                                quotation.status
                                                            ),
                                                        }}
                                                    >
                                                        {
                                                            quotation.status
                                                        }
                                                    </span>

                                                </div>


                                                <div
                                                    style={
                                                        styles.quotationMain
                                                    }
                                                >

                                                    <div>

                                                        <span
                                                            style={
                                                                styles.priceLabel
                                                            }
                                                        >
                                                            Quoted Price
                                                        </span>

                                                        <strong
                                                            style={
                                                                styles.price
                                                            }
                                                        >
                                                            ₹
                                                            {Number(
                                                                quotation.quoted_price
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </strong>

                                                    </div>


                                                    <div
                                                        style={
                                                            styles.deliveryInfo
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.priceLabel
                                                            }
                                                        >
                                                            Delivery
                                                        </span>

                                                        <strong>
                                                            {
                                                                quotation.estimated_delivery_time ||
                                                                "Not specified"
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        )}


                                        {/* CARD ACTION */}

                                        <div
                                            style={
                                                styles.actions
                                            }
                                        >

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/supplier/rfq/${rfq.id}`
                                                    )
                                                }
                                                style={
                                                    styles.primaryButton
                                                }
                                            >
                                                {hasQuotation
                                                    ? "View RFQ & Quotation →"
                                                    : "View RFQ & Submit Quotation →"}
                                            </button>

                                        </div>

                                    </div>

                                );
                            })}

                        </div>

                    )}

                </section>


                {/* ======================================
                    MY QUOTATIONS
                ====================================== */}

                <section
                    style={
                        styles.quotationsSection
                    }
                >

                    <div style={styles.sectionHeader}>

                        <div>

                            <div
                                style={
                                    styles.sectionTitleRow
                                }
                            >

                                <h2
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    My Quotations
                                </h2>

                                <span
                                    style={
                                        styles.countBadge
                                    }
                                >
                                    {quotations.length}
                                </span>

                            </div>

                            <p
                                style={
                                    styles.sectionSubtitle
                                }
                            >
                                Track all quotations submitted by you.
                            </p>

                        </div>

                    </div>


                    {/* NO QUOTATIONS */}

                    {quotations.length === 0 ? (

                        <div style={styles.emptyCard}>

                            <div
                                style={
                                    styles.emptyIconWrapper
                                }
                            >
                                📄
                            </div>

                            <h3
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No quotations yet
                            </h3>

                            <p
                                style={
                                    styles.emptyText
                                }
                            >
                                You have not submitted any quotations.
                                Browse available RFQs above to get started.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={
                                styles.tableWrapper
                            }
                        >

                            <div
                                style={
                                    styles.tableScroll
                                }
                            >

                                <table
                                    style={
                                        styles.table
                                    }
                                >

                                    <thead>

                                        <tr>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Product
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                RFQ
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Quoted Price
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Delivery
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Status
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Submitted
                                            </th>

                                            <th
                                                style={
                                                    styles.th
                                                }
                                            >
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {quotations.map(
                                            (quotation) => {

                                                const matchingRFQ =
                                                    rfqs.find(
                                                        (rfq) =>
                                                            Number(
                                                                rfq.id
                                                            ) ===
                                                            Number(
                                                                quotation.rfq_id
                                                            )
                                                    );

                                                const productName =
                                                    matchingRFQ?.product_name ||
                                                    quotation.product_name ||
                                                    "RFQ";

                                                return (

                                                    <tr
                                                        key={
                                                            quotation.id
                                                        }
                                                        style={
                                                            styles.tableRow
                                                        }
                                                    >

                                                        {/* PRODUCT */}

                                                        <td
                                                            style={
                                                                styles.td
                                                            }
                                                        >

                                                            <div
                                                                style={
                                                                    styles.tableProduct
                                                                }
                                                            >

                                                                <div
                                                                    style={
                                                                        styles.tableProductIcon
                                                                    }
                                                                >
                                                                    📦
                                                                </div>

                                                                <div>

                                                                    <strong
                                                                        style={
                                                                            styles.tableProductName
                                                                        }
                                                                    >
                                                                        {
                                                                            productName
                                                                        }
                                                                    </strong>

                                                                    <span
                                                                        style={
                                                                            styles.tableProductDescription
                                                                        }
                                                                    >
                                                                        {matchingRFQ?.delivery_location ||
                                                                            "Supplier quotation"}
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* RFQ ID */}

                                                        <td
                                                            style={
                                                                styles.td
                                                            }
                                                        >

                                                            <span
                                                                style={
                                                                    styles.rfqNumber
                                                                }
                                                            >
                                                                #
                                                                {
                                                                    quotation.rfq_id
                                                                }
                                                            </span>

                                                        </td>


                                                        {/* PRICE */}

                                                        <td
                                                            style={
                                                                styles.td
                                                            }
                                                        >

                                                            <strong
                                                                style={
                                                                    styles.tablePrice
                                                                }
                                                            >
                                                                ₹
                                                                {Number(
                                                                    quotation.quoted_price
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </strong>

                                                        </td>


                                                        {/* DELIVERY */}

                                                        <td
                                                            style={
                                                                styles.td
                                                            }
                                                        >
                                                            {
                                                                quotation.estimated_delivery_time ||
                                                                "—"
                                                            }
                                                        </td>


                                                        {/* STATUS */}

                                                        <td
                                                            style={
                                                                styles.td
                                                            }
                                                        >

                                                            <span
                                                                style={{
                                                                    ...styles.tableStatus,
                                                                    ...getStatusStyle(
                                                                        quotation.status
                                                                    ),
                                                                }}
                                                            >
                                                                {
                                                                    quotation.status
                                                                }
                                                            </span>

                                                        </td>


                                                        {/* DATE */}

                                                        <td
                                                            style={
                                                                styles.td
                                                            }
                                                        >

                                                            <span
                                                                style={
                                                                    styles.dateText
                                                                }
                                                            >
                                                                {quotation.created_at
                                                                    ? new Date(
                                                                        quotation.created_at
                                                                    ).toLocaleString()
                                                                    : "—"}
                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td
                                                            style={
                                                                styles.td
                                                            }
                                                        >

                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/supplier/rfq/${quotation.rfq_id}`
                                                                    )
                                                                }
                                                                style={
                                                                    styles.viewButton
                                                                }
                                                            >
                                                                View
                                                            </button>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

                </section>


                {/* ======================================
                    FOOTER
                ====================================== */}

                <footer style={styles.footer}>

                    <span>
                        B2B RFQ Marketplace
                    </span>

                    <span>
                        Supplier Portal
                    </span>

                </footer>

            </main>

        </div>
    );
}


// =====================================================
// STATUS STYLE
// =====================================================

function getStatusStyle(status) {

    switch (status) {

        case "ACCEPTED":
            return {
                backgroundColor: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
            };

        case "REJECTED":
            return {
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
            };

        case "EXPIRED":
            return {
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
            };

        case "AWARDED":
            return {
                backgroundColor: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
            };

        case "OPEN":
            return {
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
            };

        case "PENDING":
        default:
            return {
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
            };
    }
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
        color: "#0f172a",
    },

    // ==========================================
    // HEADER
    // ==========================================

    header: {
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 20,
    },

    headerInner: {
        maxWidth: "1240px",
        minHeight: "70px",
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
    },

    brand: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
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
        cursor: "pointer",
        flexShrink: 0,
    },

    brandName: {
        fontSize: "15px",
        fontWeight: "750",
        color: "#111827",
        lineHeight: "1.2",
    },

    brandSubtitle: {
        fontSize: "10px",
        color: "#64748b",
        marginTop: "3px",
    },

    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
    },

    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
    },

    userAvatar: {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "800",
    },

    userDetails: {
        display: "flex",
        flexDirection: "column",
        gap: "1px",
    },

    userRole: {
        fontSize: "8px",
        fontWeight: "800",
        color: "#94a3b8",
        letterSpacing: "0.6px",
    },

    userName: {
        fontSize: "12px",
        color: "#334155",
        maxWidth: "180px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    logoutButton: {
        padding: "8px 13px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#475569",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "700",
    },

    // ==========================================
    // MAIN
    // ==========================================

    container: {
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "30px 24px 50px",
    },

    breadcrumb: {
        fontSize: "10px",
        color: "#94a3b8",
        fontWeight: "600",
        marginBottom: "7px",
    },

    titleSection: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "25px",
    },

    title: {
        margin: 0,
        fontSize: "29px",
        lineHeight: "1.2",
        letterSpacing: "-0.5px",
        fontWeight: "800",
        color: "#0f172a",
    },

    subtitle: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.5",
    },

    refreshButton: {
        minWidth: "95px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "9px 13px",
        border: "1px solid #dbe1ea",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#475569",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    },

    disabledButton: {
        opacity: 0.65,
        cursor: "not-allowed",
    },

    smallSpinner: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        border: "2px solid #cbd5e1",
        borderTop: "2px solid #2563eb",
        display: "inline-block",
        animation: "spin 1s linear infinite",
    },

    // ==========================================
    // ERROR
    // ==========================================

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "12px 14px",
        marginBottom: "22px",
        borderRadius: "8px",
        border: "1px solid #fecaca",
        backgroundColor: "#fef2f2",
        color: "#991b1b",
    },

    errorIcon: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: "#dc2626",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "800",
        flexShrink: 0,
    },

    errorContent: {
        flex: 1,
    },

    errorContent: {
        flex: 1,
    },

    errorRetry: {
        padding: "7px 11px",
        border: "1px solid #fecaca",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        color: "#991b1b",
        fontSize: "10px",
        fontWeight: "700",
        cursor: "pointer",
    },

    // ==========================================
    // STATS
    // ==========================================

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "14px",
        marginBottom: "18px",
    },

    statCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "17px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow:
            "0 2px 7px rgba(15,23,42,0.025)",
    },

    statIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        flexShrink: 0,
    },

    blueIcon: {
        backgroundColor: "#eff6ff",
    },

    purpleIcon: {
        backgroundColor: "#f5f3ff",
    },

    greenIcon: {
        backgroundColor: "#f0fdf4",
    },

    orangeIcon: {
        backgroundColor: "#fff7ed",
    },

    statContent: {
        display: "flex",
        flexDirection: "column",
    },

    statLabel: {
        fontSize: "10px",
        color: "#64748b",
        fontWeight: "600",
    },

    statNumber: {
        marginTop: "2px",
        fontSize: "24px",
        lineHeight: "1.1",
        color: "#111827",
        fontWeight: "800",
    },

    statHint: {
        marginTop: "3px",
        fontSize: "9px",
        color: "#94a3b8",
    },

    // ==========================================
    // SUMMARY BAR
    // ==========================================

    summaryBar: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "9px",
        padding: "12px 15px",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "13px",
        marginBottom: "32px",
        color: "#64748b",
        fontSize: "10px",
    },

    summaryItem: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },

    summaryDivider: {
        width: "1px",
        height: "14px",
        backgroundColor: "#e5e7eb",
    },

    summaryDotGreen: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#22c55e",
    },

    summaryDotOrange: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#f59e0b",
    },

    summaryDotBlue: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#3b82f6",
    },

    summaryDotRed: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#ef4444",
    },

    // ==========================================
    // SECTIONS
    // ==========================================

    section: {
        marginBottom: "42px",
    },

    quotationsSection: {
        marginTop: "5px",
        marginBottom: "35px",
    },

    sectionHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "15px",
    },

    sectionTitleRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "19px",
        fontWeight: "800",
        color: "#111827",
    },

    countBadge: {
        minWidth: "21px",
        height: "21px",
        padding: "0 6px",
        boxSizing: "border-box",
        borderRadius: "20px",
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "9px",
        fontWeight: "800",
    },

    sectionSubtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "11px",
    },

    // ==========================================
    // RFQ GRID
    // ==========================================

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "16px",
    },

    // ==========================================
    // RFQ CARD
    // ==========================================

    card: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "11px",
        padding: "19px",
        boxShadow:
            "0 2px 8px rgba(15,23,42,0.035)",
        transition: "box-shadow 0.2s ease",
    },

    submittedCard: {
        borderColor: "#bfdbfe",
    },

    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
    },

    productWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        minWidth: 0,
    },

    productIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "8px",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px",
        flexShrink: 0,
    },

    productName: {
        margin: 0,
        fontSize: "15px",
        lineHeight: "1.3",
        color: "#111827",
        fontWeight: "750",
        wordBreak: "break-word",
    },

    rfqId: {
        display: "block",
        marginTop: "3px",
        color: "#94a3b8",
        fontSize: "9px",
        fontWeight: "600",
    },

    status: {
        padding: "5px 9px",
        borderRadius: "20px",
        fontSize: "8px",
        lineHeight: "1",
        fontWeight: "800",
        whiteSpace: "nowrap",
        flexShrink: 0,
    },

    // ==========================================
    // DESCRIPTION
    // ==========================================

    descriptionWrapper: {
        marginTop: "15px",
    },

    description: {
        margin: 0,
        color: "#64748b",
        fontSize: "11px",
        lineHeight: "1.55",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },

    // ==========================================
    // DETAILS
    // ==========================================

    details: {
        display: "grid",
        gridTemplateColumns:
            "0.7fr 1.2fr 1fr",
        gap: "10px",
        marginTop: "17px",
        paddingTop: "15px",
        borderTop: "1px solid #eef2f7",
    },

    detail: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        minWidth: 0,
    },

    detailLabel: {
        color: "#94a3b8",
        fontSize: "8px",
        fontWeight: "800",
        letterSpacing: "0.5px",
    },

    detailValue: {
        color: "#334155",
        fontSize: "10px",
        fontWeight: "700",
        lineHeight: "1.35",
        wordBreak: "break-word",
    },

    locationValue: {
        color: "#475569",
    },

    // ==========================================
    // QUOTATION BOX
    // ==========================================

    quotationBox: {
        marginTop: "15px",
        padding: "12px",
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
    },

    quotationHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
    },

    quotationLabel: {
        fontSize: "8px",
        color: "#64748b",
        fontWeight: "800",
        letterSpacing: "0.5px",
    },

    miniStatus: {
        padding: "4px 7px",
        borderRadius: "20px",
        fontSize: "7px",
        fontWeight: "800",
    },

    quotationMain: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "15px",
        marginTop: "9px",
    },

    priceLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "8px",
        marginBottom: "3px",
    },

    price: {
        color: "#111827",
        fontSize: "18px",
        fontWeight: "800",
    },

    deliveryInfo: {
        textAlign: "right",
        color: "#334155",
        fontSize: "10px",
    },

    // ==========================================
    // ACTIONS
    // ==========================================

    actions: {
        marginTop: "15px",
    },

    primaryButton: {
        width: "100%",
        border: "none",
        borderRadius: "7px",
        padding: "10px 13px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: "750",
        cursor: "pointer",
    },

    secondaryButton: {
        border: "1px solid #dbe1ea",
        borderRadius: "7px",
        padding: "9px 13px",
        backgroundColor: "#ffffff",
        color: "#475569",
        fontSize: "10px",
        fontWeight: "700",
        cursor: "pointer",
    },

    // ==========================================
    // EMPTY
    // ==========================================

    emptyCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "11px",
        padding: "48px 25px",
        textAlign: "center",
    },

    emptyIconWrapper: {
        width: "52px",
        height: "52px",
        margin: "0 auto 12px",
        borderRadius: "50%",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "23px",
    },

    emptyTitle: {
        margin: 0,
        color: "#334155",
        fontSize: "16px",
        fontWeight: "750",
    },

    emptyText: {
        maxWidth: "430px",
        margin: "7px auto 17px",
        color: "#64748b",
        fontSize: "11px",
        lineHeight: "1.55",
    },

    // ==========================================
    // TABLE
    // ==========================================

    tableWrapper: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        overflow: "hidden",
    },

    tableScroll: {
        width: "100%",
        overflowX: "auto",
    },

    table: {
        width: "100%",
        minWidth: "900px",
        borderCollapse: "collapse",
    },

    th: {
        padding: "12px 14px",
        textAlign: "left",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e5e7eb",
        color: "#64748b",
        fontSize: "8px",
        fontWeight: "800",
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
    },

    tableRow: {
        backgroundColor: "#ffffff",
    },

    td: {
        padding: "13px 14px",
        borderBottom: "1px solid #eef2f7",
        color: "#475569",
        fontSize: "10px",
        verticalAlign: "middle",
    },

    tableProduct: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    tableProductIcon: {
        width: "29px",
        height: "29px",
        borderRadius: "7px",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        flexShrink: 0,
    },

    tableProductName: {
        display: "block",
        color: "#334155",
        fontSize: "10px",
        fontWeight: "700",
    },

    tableProductDescription: {
        display: "block",
        marginTop: "2px",
        color: "#94a3b8",
        fontSize: "8px",
        maxWidth: "180px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    rfqNumber: {
        color: "#2563eb",
        fontWeight: "700",
        fontSize: "10px",
    },

    tablePrice: {
        color: "#111827",
        fontSize: "11px",
        fontWeight: "800",
    },

    tableStatus: {
        display: "inline-block",
        padding: "5px 8px",
        borderRadius: "20px",
        fontSize: "7px",
        fontWeight: "800",
        whiteSpace: "nowrap",
    },

    dateText: {
        color: "#64748b",
        fontSize: "9px",
        whiteSpace: "nowrap",
    },

    viewButton: {
        padding: "6px 10px",
        border: "1px solid #dbe1ea",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        color: "#2563eb",
        fontSize: "9px",
        fontWeight: "700",
        cursor: "pointer",
    },

    // ==========================================
    // FOOTER
    // ==========================================

    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid #e5e7eb",
        paddingTop: "20px",
        marginTop: "20px",
        color: "#94a3b8",
        fontSize: "9px",
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
        margin: "0 auto 16px",
        animation: "spin 1s linear infinite",
    },

    loadingTitle: {
        margin: 0,
        color: "#111827",
        fontSize: "18px",
        fontWeight: "750",
    },

    loadingText: {
        marginTop: "7px",
        color: "#64748b",
        fontSize: "11px",
    },
};

export default SupplierDashboard;