import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CreateRFQ() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        product_name: "",
        description: "",
        quantity: "",
        delivery_location: "",
        deadline: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Frontend validation
        if (!formData.product_name.trim()) {
            setError("Please enter a product name.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter a product description.");
            return;
        }

        if (!formData.quantity || Number(formData.quantity) <= 0) {
            setError("Quantity must be greater than 0.");
            return;
        }

        if (!formData.delivery_location.trim()) {
            setError("Please enter a delivery location.");
            return;
        }

        if (!formData.deadline) {
            setError("Please select a quotation deadline.");
            return;
        }

        const selectedDeadline = new Date(formData.deadline);

        if (selectedDeadline <= new Date()) {
            setError("Quotation deadline must be in the future.");
            return;
        }

        setLoading(true);

        try {
            await API.post("/rfqs", {
                product_name: formData.product_name.trim(),
                description: formData.description.trim(),
                quantity: Number(formData.quantity),
                delivery_location:
                    formData.delivery_location.trim(),

                // Keep the existing backend-compatible format
                deadline:
                    formData.deadline.replace("T", " ") + ":00",
            });

            setSuccess("RFQ created successfully!");

            setTimeout(() => {
                navigate("/buyer");
            }, 1000);

        } catch (err) {
            console.error("Create RFQ error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to create RFQ. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/buyer");
    };

    return (
        <div style={styles.page}>

            {/* =========================================
                HEADER
            ========================================= */}

            <header style={styles.header}>

                <div
                    style={styles.brand}
                    onClick={() => navigate("/buyer")}
                >
                    <div style={styles.logo}>
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
                    type="button"
                    onClick={handleCancel}
                    style={styles.backButton}
                >
                    ← Back to Dashboard
                </button>

            </header>


            {/* =========================================
                MAIN
            ========================================= */}

            <main style={styles.main}>

                <div style={styles.pageHeading}>

                    <div style={styles.breadcrumb}>
                        Buyer Dashboard / Create RFQ
                    </div>

                    <h1 style={styles.title}>
                        Create Request for Quotation
                    </h1>

                    <p style={styles.subtitle}>
                        Tell suppliers exactly what you need and
                        invite them to submit competitive quotations.
                    </p>

                </div>


                {/* =========================================
                    FORM CARD
                ========================================= */}

                <div style={styles.formCard}>

                    <div style={styles.formHeader}>

                        <div style={styles.formIcon}>
                            📋
                        </div>

                        <div>
                            <h2 style={styles.formTitle}>
                                RFQ Details
                            </h2>

                            <p style={styles.formDescription}>
                                Provide the product and delivery
                                requirements below.
                            </p>
                        </div>

                    </div>


                    {/* ALERTS */}

                    {error && (
                        <div style={styles.errorBox}>
                            <span style={styles.alertIcon}>
                                ⚠
                            </span>

                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div style={styles.successBox}>
                            <span style={styles.alertIcon}>
                                ✓
                            </span>

                            <span>{success}</span>
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* =================================
                            PRODUCT NAME
                        ================================= */}

                        <div style={styles.field}>

                            <label style={styles.label}>
                                Product Name
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                placeholder="e.g. Business Laptops"
                                style={styles.input}
                                disabled={loading}
                                required
                            />

                            <span style={styles.helpText}>
                                Enter the name of the product you
                                want suppliers to quote.
                            </span>

                        </div>


                        {/* =================================
                            DESCRIPTION
                        ================================= */}

                        <div style={styles.field}>

                            <label style={styles.label}>
                                Product Description
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the specifications, features, quality requirements, or other important details..."
                                rows={5}
                                style={{
                                    ...styles.input,
                                    ...styles.textarea,
                                }}
                                disabled={loading}
                                required
                            />

                            <span style={styles.helpText}>
                                Include specifications that suppliers
                                should consider when preparing quotations.
                            </span>

                        </div>


                        {/* =================================
                            QUANTITY + LOCATION
                        ================================= */}

                        <div style={styles.twoColumn}>

                            <div style={styles.field}>

                                <label style={styles.label}>
                                    Quantity
                                    <span style={styles.required}>
                                        *
                                    </span>
                                </label>

                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="e.g. 20"
                                    min="1"
                                    step="1"
                                    style={styles.input}
                                    disabled={loading}
                                    required
                                />

                                <span style={styles.helpText}>
                                    Number of units required.
                                </span>

                            </div>


                            <div style={styles.field}>

                                <label style={styles.label}>
                                    Delivery Location
                                    <span style={styles.required}>
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="delivery_location"
                                    value={formData.delivery_location}
                                    onChange={handleChange}
                                    placeholder="e.g. Hyderabad"
                                    style={styles.input}
                                    disabled={loading}
                                    required
                                />

                                <span style={styles.helpText}>
                                    Where the products should be delivered.
                                </span>

                            </div>

                        </div>


                        {/* =================================
                            DEADLINE
                        ================================= */}

                        <div style={styles.field}>

                            <label style={styles.label}>
                                Quotation Deadline
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <input
                                type="datetime-local"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                min={new Date(
                                    Date.now() -
                                    new Date().getTimezoneOffset() * 60000
                                )
                                    .toISOString()
                                    .slice(0, 16)}
                                style={styles.input}
                                disabled={loading}
                                required
                            />

                            <span style={styles.helpText}>
                                Suppliers must submit their quotations
                                before this date and time.
                            </span>

                        </div>


                        {/* =================================
                            FORM FOOTER
                        ================================= */}

                        <div style={styles.formFooter}>

                            <div style={styles.requiredNote}>
                                <span style={styles.required}>
                                    *
                                </span>{" "}
                                Required fields
                            </div>


                            <div style={styles.buttons}>

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    style={styles.cancelButton}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    style={{
                                        ...styles.submitButton,
                                        ...(loading
                                            ? styles.submitDisabled
                                            : {}),
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                style={styles.buttonSpinner}
                                            ></span>

                                            Creating RFQ...
                                        </>
                                    ) : (
                                        <>
                                            Create RFQ
                                            <span>
                                                →
                                            </span>
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

    page: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        color: "#0f172a",
    },


    /* HEADER */

    header: {
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "14px 28px",
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
        gap: "12px",
        cursor: "pointer",
    },

    logo: {
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "800",
    },

    brandName: {
        fontSize: "16px",
        fontWeight: "750",
        color: "#111827",
    },

    brandSubtitle: {
        fontSize: "11px",
        color: "#64748b",
        marginTop: "2px",
    },

    backButton: {
        border: "1px solid #dbe1ea",
        backgroundColor: "#ffffff",
        color: "#475569",
        borderRadius: "7px",
        padding: "9px 14px",
        fontSize: "12px",
        fontWeight: "650",
        cursor: "pointer",
    },


    /* MAIN */

    main: {
        maxWidth: "900px",
        margin: "0 auto",
        padding: "38px 24px 60px",
    },

    pageHeading: {
        marginBottom: "25px",
    },

    breadcrumb: {
        color: "#64748b",
        fontSize: "11px",
        fontWeight: "600",
        marginBottom: "8px",
    },

    title: {
        margin: 0,
        fontSize: "30px",
        lineHeight: "1.2",
        fontWeight: "800",
        letterSpacing: "-0.5px",
    },

    subtitle: {
        margin: "8px 0 0",
        color: "#64748b",
        fontSize: "14px",
        lineHeight: "1.6",
    },


    /* FORM CARD */

    formCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        boxShadow: "0 3px 12px rgba(15,23,42,0.04)",
        padding: "28px",
    },

    formHeader: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        paddingBottom: "23px",
        marginBottom: "25px",
        borderBottom: "1px solid #eef2f7",
    },

    formIcon: {
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
    },

    formTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "750",
    },

    formDescription: {
        margin: "3px 0 0",
        fontSize: "12px",
        color: "#64748b",
    },


    /* ALERTS */

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "12px 14px",
        marginBottom: "20px",
        borderRadius: "8px",
        border: "1px solid #fecaca",
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        fontSize: "13px",
        fontWeight: "550",
    },

    successBox: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "12px 14px",
        marginBottom: "20px",
        borderRadius: "8px",
        border: "1px solid #bbf7d0",
        backgroundColor: "#f0fdf4",
        color: "#166534",
        fontSize: "13px",
        fontWeight: "600",
    },

    alertIcon: {
        fontWeight: "800",
    },


    /* FIELDS */

    field: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "22px",
    },

    label: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155",
        marginBottom: "7px",
    },

    required: {
        color: "#dc2626",
        marginLeft: "3px",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #d7dee8",
        borderRadius: "8px",
        padding: "11px 12px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontSize: "13px",
        outline: "none",
        transition: "border-color 0.2s ease",
    },

    textarea: {
        resize: "vertical",
        minHeight: "125px",
        lineHeight: "1.5",
        fontFamily: "inherit",
    },

    helpText: {
        marginTop: "5px",
        color: "#94a3b8",
        fontSize: "10px",
        lineHeight: "1.4",
    },


    /* TWO COLUMN */

    twoColumn: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px",
    },


    /* FOOTER */

    formFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        borderTop: "1px solid #eef2f7",
        paddingTop: "22px",
        marginTop: "4px",
    },

    requiredNote: {
        color: "#94a3b8",
        fontSize: "11px",
    },

    buttons: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },

    cancelButton: {
        border: "1px solid #d7dee8",
        backgroundColor: "#ffffff",
        color: "#475569",
        borderRadius: "7px",
        padding: "10px 17px",
        fontSize: "12px",
        fontWeight: "650",
        cursor: "pointer",
    },

    submitButton: {
        border: "none",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        borderRadius: "7px",
        padding: "10px 17px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 3px 8px rgba(37,99,235,0.18)",
    },

    submitDisabled: {
        opacity: 0.7,
        cursor: "not-allowed",
    },

    buttonSpinner: {
        width: "12px",
        height: "12px",
        border: "2px solid rgba(255,255,255,0.45)",
        borderTop: "2px solid #ffffff",
        borderRadius: "50%",
        display: "inline-block",
    },
};


export default CreateRFQ;