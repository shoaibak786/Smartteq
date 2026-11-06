
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
    RefreshCw,
    Search,
    Eye,
    X,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ChevronDown
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUSES = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered"
];

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

const formatCurrency = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function AdminOrders() {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [success, setSuccess] = useState("");

    const getHeaders = () => {
        const token = sessionStorage.getItem("smartteq_admin_token");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return null;
        }

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    };

    const handleAuthError = () => {
        sessionStorage.removeItem("smartteq_admin_token");
        navigate("/admin/login", { replace: true });
    };

    const fetchOrders = async () => {
        const headers = getHeaders();

        if (!headers) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/orders`,
                { headers }
            );

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                handleAuthError();
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load orders.");
            }

            setOrders(Array.isArray(data.orders) ? data.orders : []);

        } catch (err) {
            setError(err.message || "Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesSearch =
                !term ||
                String(order.orderId || "").toLowerCase().includes(term) ||
                String(order.customerName || "").toLowerCase().includes(term) ||
                String(order.phone || "").toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === "All" ||
                order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const statusCounts = useMemo(() => ({
        All: orders.length,
        Pending: orders.filter(o => o.status === "Pending").length,
        Processing: orders.filter(o => o.status === "Processing").length,
        Shipped: orders.filter(o => o.status === "Shipped").length,
        Delivered: orders.filter(o => o.status === "Delivered").length
    }), [orders]);

    const openOrderDetails = async (orderId) => {
        const headers = getHeaders();

        if (!headers) return;

        setDetailsLoading(true);
        setSelectedOrder(null);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/orders/${encodeURIComponent(orderId)}`,
                { headers }
            );

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                handleAuthError();
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load order.");
            }

            setSelectedOrder(data.order);

        } catch (err) {
            setError(err.message);
        } finally {
            setDetailsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        const headers = getHeaders();

        if (!headers) return;

        setUpdating(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/orders/${encodeURIComponent(orderId)}/status`,
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                handleAuthError();
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Status update failed.");
            }

            setSelectedOrder((previous) => ({
                ...previous,
                status: data.status
            }));

            setOrders((previous) =>
                previous.map((order) =>
                    order.orderId === orderId
                        ? { ...order, status: data.status }
                        : order
                )
            );

            setSuccess("Order status updated successfully.");

        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const logout = () => {
        sessionStorage.removeItem("smartteq_admin_token");
        navigate("/admin/login", { replace: true });
    };

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
                                className={`admin-nav-item ${
                                    item.label === "Orders" ? "active" : ""
                                }`}
                                onClick={() => {
                                    setSidebarOpen(false);

                                    if (item.label === "Overview") {
                                        navigate("/admin/dashboard");
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
                            <h1>Orders Management</h1>
                            <p>Manage and track your customer orders.</p>
                        </div>
                    </div>

                    <div className="admin-topbar-right">
                        <button
                            className="admin-icon-button"
                            onClick={fetchOrders}
                            disabled={loading}
                            aria-label="Refresh orders"
                        >
                            <RefreshCw size={19} />
                        </button>

                        <div className="admin-top-avatar">K</div>
                    </div>
                </header>

                <section className="admin-content">

                    <div className="admin-orders-heading">
                        <div>
                            <h2>All Orders</h2>
                            <p>View customer orders and update their status.</p>
                        </div>

                        <button
                            className="admin-orders-refresh"
                            onClick={fetchOrders}
                            disabled={loading}
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>

                    <div className="admin-orders-stats">
                        {STATUSES.map((status) => (
                            <button
                                key={status}
                                className={`admin-order-stat ${
                                    statusFilter === status ? "selected" : ""
                                }`}
                                onClick={() => setStatusFilter(status)}
                            >
                                <span>{status}</span>
                                <strong>{statusCounts[status]}</strong>
                            </button>
                        ))}

                        <button
                            className={`admin-order-stat ${
                                statusFilter === "All" ? "selected" : ""
                            }`}
                            onClick={() => setStatusFilter("All")}
                        >
                            <span>All Orders</span>
                            <strong>{statusCounts.All}</strong>
                        </button>
                    </div>

                    <div className="admin-panel-card admin-orders-panel">

                        <div className="admin-orders-toolbar">
                            <div>
                                <h3>Order List</h3>
                                <p>{filteredOrders.length} orders found</p>
                            </div>

                            <div className="admin-orders-search">
                                <Search size={18} />

                                <input
                                    type="search"
                                    placeholder="Search ID, customer or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="admin-orders-filter">
                            <label htmlFor="order-status-filter">
                                Filter by status
                            </label>

                            <select
                                id="order-status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Orders</option>
                                {STATUSES.map(status => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="admin-orders-error">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="admin-empty-state">
                                Loading orders...
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="admin-empty-state">
                                No orders match your search or filter.
                            </div>
                        ) : (
                            <div className="admin-orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Contact</th>
                                            <th>Date</th>
                                            <th>Payment</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.orderId}>
                                                <td>
                                                    <strong>{order.orderId}</strong>
                                                </td>
                                                <td>{order.customerName}</td>
                                                <td>{order.phone}</td>
                                                <td>{formatDate(order.createdAt)}</td>
                                                <td>{order.paymentMethod}</td>
                                                <td>
                                                    <strong>{formatCurrency(order.total)}</strong>
                                                </td>
                                                <td>
                                                    <span className={`admin-order-status status-${String(order.status).toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="admin-order-view"
                                                        onClick={() => openOrderDetails(order.orderId)}
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </section>
            </main>

            {(detailsLoading || selectedOrder) && (
                <div
                    className="admin-order-modal-overlay"
                    onClick={() => {
                        if (!detailsLoading) setSelectedOrder(null);
                    }}
                >
                    <div
                        className="admin-order-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-order-modal-header">
                            <div>
                                <h2>Order Details</h2>
                                <p>Customer and order information</p>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                aria-label="Close order details"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="admin-empty-state">
                                Loading order details...
                            </div>
                        ) : selectedOrder && (
                            <div className="admin-order-modal-body">

                                <div className="admin-order-detail-top">
                                    <div>
                                        <small>ORDER ID</small>
                                        <h3>{selectedOrder.orderId}</h3>
                                    </div>

                                    <span className={`admin-order-status status-${String(selectedOrder.status).toLowerCase()}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>

                                <div className="admin-order-detail-grid">
                                    <div>
                                        <Phone size={17} />
                                        <span>
                                            <small>Phone</small>
                                            <strong>{selectedOrder.phone}</strong>
                                        </span>
                                    </div>

                                    <div>
                                        <Mail size={17} />
                                        <span>
                                            <small>Email</small>
                                            <strong>{selectedOrder.email || "—"}</strong>
                                        </span>
                                    </div>

                                    <div>
                                        <MapPin size={17} />
                                        <span>
                                            <small>Delivery Address</small>
                                            <strong>
                                                {[
                                                    selectedOrder.address,
                                                    selectedOrder.area,
                                                    selectedOrder.city,
                                                    selectedOrder.postalCode
                                                ].filter(Boolean).join(", ") || "—"}
                                            </strong>
                                        </span>
                                    </div>

                                    <div>
                                        <Calendar size={17} />
                                        <span>
                                            <small>Order Date</small>
                                            <strong>{formatDate(selectedOrder.createdAt)}</strong>
                                        </span>
                                    </div>
                                </div>

                                {selectedOrder.notes && (
                                    <div className="admin-order-notes">
                                        <strong>Customer Notes</strong>
                                        <p>{selectedOrder.notes}</p>
                                    </div>
                                )}

                                <h3 className="admin-order-section-title">
                                    Ordered Products
                                </h3>

                                <div className="admin-order-items">
                                    {(selectedOrder.items || []).map((item, index) => (
                                        <div
                                            className="admin-order-item"
                                            key={`${item.productId}-${index}`}
                                        >
                                            <div>
                                                <strong>{item.productName}</strong>
                                                <small>
                                                    {formatCurrency(item.price)} × {item.quantity}
                                                </small>
                                            </div>

                                            <strong>
                                                {formatCurrency(item.lineTotal)}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="admin-order-totals">
                                    <div>
                                        <span>Subtotal</span>
                                        <strong>{formatCurrency(selectedOrder.subtotal)}</strong>
                                    </div>

                                    <div>
                                        <span>Shipping</span>
                                        <strong>{formatCurrency(selectedOrder.shipping)}</strong>
                                    </div>

                                    <div className="grand-total">
                                        <span>Total Amount</span>
                                        <strong>{formatCurrency(selectedOrder.total)}</strong>
                                    </div>
                                </div>

                                <div className="admin-order-payment">
                                    <span>Payment Method</span>
                                    <strong>{selectedOrder.paymentMethod}</strong>
                                </div>

                                <div className="admin-order-update">
                                    <label htmlFor="update-order-status">
                                        Update Order Status
                                    </label>

                                    <div>
                                        <select
                                            id="update-order-status"
                                            value={selectedOrder.status}
                                            disabled={updating}
                                            onChange={(e) =>
                                                updateOrderStatus(
                                                    selectedOrder.orderId,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {STATUSES.map(status => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>

                                        <ChevronDown size={17} />
                                    </div>

                                    {updating && <small>Updating status...</small>}

                                    {success && (
                                        <p className="admin-orders-success">
                                            {success}
                                        </p>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
