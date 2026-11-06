import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Warehouse,
    Tags,
    Star,
    Settings,
    LogOut,
    Menu,
    Bell,
    TrendingUp,
    RefreshCw
} from "lucide-react";

import {
    motion,
    animate,
    useMotionValue,
    useSpring,
    useTransform,
    useReducedMotion
} from "framer-motion";

import { useNavigate, useLocation } from "react-router-dom";
import { Component, Suspense, lazy, useEffect, useState } from "react";
// import "./Admin.css";
import "./AdminPremium.css";

/* 3D scene is loaded only when needed (desktop + motion allowed) */
const HeroScene3D = lazy(() => import("./HeroScene3D"));

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const menuItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Products", icon: Package },
    { label: "Orders", icon: ShoppingCart },
    { label: "Customers", icon: Users },
    { label: "Inventory", icon: Warehouse },
    { label: "Categories", icon: Tags },
    { label: "Reviews", icon: Star },
    { label: "Settings", icon: Settings }
];

const initialStats = {
    revenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalStock: 0,
    outOfStock: 0
};

const formatCurrency = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-PK");

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

/* ---------- Motion helpers (design only) ---------- */

const gridVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } }
};

function AnimatedNumber({ value, format }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const controls = animate(0, Number(value) || 0, {
            duration: 1.3,
            ease: "easeOut",
            onUpdate: (latest) => setDisplay(Math.round(latest))
        });

        return () => controls.stop();
    }, [value]);

    return <>{format(display)}</>;
}

/* Card that tilts in 3D following the mouse */
function TiltCard({ children, className, variants }) {
    const reduceMotion = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), {
        stiffness: 200,
        damping: 20
    });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), {
        stiffness: 200,
        damping: 20
    });

    const handleMove = (event) => {
        if (reduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left) / rect.width - 0.5);
        y.set((event.clientY - rect.top) / rect.height - 0.5);
    };

    const handleLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={className}
            variants={variants}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ rotateX, rotateY, transformPerspective: 900 }}
        >
            {children}
        </motion.div>
    );
}

/* If WebGL fails, fall back to the simple icon */
class SceneBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { failed: false };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

