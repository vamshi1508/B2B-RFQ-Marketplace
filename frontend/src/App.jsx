import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// ==============================
// Authentication
// ==============================

import Login from "./pages/Login";
import Register from "./pages/register";

// ==============================
// Buyer Pages
// ==============================

import BuyerDashboard from "./pages/BuyerDashboard";
import CreateRFQ from "./pages/CreateRFQ";
import Quotations from "./pages/Quotations";

// ==============================
// Supplier Pages
// ==============================

import SupplierDashboard from "./pages/SupplierDashboard";
import SupplierRFQDetails from "./pages/SupplierRFQDetails";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =========================================
                    DEFAULT ROUTE
                ========================================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* =========================================
                    AUTHENTICATION
                ========================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =========================================
                    BUYER ROUTES
                ========================================= */}

                <Route
                    path="/buyer"
                    element={<BuyerDashboard />}
                />

                <Route
                    path="/buyer/create-rfq"
                    element={<CreateRFQ />}
                />

                <Route
                    path="/buyer/rfq/:rfq_id/quotations"
                    element={<Quotations />}
                />


                {/* =========================================
                    SUPPLIER ROUTES
                ========================================= */}

                <Route
                    path="/supplier"
                    element={<SupplierDashboard />}
                />

                <Route
                    path="/supplier/rfq/:rfq_id"
                    element={<SupplierRFQDetails />}
                />


                {/* =========================================
                    UNKNOWN ROUTES
                ========================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;