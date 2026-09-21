import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "BUYER",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };

    // ==========================================
    // SELECT ROLE
    // ==========================================

    const handleRoleChange = (role) => {
        setFormData((previous) => ({
            ...previous,
            role,
        }));

        setError("");
        setSuccess("");
    };

    // ==========================================
    // VALIDATE FORM
    // ==========================================

    const validateForm = () => {
        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!name) {
            return "Please enter your full name.";
        }

        if (name.length < 2) {
            return "Name must contain at least 2 characters.";
        }

        if (!email) {
            return "Please enter your email address.";
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return "Please enter a valid email address.";
        }

        if (!password) {
            return "Please enter a password.";
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (!confirmPassword) {
            return "Please confirm your password.";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match.";
        }

        if (
            formData.role !== "BUYER" &&
            formData.role !== "SUPPLIER"
        ) {
            return "Please select a valid account type.";
        }

        return "";
    };

    // ==========================================
    // REGISTER
    // ==========================================

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await API.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: formData.role,
            });

            setSuccess(
                response.data?.message ||
                    "Registration successful! Redirecting to login..."
            );

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "BUYER",
            });

            setShowPassword(false);
            setShowConfirmPassword(false);

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            console.error("Registration error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }

            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div style={styles.page}>
            {/* =========================================
                LEFT PANEL
            ========================================= */}

            <section style={styles.leftPanel}>
                <div style={styles.leftContent}>
                    <div style={styles.logo}>RFQ</div>

                    <div style={styles.badge}>
                        B2B PROCUREMENT PLATFORM
                    </div>

                    <h1 style={styles.brandTitle}>
                        Join the B2B RFQ Marketplace
                    </h1>

                    <p style={styles.brandDescription}>
                        Connect buyers and suppliers through a
                        streamlined request-for-quotation
                        platform built for modern procurement.
                    </p>

                    <div style={styles.features}>
                        {/* FEATURE 1 */}

                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>
                                📋
                            </div>

                            <div>
                                <h3 style={styles.featureTitle}>
                                    Create RFQs
                                </h3>

                                <p style={styles.featureText}>
                                    Publish your requirements
                                    and receive competitive
                                    quotations from suppliers.
                                </p>
                            </div>
                        </div>

                        {/* FEATURE 2 */}

                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>
                                💼
                            </div>

                            <div>
                                <h3 style={styles.featureTitle}>
                                    Find Opportunities
                                </h3>

                                <p style={styles.featureText}>
                                    Suppliers can discover
                                    relevant requirements and
                                    submit quotations.
                                </p>
                            </div>
                        </div>

                        {/* FEATURE 3 */}

                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>
                                ✓
                            </div>

                            <div>
                                <h3 style={styles.featureTitle}>
                                    Manage Quotations
                                </h3>

                                <p style={styles.featureText}>
                                    Review offers, compare
                                    suppliers, and manage the
                                    complete RFQ process.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
                RIGHT PANEL
            ========================================= */}

            <section style={styles.rightPanel}>
                <div style={styles.registerCard}>
                    {/* HEADER */}

                    <div style={styles.cardHeader}>
                        <h2 style={styles.registerTitle}>
                            Create your account
                        </h2>

                        <p style={styles.subtitle}>
                            Register to access the RFQ
                            marketplace.
                        </p>
                    </div>

                    {/* FORM */}

                    <form onSubmit={handleRegister} noValidate>
                        {/* NAME */}

                        <div style={styles.inputGroup}>
                            <label
                                htmlFor="name"
                                style={styles.label}
                            >
                                Full Name
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                disabled={loading}
                                style={styles.input}
                            />
                        </div>

                        {/* EMAIL */}

                        <div style={styles.inputGroup}>
                            <label
                                htmlFor="email"
                                style={styles.label}
                            >
                                Email Address
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={loading}
                                style={styles.input}
                            />
                        </div>

                        {/* ROLE */}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Account Type
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <div style={styles.roleContainer}>
                                {/* BUYER */}

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleRoleChange(
                                            "BUYER"
                                        )
                                    }
                                    style={{
                                        ...styles.roleButton,
                                        ...(formData.role ===
                                        "BUYER"
                                            ? styles.roleButtonActive
                                            : {}),
                                    }}
                                >
                                    <span
                                        style={
                                            styles.roleIcon
                                        }
                                    >
                                        🛒
                                    </span>

                                    <span
                                        style={
                                            styles.roleContent
                                        }
                                    >
                                        <strong
                                            style={
                                                styles.roleTitle
                                            }
                                        >
                                            Buyer
                                        </strong>

                                        <small
                                            style={
                                                styles.roleDescription
                                            }
                                        >
                                            Create RFQs
                                        </small>
                                    </span>
                                </button>

                                {/* SUPPLIER */}

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleRoleChange(
                                            "SUPPLIER"
                                        )
                                    }
                                    style={{
                                        ...styles.roleButton,
                                        ...(formData.role ===
                                        "SUPPLIER"
                                            ? styles.roleButtonActive
                                            : {}),
                                    }}
                                >
                                    <span
                                        style={
                                            styles.roleIcon
                                        }
                                    >
                                        🏢
                                    </span>

                                    <span
                                        style={
                                            styles.roleContent
                                        }
                                    >
                                        <strong
                                            style={
                                                styles.roleTitle
                                            }
                                        >
                                            Supplier
                                        </strong>

                                        <small
                                            style={
                                                styles.roleDescription
                                            }
                                        >
                                            Submit quotations
                                        </small>
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* PASSWORD */}

                        <div style={styles.inputGroup}>
                            <label
                                htmlFor="password"
                                style={styles.label}
                            >
                                Password
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <div
                                style={
                                    styles.passwordWrapper
                                }
                            >
                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        formData.password
                                    }
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    style={
                                        styles.passwordInput
                                    }
                                />

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    style={
                                        styles.showButton
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>

                            <span
                                style={styles.helpText}
                            >
                                Minimum 6 characters.
                            </span>
                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div style={styles.inputGroup}>
                            <label
                                htmlFor="confirmPassword"
                                style={styles.label}
                            >
                                Confirm Password
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <div
                                style={
                                    styles.passwordWrapper
                                }
                            >
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    style={
                                        styles.passwordInput
                                    }
                                />

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    style={
                                        styles.showButton
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* ERROR */}

                        {error && (
                            <div
                                style={styles.errorBox}
                                role="alert"
                            >
                                <span
                                    style={
                                        styles.alertIcon
                                    }
                                >
                                    ⚠
                                </span>

                                <span>{error}</span>
                            </div>
                        )}

                        {/* SUCCESS */}

                        {success && (
                            <div
                                style={styles.successBox}
                                role="status"
                            >
                                <span
                                    style={
                                        styles.alertIcon
                                    }
                                >
                                    ✓
                                </span>

                                <span>{success}</span>
                            </div>
                        )}

                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.registerButton,
                                ...(loading
                                    ? styles.registerButtonDisabled
                                    : {}),
                            }}
                        >
                            {loading ? (
                                <>
                                    <span
                                        style={
                                            styles.buttonSpinner
                                        }
                                    />

                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <span
                                        style={
                                            styles.buttonArrow
                                        }
                                    >
                                        →
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* LOGIN */}

                    <div
                        style={
                            styles.loginLinkContainer
                        }
                    >
                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                navigate("/login")
                            }
                            style={styles.loginLink}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f8fafc",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        color: "#0f172a",
    },

    /* ================================================
       LEFT PANEL
    ================================================ */

    leftPanel: {
        width: "48%",
        minHeight: "100vh",
        background:
            "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        boxSizing: "border-box",
    },

    leftContent: {
        width: "100%",
        maxWidth: "520px",
    },

    logo: {
        width: "60px",
        height: "60px",
        borderRadius: "14px",
        backgroundColor:
            "rgba(255,255,255,0.16)",
        border:
            "1px solid rgba(255,255,255,0.28)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px",
        fontWeight: "800",
        marginBottom: "18px",
        letterSpacing: "0.5px",
    },

    badge: {
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: "20px",
        backgroundColor:
            "rgba(255,255,255,0.12)",
        border:
            "1px solid rgba(255,255,255,0.20)",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.8px",
        marginBottom: "17px",
    },

    brandTitle: {
        fontSize: "40px",
        lineHeight: "1.15",
        fontWeight: "800",
        letterSpacing: "-0.8px",
        margin: "0 0 18px",
    },

    brandDescription: {
        fontSize: "16px",
        lineHeight: "1.7",
        color: "rgba(255,255,255,0.88)",
        margin: 0,
        maxWidth: "480px",
    },

    features: {
        marginTop: "48px",
        display: "flex",
        flexDirection: "column",
        gap: "25px",
    },

    feature: {
        display: "flex",
        alignItems: "flex-start",
        gap: "15px",
    },

    featureIcon: {
        width: "44px",
        height: "44px",
        minWidth: "44px",
        borderRadius: "10px",
        backgroundColor:
            "rgba(255,255,255,0.14)",
        border:
            "1px solid rgba(255,255,255,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
    },

    featureTitle: {
        margin: "0 0 5px",
        fontSize: "15px",
        fontWeight: "700",
    },

    featureText: {
        margin: 0,
        fontSize: "13px",
        lineHeight: "1.55",
        color: "rgba(255,255,255,0.76)",
    },

    /* ================================================
       RIGHT PANEL
    ================================================ */

    rightPanel: {
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 28px",
        boxSizing: "border-box",
        overflowY: "auto",
    },

    /* ================================================
       REGISTER CARD
    ================================================ */

    registerCard: {
        width: "100%",
        maxWidth: "470px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "36px",
        boxSizing: "border-box",
        boxShadow:
            "0 10px 35px rgba(15,23,42,0.07)",
    },

    cardHeader: {
        marginBottom: "26px",
    },

    registerTitle: {
        margin: 0,
        fontSize: "27px",
        lineHeight: "1.25",
        fontWeight: "800",
        color: "#111827",
        letterSpacing: "-0.4px",
    },

    subtitle: {
        margin: "8px 0 0",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: "1.5",
    },

    /* ================================================
       INPUTS
    ================================================ */

    inputGroup: {
        marginBottom: "17px",
    },

    label: {
        display: "block",
        marginBottom: "7px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155",
    },

    required: {
        color: "#dc2626",
        marginLeft: "3px",
    },

    input: {
        width: "100%",
        height: "45px",
        padding: "0 13px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        outline: "none",
        fontSize: "13px",
        color: "#0f172a",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
    },

    helpText: {
        display: "block",
        marginTop: "5px",
        color: "#94a3b8",
        fontSize: "10px",
    },

    /* ================================================
       ROLE
    ================================================ */

    roleContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
    },

    roleButton: {
        minHeight: "66px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 11px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "#334155",
        cursor: "pointer",
        textAlign: "left",
        fontSize: "13px",
        boxSizing: "border-box",
    },

    roleButtonActive: {
        border: "2px solid #2563eb",
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
    },

    roleIcon: {
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "19px",
        flexShrink: 0,
    },

    roleContent: {
        display: "flex",
        flexDirection: "column",
    },

    roleTitle: {
        fontSize: "13px",
        fontWeight: "750",
    },

    roleDescription: {
        display: "block",
        marginTop: "3px",
        fontSize: "10px",
        color: "#64748b",
        fontWeight: "400",
    },

    /* ================================================
       PASSWORD
    ================================================ */

    passwordWrapper: {
        position: "relative",
        width: "100%",
    },

    passwordInput: {
        width: "100%",
        height: "45px",
        padding: "0 60px 0 13px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        outline: "none",
        fontSize: "13px",
        color: "#0f172a",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
    },

    showButton: {
        position: "absolute",
        right: "9px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        backgroundColor: "transparent",
        color: "#2563eb",
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer",
        padding: "5px",
    },

    /* ================================================
       ALERTS
    ================================================ */

    errorBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "9px",
        padding: "11px 13px",
        marginBottom: "16px",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#b91c1c",
        fontSize: "12px",
        lineHeight: "1.45",
    },

    successBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "9px",
        padding: "11px 13px",
        marginBottom: "16px",
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        color: "#166534",
        fontSize: "12px",
        lineHeight: "1.45",
    },

    alertIcon: {
        flexShrink: 0,
        fontWeight: "800",
    },

    /* ================================================
       REGISTER BUTTON
    ================================================ */

    registerButton: {
        width: "100%",
        minHeight: "47px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "750",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        boxShadow:
            "0 4px 10px rgba(37,99,235,0.18)",
    },

    registerButtonDisabled: {
        opacity: 0.7,
        cursor: "not-allowed",
    },

    buttonArrow: {
        fontSize: "17px",
        lineHeight: 1,
    },

    buttonSpinner: {
        width: "13px",
        height: "13px",
        border: "2px solid rgba(255,255,255,0.4)",
        borderTop: "2px solid #ffffff",
        borderRadius: "50%",
        display: "inline-block",
    },

    /* ================================================
       LOGIN
    ================================================ */

    loginLinkContainer: {
        marginTop: "21px",
        paddingTop: "19px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "5px",
        color: "#64748b",
        fontSize: "12px",
    },

    loginLink: {
        border: "none",
        backgroundColor: "transparent",
        color: "#2563eb",
        fontWeight: "750",
        cursor: "pointer",
        padding: 0,
        fontSize: "12px",
    },
};

export default Register;