function useCan3D() {
    const reduceMotion = useReducedMotion();
    const [can3D, setCan3D] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(min-width: 701px)");
        const update = () => setCan3D(query.matches && !reduceMotion);

        update();
        query.addEventListener("change", update);

        return () => query.removeEventListener("change", update);
    }, [reduceMotion]);

    return can3D;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const can3D = useCan3D();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(initialStats);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        const token = sessionStorage.getItem("smartteq_admin_token");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem("smartteq_admin_token");
                navigate("/admin/login", { replace: true });
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load dashboard."
                );
            }

            setStats({
                ...initialStats,
                ...data.stats
            });

            setRecentOrders(
                Array.isArray(data.recentOrders)
                    ? data.recentOrders
                    : []
            );

        } catch (err) {
            setError(
                err.message || "Unable to connect to the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const logout = () => {
        sessionStorage.removeItem("smartteq_admin_token");
        navigate("/admin/login", { replace: true });
    };

    const statCards = [
        {
            label: "Total Revenue",
            raw: stats.revenue,
            format: formatCurrency,
            icon: TrendingUp,
            detail: "From delivered orders"
        },
        {
            label: "Total Orders",
            raw: stats.totalOrders,
            format: formatNumber,
            icon: ShoppingCart,
            detail: `${stats.pendingOrders} pending orders`
        },
        {
            label: "Total Products",
            raw: stats.totalProducts,
            format: formatNumber,
            icon: Package,
            detail: `${stats.totalStock} units in stock`
        },
        {
            label: "Total Customers",
            raw: stats.totalCustomers,
            format: formatNumber,
            icon: Users,
            detail: "Unique phone numbers"
        }
    ];

    const welcomeIcon = (
        <div className="admin-welcome-icon">
            <LayoutDashboard size={35} />
        </div>
    );

    return (
        <div className="admin-dashboard">

            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>

                <div className="admin-brand">
                    <div className="admin-brand-icon">
                        <Package size={25} />
                    </div>
                    <div>
                        <h2>SMARTTEQ</h2>
                        <span>ADMIN PANEL</span>
                    </div>
                </div>

                <div className="admin-menu-heading">MAIN MENU</div>

                <nav className="admin-navigation">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (

                            <button
                                key={item.label}
                                className={`admin-nav-item ${(item.label === "Overview" &&
                                        location.pathname === "/admin/dashboard") ||
                                        (item.label === "Orders" &&
                                            location.pathname === "/admin/orders")
                                        ? "active"
                                        : ""
                                    } `}
                                onClick={() => {
                                    setSidebarOpen(false);

                                    if (item.label === "Overview") {
                                        navigate("/admin/dashboard");
                                    }

                                    if (item.label === "Orders") {
                                        navigate("/admin/orders");
                                    }
                                }}
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                            </button>

                        );
                    })}
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-user">
                        <div className="admin-avatar">K</div>
                        <div>
                            <strong>Super Admin</strong>
                            <span>Administrator</span>
                        </div>
                    </div>

                    <button className="admin-logout" onClick={logout}>
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">

                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            className="admin-mobile-menu"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <h1>Dashboard Overview</h1>
                            <p>Welcome to your Smartteq control panel.</p>
                        </div>
                    </div>

                    <div className="admin-topbar-right">
                        <button
                            className="admin-icon-button"
                            aria-label="Refresh dashboard"
                            onClick={fetchDashboard}
                            disabled={loading}
                        >
                            <RefreshCw
                                size={19}
                                className={loading ? "admin-spin" : ""}
                            />
                        </button>

                        <button
                            className="admin-icon-button"
                            aria-label="Notifications"
                        >
                            <Bell size={19} />
                        </button>

                        <div className="admin-top-avatar">K</div>
                    </div>
                </header>

                <section className="admin-content">

                    <motion.div
                        className="admin-welcome"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="admin-welcome-text">
                            <span>SMARTTEQ MANAGEMENT</span>
                            <h2>Welcome back, Khawar!</h2>
                            <p>Here's what's happening with your store today.</p>
                        </div>

                        {can3D ? (
                            <div className="admin-welcome-3d" aria-hidden="true">
                                <SceneBoundary fallback={welcomeIcon}>
                                    <Suspense fallback={null}>
                                        <HeroScene3D />
                                    </Suspense>
                                </SceneBoundary>
                            </div>
                        ) : (
                            welcomeIcon
                        )}
                    </motion.div>

                    {error && (
                        <div className="admin-login-error">
                            {error}
                            <button onClick={fetchDashboard}>
                                Try again
                            </button>
                        </div>
                    )}

                    <motion.div
                        className="admin-stats-grid"
                        variants={gridVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {statCards.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <TiltCard
                                    className="admin-stat-card"
                                    variants={cardVariants}
                                    key={stat.label}
                                >
                                    <div className="admin-stat-top">
                                        <span>{stat.label}</span>
                                        <div className="admin-stat-icon">
                                            <Icon size={21} />
                                        </div>
                                    </div>

                                    <h3 className={loading ? "is-loading" : ""}>
                                        {loading ? (
                                            "Loading..."
                                        ) : (
                                            <AnimatedNumber
                                                value={stat.raw}
                                                format={stat.format}
                                            />
                                        )}
                                    </h3>

                                    <small>
                                        {loading ? "Fetching live data..." : stat.detail}
                                    </small>
                                </TiltCard>
                            );
                        })}
                    </motion.div>

                    <motion.div
                        className="admin-panel-card"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.45, ease: "easeOut" }}
                    >
                        <h3>Recent Orders</h3>

                        {loading ? (
                            <p className="admin-empty-state">
                                Loading recent orders...
                            </p>
                        ) : recentOrders.length === 0 ? (
                            <p className="admin-empty-state">
                                No orders found in your database yet.
                            </p>
                        ) : (
                            <div className="admin-orders-table admin-orders-table--cards">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentOrders.map((order, index) => (
                                            <motion.tr
                                                key={order.orderId}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.35,
                                                    delay: 0.6 + index * 0.05
                                                }}
                                            >
                                                <td data-label="Order ID">{order.orderId}</td>
                                                <td data-label="Customer">{order.customerName}</td>
                                                <td data-label="Date">{formatDate(order.createdAt)}</td>
                                                <td data-label="Amount">{formatCurrency(order.total)}</td>
                                                <td data-label="Status">
                                                    <span
                                                        className={`admin-order-status status-${String(
                                                            order.status || ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                </section>
            </main>
        </div>
    );
}
