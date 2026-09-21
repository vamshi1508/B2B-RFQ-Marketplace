import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await API.post("/auth/login", {
                email: email.trim(),
                password: password,
            });

            const { token, user } = response.data;

            // Save authentication details
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Redirect based on user role
            if (user.role === "BUYER") {
                navigate("/buyer");
            } else if (user.role === "SUPPLIER") {
                navigate("/supplier");
            } else {
                setError("Invalid user role.");
            }

        } catch (err) {
            console.error("Login error:", err);

            setError(
                err.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            {/* =========================================
                LEFT PANEL
            ========================================= */}

            <div style={styles.leftPanel}>

                <div style={styles.leftContent}>

                    <div style={styles.logo}>
                        RFQ
                    </div>

                    <h1 style={styles.brandTitle}>
                        B2B RFQ Marketplace
                    </h1>

                    <p style={styles.brandDescription}>
                        Connect buyers and suppliers through
                        a simple and efficient quotation platform.
                    </p>

                    <div style={styles.features}>

                        {/* Feature 1 */}
                        <div style={styles.feature}>

                            <div style={styles.featureIcon}>
                                📋
                            </div>

                            <div>
                                <h3 style={styles.featureTitle}>
                                    Create RFQs
                                </h3>

                                <p style={styles.featureText}>
                                    Buyers can create and manage
                                    their requirements easily.
                                </p>
                            </div>

                        </div>


                        {/* Feature 2 */}
                        <div style={styles.feature}>

                            <div style={styles.featureIcon}>
                                💼
                            </div>

                            <div>
                                <h3 style={styles.featureTitle}>
                                    Submit Quotations
                                </h3>

                                <p style={styles.featureText}>
                                    Suppliers can review requirements
                                    and submit competitive quotations.
                                </p>
                            </div>

                        </div>


                        {/* Feature 3 */}
                        <div style={styles.feature}>

                            <div style={styles.featureIcon}>
                                ✓
                            </div>

                            <div>
                                <h3 style={styles.featureTitle}>
                                    Manage Awards
                                </h3>

                                <p style={styles.featureText}>
                                    Buyers can review quotations and
                                    award the selected supplier.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================================
                RIGHT PANEL
            ========================================= */}

            <div style={styles.rightPanel}>

                <div style={styles.loginCard}>

                    {/* Mobile Logo */}
                    <div style={styles.mobileLogo}>
                        RFQ
                    </div>


                    <h2 style={styles.loginTitle}>
                        Welcome back
                    </h2>

                    <p style={styles.subtitle}>
                        Sign in to your marketplace account
                    </p>


                    {/* =====================================
                        LOGIN FORM
                    ===================================== */}

                    <form onSubmit={handleLogin}>

                        {/* EMAIL */}

                        <div style={styles.inputGroup}>

                            <label style={styles.label}>
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={loading}
                                required
                                style={styles.input}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div style={styles.inputGroup}>

                            <label style={styles.label}>
                                Password
                            </label>

                            <div style={styles.passwordWrapper}>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                    style={{
                                        ...styles.input,
                                        paddingRight: "65px",
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                    style={styles.showButton}
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* ERROR */}

                        {error && (
                            <div style={styles.errorBox}>

                                <span style={styles.errorIcon}>
                                    ⚠
                                </span>

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.loginButton,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>


                    {/* =====================================
                        REGISTER LINK
                    ===================================== */}

                    <div style={styles.registerLinkContainer}>

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            style={styles.registerLink}
                        >
                            Create Account
                        </button>

                    </div>


                    {/* =====================================
                        TEST ACCOUNTS
                    ===================================== */}

                    <div style={styles.testBox}>

                        <div style={styles.testTitle}>
                            Test Accounts
                        </div>

                        <div style={styles.testAccount}>

                            <span style={styles.accountRole}>
                                Buyer
                            </span>

                            <span style={styles.accountEmail}>
                                buyer@test.com
                            </span>

                        </div>

                        <div style={styles.testAccount}>

                            <span style={styles.accountRole}>
                                Supplier
                            </span>

                            <span style={styles.accountEmail}>
                                supplier@test.com
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

    /* =================================================
       PAGE
    ================================================= */

    page: {
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f8fafc",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    },


    /* =================================================
       LEFT PANEL
    ================================================= */

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
        backgroundColor: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.30)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px",
        fontWeight: "800",
        marginBottom: "26px",
    },

    brandTitle: {
        fontSize: "42px",
        lineHeight: "1.15",
        fontWeight: "800",
        margin: "0 0 18px",
    },

    brandDescription: {
        fontSize: "17px",
        lineHeight: "1.7",
        color: "rgba(255,255,255,0.88)",
        margin: 0,
        maxWidth: "480px",
    },

    features: {
        marginTop: "55px",
        display: "flex",
        flexDirection: "column",
        gap: "26px",
    },

    feature: {
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
    },

    featureIcon: {
        width: "44px",
        height: "44px",
        minWidth: "44px",
        borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "19px",
    },

    featureTitle: {
        margin: "0 0 5px",
        fontSize: "16px",
        fontWeight: "700",
    },

    featureText: {
        margin: 0,
        fontSize: "14px",
        lineHeight: "1.5",
        color: "rgba(255,255,255,0.78)",
    },


    /* =================================================
       RIGHT PANEL
    ================================================= */

    rightPanel: {
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 25px",
        boxSizing: "border-box",
    },


    /* =================================================
       LOGIN CARD
    ================================================= */

    loginCard: {
        width: "100%",
        maxWidth: "430px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "42px",
        boxSizing: "border-box",
        boxShadow:
            "0 10px 35px rgba(15,23,42,0.08)",
    },

    mobileLogo: {
        display: "none",
    },

    loginTitle: {
        margin: 0,
        fontSize: "30px",
        fontWeight: "750",
        color: "#111827",
    },

    subtitle: {
        margin: "8px 0 30px",
        color: "#64748b",
        fontSize: "15px",
    },


    /* =================================================
       INPUTS
    ================================================= */

    inputGroup: {
        marginBottom: "20px",
    },

    label: {
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#334155",
    },

    input: {
        width: "100%",
        height: "48px",
        padding: "0 14px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        outline: "none",
        fontSize: "14px",
        color: "#0f172a",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
    },


    /* =================================================
       PASSWORD
    ================================================= */

    passwordWrapper: {
        position: "relative",
        width: "100%",
    },

    showButton: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        backgroundColor: "transparent",
        color: "#2563eb",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        padding: "5px",
    },


    /* =================================================
       ERROR
    ================================================= */

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "12px 14px",
        marginBottom: "18px",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#b91c1c",
        fontSize: "13px",
    },

    errorIcon: {
        fontSize: "15px",
    },


    /* =================================================
       LOGIN BUTTON
    ================================================= */

    loginButton: {
        width: "100%",
        height: "48px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "700",
    },


    /* =================================================
       REGISTER LINK
    ================================================= */

    registerLinkContainer: {
        marginTop: "22px",
        paddingTop: "20px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        color: "#64748b",
        fontSize: "13px",
    },

    registerLink: {
        border: "none",
        backgroundColor: "transparent",
        color: "#2563eb",
        fontWeight: "700",
        cursor: "pointer",
        padding: 0,
        fontSize: "13px",
    },


    /* =================================================
       TEST ACCOUNTS
    ================================================= */

    testBox: {
        marginTop: "28px",
        padding: "16px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "9px",
        color: "#475569",
        fontSize: "12px",
    },

    testTitle: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155",
        marginBottom: "10px",
    },

    testAccount: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        paddingTop: "9px",
        marginTop: "9px",
        borderTop: "1px solid #e2e8f0",
    },

    accountRole: {
        fontWeight: "600",
        color: "#475569",
    },

    accountEmail: {
        color: "#64748b",
    },
};

export default Login;