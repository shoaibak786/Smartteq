import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";
import "./Admin.css";
import "./AdminPremium.css";

export default function AdminLayout() {
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        let active = true;

        const verifyAdmin = async () => {
            const token = sessionStorage.getItem("smartteq_admin_token");

            if (!token) {
                if (active) {
                    setAuthorized(false);
                    setChecking(false);
                }
                return;
            }

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error("Admin session expired.");
                }

                if (active) setAuthorized(true);

            } catch {
                sessionStorage.removeItem("smartteq_admin_token");

                if (active) setAuthorized(false);

            } finally {
                if (active) setChecking(false);
            }
        };

        verifyAdmin();

        return () => {
            active = false;
        };
    }, []);

    if (checking) {
        return (
            <div className="admin-login-page admin-verify-screen">
                <div
                    className="admin-verify-card"
                    role="status"
                    aria-live="polite"
                >
                    <div className="admin-verify-loader" aria-hidden="true">
                        <span className="admin-verify-ring" />
                        <span className="admin-verify-ring admin-verify-ring--inner" />
                        <div className="admin-verify-core">
                            <BrandLogo size={56} className="sq-logo--verify" />
                        </div>
                    </div>

                    <h2>SMARTTEQ</h2>
                    <p>Verifying admin access...</p>

                    <div className="admin-verify-bar" aria-hidden="true">
                        <span />
                    </div>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
