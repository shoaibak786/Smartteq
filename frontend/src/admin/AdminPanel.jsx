import {
    Children, Suspense, cloneElement, isValidElement, lazy,
    useCallback, useEffect, useMemo, useState
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    motion, animate, useMotionValue, useReducedMotion, useSpring, useTransform
} from "framer-motion";
import {
    LayoutDashboard, Package, ShoppingCart, Users, Warehouse, Tags,
    Star, Settings, LogOut, Menu, RefreshCw, Search, Plus, Pencil,
    Trash2, X, Save, AlertTriangle, CheckCircle2, Eye, EyeOff, Upload,
    TrendingUp
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import "./Admin.css";
import "./AdminPremium.css";

// 3D hero is loaded only when needed (desktop), so phones stay fast.
const HeroScene3D = lazy(() => import("./HeroScene3D"));

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const MENU = [
    { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products", path: "/admin/products", icon: Package },
    { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", path: "/admin/customers", icon: Users },
    { label: "Inventory", path: "/admin/inventory", icon: Warehouse },
    { label: "Categories", path: "/admin/categories", icon: Tags },
    { label: "Reviews", path: "/admin/reviews", icon: Star },
    { label: "Settings", path: "/admin/settings", icon: Settings }
];

const money = (v) => `Rs. ${Number(v || 0).toLocaleString("en-PK")}`;
const count = (v) => Number(v || 0).toLocaleString("en-PK");

const date = (v) =>
    v
        ? new Date(v).toLocaleDateString("en-PK", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "—";

const getImageUrl = (image) => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) return image;

    return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
};

const blankProduct = {
    name: "",
    brand: "",
    category: "",
    description: "",
    image: "",
    price: "",
    oldPrice: "",
    stock: "0",
    featured: false
};

export default function AdminPanel() {
    const navigate = useNavigate();
    const location = useLocation();

    const section = location.pathname.split("/")[2] || "dashboard";
    const current = MENU.find((m) => m.path.endsWith(section)) || MENU[0];

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savingProduct, setSavingProduct] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [search, setSearch] = useState("");
    const [data, setData] = useState({});

    const [productModal, setProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState(blankProduct);

    const [categoryModal, setCategoryModal] = useState(false);
    const [returnToProduct, setReturnToProduct] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        oldId: null
    });

    const [stockEdit, setStockEdit] = useState({});

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    // design only: show 3D hero on large screens without reduced-motion
    const reduceMotion = useReducedMotion();
    const [wideScreen, setWideScreen] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches
    );

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 900px)");
        const onChange = (e) => setWideScreen(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const showHero = wideScreen && !reduceMotion;

    // design only: cursor spotlight on cards
    useEffect(() => {
        const onMove = (e) => {
            const el = e.target.closest?.(".admin-stat-card, .admin-panel-card");
            if (!el) return;
            const r = el.getBoundingClientRect();
            el.style.setProperty("--mx", `${e.clientX - r.left}px`);
            el.style.setProperty("--my", `${e.clientY - r.top}px`);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    // =====================================
    // AUTHENTICATED API REQUEST
    // =====================================

    const authFetch = useCallback(async (path, options = {}) => {
        const token = sessionStorage.getItem("smartteq_admin_token");

        if (!token) {
            navigate("/admin/login", { replace: true });
            throw new Error("Please sign in again.");
        }

        const isFormData = options.body instanceof FormData;

        const response = await fetch(`${API}/api/admin${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body && !isFormData
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...options.headers
            }
        });

        const result = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("smartteq_admin_token");
            navigate("/admin/login", { replace: true });

            throw new Error("Your admin session expired. Please sign in again.");
        }

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Request failed.");
        }

        return result;
    }, [navigate]);

    // =====================================
    // LOAD ADMIN DATA
    // =====================================

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            let result;

            if (section === "dashboard") {
                result = await authFetch("/dashboard");
            } else if (section === "products") {
                const [productsResult, categoriesResult] = await Promise.all([
                    authFetch(`/products?search=${encodeURIComponent(search)}`),
                    authFetch("/categories")
                ]);

                result = {
                    ...productsResult,
                    categories: categoriesResult.categories || []
                };
            } else if (section === "orders") {
                result = await authFetch(`/orders?search=${encodeURIComponent(search)}`);
            } else if (section === "customers") {
                result = await authFetch(`/customers?search=${encodeURIComponent(search)}`);
            } else if (section === "inventory") {
                result = await authFetch("/inventory");
            } else if (section === "categories") {
                result = await authFetch("/categories");
            } else if (section === "reviews") {
                result = await authFetch("/reviews");
            }

            if (result) setData(result);

        } catch (e) {
            setError(e.message || "Unable to load this section.");
        } finally {
            setLoading(false);
        }
    }, [section, search, authFetch]);

    useEffect(() => {
        load();
    }, [load]);

    // =====================================
    // COMMON ACTIONS
    // =====================================

    const flash = (message) => {
        setNotice(message);
        setError("");
    };

    const logout = () => {
        sessionStorage.removeItem("smartteq_admin_token");
        navigate("/admin/login", { replace: true });
    };

    // =====================================
    // PRODUCT MANAGEMENT
    // =====================================

    const openNewProduct = () => {
        setEditingProduct(null);

        setProductForm({
            ...blankProduct,
            category: data.categories?.[0]?.name || ""
        });

        setProductModal(true);
    };

    const openEditProduct = (p) => {
        setEditingProduct(p.id);

        setProductForm({
            name: p.name || "",
            brand: p.brand || "",
            category: p.category || "",
            description: p.description || "",
            image: p.image || "",
            price: p.price ?? "",
            oldPrice: p.oldPrice ?? "",
            stock: p.stock ?? 0,
            featured: Boolean(p.featured)
        });

        setProductModal(true);
    };

    // =====================================
    // IMAGE UPLOAD
    // =====================================

    const uploadProductImage = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        e.target.value = "";

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, PNG, WEBP and GIF images are allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must not exceed 5 MB.");
            return;
        }

        setUploadingImage(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("image", file);

            const result = await authFetch("/products/upload-image", {
                method: "POST",
                body: formData
            });

            setProductForm((v) => ({
                ...v,
                image: result.image
            }));

            flash("Product image uploaded successfully.");

        } catch (e) {
            setError(e.message || "Image upload failed.");
        } finally {
            setUploadingImage(false);
        }
    };

    // =====================================
    // SAVE PRODUCT
    // =====================================

    const saveProduct = async (e) => {
        e.preventDefault();

        if (uploadingImage || savingProduct) return;

        if (!(data.categories || []).some(
            (c) => c.name === productForm.category
        )) {
            setError("Please select a valid existing category.");
            return;
        }

        if (!productForm.image.trim()) {
            setError("Please upload a product image or enter an image URL.");
            return;
        }

        const price = Number(productForm.price);
        const stock = Number(productForm.stock);
        const oldPrice = productForm.oldPrice === ""
            ? null
            : Number(productForm.oldPrice);

        if (!Number.isFinite(price) || price <= 0) {
            setError("Please enter a valid product price.");
            return;
        }

        if (!Number.isInteger(stock) || stock < 0) {
            setError("Stock must be a non-negative whole number.");
            return;
        }

        if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
            setError("Please enter a valid old price.");
            return;
        }

        setSavingProduct(true);
        setError("");

        try {
            const payload = {
                ...productForm,
                price,
                oldPrice,
                stock
            };

            await authFetch(
                editingProduct
                    ? `/products/${editingProduct}`
                    : "/products",
                {
                    method: editingProduct ? "PUT" : "POST",
                    body: JSON.stringify(payload)
                }
            );

            setProductModal(false);
            setProductForm(blankProduct);

            flash(
                editingProduct
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

            await load();

        } catch (e) {
            setError(e.message);
        } finally {
            setSavingProduct(false);
        }
    };

    // =====================================
    // ARCHIVE PRODUCT
    // =====================================

    const archiveProduct = async (p) => {
        if (!window.confirm(
            `Archive "${p.name}"? It will no longer appear on the public store.`
        )) return;

        try {
            await authFetch(`/products/${p.id}`, {
                method: "DELETE"
            });

            setData((previous) => ({
                ...previous,
                products: (previous.products || []).filter(
                    (item) => String(item.id) !== String(p.id)
                )
            }));

            flash("Product archived successfully.");

        } catch (e) {
            setError(e.message);
        }
    };

    // =====================================
    // ORDER MANAGEMENT
    // =====================================

    const updateOrder = async (orderId, status) => {
        try {
            await authFetch(`/orders/${encodeURIComponent(orderId)}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });

            flash(`Order ${orderId} updated.`);
            await load();

        } catch (e) {
            setError(e.message);
        }
    };

    // =====================================
    // INVENTORY MANAGEMENT
    // =====================================

    const saveStock = async (id) => {
        const stock = Number(stockEdit[id]);

        if (!Number.isInteger(stock) || stock < 0) {
            setError("Enter a valid stock quantity.");
            return;
        }

        try {
            await authFetch(`/inventory/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ stock })
            });

            flash("Stock quantity updated.");
            await load();

        } catch (e) {
            setError(e.message);
        }
    };

    // =====================================
    // CATEGORY MANAGEMENT
    // =====================================

    const saveCategory = async (e) => {
        e.preventDefault();

        const name = categoryForm.name.trim();

        if (!name) {
            setError("Category name is required.");
            return;
        }

        try {
            if (categoryForm.oldId) {
                await authFetch(`/categories/${categoryForm.oldId}`, {
                    method: "PUT",
                    body: JSON.stringify({ name })
                });
            } else {
                await authFetch("/categories", {
                    method: "POST",
                    body: JSON.stringify({ name })
                });
            }

            const wasAddingFromProduct = returnToProduct && !categoryForm.oldId;

            setCategoryModal(false);

            setCategoryForm({
                name: "",
                oldId: null
            });

            if (wasAddingFromProduct) {
                setProductForm((v) => ({
                    ...v,
                    category: name
                }));
            }

            setReturnToProduct(false);

            flash("Category saved successfully.");
            await load();

        } catch (e) {
            setError(e.message);
        }
    };

    const deleteCategory = async (category) => {
        if (!window.confirm(`Delete category "${category.name}"?`)) return;

        try {
            await authFetch(`/categories/${category.id}`, {
                method: "DELETE"
            });

            flash("Category deleted successfully.");
            await load();

        } catch (e) {
            setError(e.message);
        }
    };

    // =====================================
    // REVIEW MANAGEMENT
    // =====================================

    const approveReview = async (review, isApproved) => {
        try {
            await authFetch(`/reviews/${review.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isApproved })
            });

            flash("Review status updated.");
            await load();

        } catch (e) {
            setError(e.message);
        }
    };

    const deleteReview = async (review) => {
        if (!window.confirm("Delete this review permanently?")) return;

        try {
            await authFetch(`/reviews/${review.id}`, {
                method: "DELETE"
            });

            flash("Review deleted.");
            await load();

        } catch (e) {
            setError(e.message);
        }
    };

    // =====================================
    // ADMIN SETTINGS
    // =====================================

    const changePassword = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            await authFetch("/change-password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            sessionStorage.removeItem("smartteq_admin_token");
            navigate("/admin/login", { replace: true });

        } catch (e) {
            setError(e.message);
        }
    };

    // =====================================
    // STATISTICS
    // =====================================

    const stats = data.stats || {};

    const filteredProducts = useMemo(
        () => data.products || [],
        [data.products]
    );

    const productStats = useMemo(() => {
        const active = (data.products || []).filter((p) => p.isActive);

        return {
            total: active.length,
            inStock: active.filter((p) => Number(p.stock) > 0).length,
            outOfStock: active.filter((p) => Number(p.stock) <= 0).length
        };
    }, [data.products]);

    const contentTitle = current.label === "Overview"
        ? "Dashboard Overview"
        : `${current.label} Management`;

    // =====================================
    // MAIN UI
    // =====================================

    return (
        <div className="admin-dashboard admin-workspace">

            {sidebarOpen && (
                <button
                    className="admin-sidebar-overlay"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}

            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>

                <div className="admin-brand">
                    <BrandLogo size={48} className="sq-logo--sidebar" />
                    <div>
                        <h2>SMARTTEQ</h2>
                        <span>ADMIN PANEL</span>
                    </div>
                </div>

                <div className="admin-menu-heading">MAIN MENU</div>

                <nav className="admin-navigation">
                    {MENU.map(({ label, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? "active" : ""}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={19} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-user">
                        <div className="admin-avatar"><span>K</span></div>
                        <div>
                            <strong>Super Admin</strong>
                            <span>Administrator</span>
                        </div>
                    </div>

                    <button className="admin-logout" onClick={logout}>
                        <LogOut size={17} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}

            <main className="admin-main">

                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            className="admin-mobile-menu"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu size={20} />
                        </button>

                        <div>
                            <h1>{contentTitle}</h1>
                            <p>Smartteq store management</p>
                        </div>
                    </div>

                    <div className="admin-topbar-right">
                        <button
                            className="admin-icon-button"
                            onClick={load}
                            disabled={loading}
                            aria-label="Refresh"
                        >
                            <RefreshCw
                                size={18}
                                className={loading ? "admin-spin" : ""}
                            />
                        </button>
                        <div className="admin-top-avatar"><span>K</span></div>
                    </div>
                </header>

                <section className="admin-content admin-module-content">

                    {error && (
                        <div className="admin-module-alert error" role="alert">
                            <AlertTriangle size={17} />
                            {error}
                            <button onClick={() => setError("")} aria-label="Dismiss">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {notice && (
                        <div className="admin-module-alert success" role="status">
                            <CheckCircle2 size={17} />
                            {notice}
                            <button onClick={() => setNotice("")} aria-label="Dismiss">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="admin-module-loading">
                            Loading {current.label.toLowerCase()}...
                        </div>
                    )}

                    <motion.div
                        key={section}
                        className="admin-motion-page"
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >

                    {/* DASHBOARD */}

                    {!loading && section === "dashboard" && (
                        <>
                            <div className="admin-welcome">
                                <div className="admin-welcome-text">
                                    <span>SMARTTEQ MANAGEMENT</span>
                                    <h2>Welcome back, Khawar!</h2>
                                    <p>Here's what's happening with your store today.</p>
                                </div>

                                {showHero ? (
                                    <div className="admin-welcome-3d" aria-hidden="true">
                                        <Suspense fallback={null}>
                                            <HeroScene3D />
                                        </Suspense>
                                    </div>
                                ) : (
                                    <div className="admin-welcome-icon">
                                        <LayoutDashboard size={35} />
                                    </div>
                                )}
                            </div>

                            <motion.div
                                className="admin-stats-grid"
                                initial={reduceMotion ? false : "hidden"}
                                animate="show"
                                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                            >
                                {[
                                    ["Total Revenue", stats.revenue, money, "Delivered orders", TrendingUp],
                                    ["Total Orders", stats.totalOrders, count, `${stats.pendingOrders || 0} pending`, ShoppingCart],
                                    ["Total Products", stats.totalProducts, count, `${stats.totalStock || 0} units in stock`, Package],
                                    ["Total Customers", stats.totalCustomers, count, "Unique customers", Users]
                                ].map(([label, value, format, detail, Icon]) => (
                                    <TiltCard key={label}>
                                        <div className="admin-stat-top">
                                            <span>{label}</span>
                                            <div className="admin-stat-icon"><Icon size={19} /></div>
                                        </div>
                                        <h3><CountUp value={value} format={format} /></h3>
                                        <small>{detail}</small>
                                    </TiltCard>
                                ))}
                            </motion.div>

                            <DashboardCharts stats={stats} orders={data.recentOrders || []} />

                            <div className="admin-panel-card">
                                <div className="admin-module-heading">
                                    <div>
                                        <h3>Recent Orders</h3>
                                        <p>Latest customer purchases</p>
                                    </div>
                                    <NavLink to="/admin/orders">View all orders</NavLink>
                                </div>

                                <Table
                                    headers={["Order ID", "Customer", "Date", "Amount", "Status"]}
                                    empty="No orders found yet."
                                    rows={data.recentOrders || []}
                                >
                                    {(data.recentOrders || []).map((o) => (
                                        <tr key={o.orderId}>
                                            <td>{o.orderId}</td>
                                            <td>{o.customerName}</td>
                                            <td>{date(o.createdAt)}</td>
                                            <td>{money(o.total)}</td>
                                            <td><Status value={o.status} /></td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </>
                    )}

                    {/* PRODUCTS */}

                    {!loading && section === "products" && (
                        <>
                            <div className="admin-module-toolbar">
                                <div>
                                    <h2>All Products</h2>
                                    <p>Manage your online store catalogue.</p>
                                </div>

                                <button className="admin-primary-button" onClick={openNewProduct}>
                                    <Plus size={17} />
                                    Add Product
                                </button>
                            </div>

                            <div className="admin-product-summary">
                                <div>
                                    <span>Total Products</span>
                                    <strong>{productStats.total}</strong>
                                </div>
                                <div>
                                    <span>In Stock</span>
                                    <strong>{productStats.inStock}</strong>
                                </div>
                                <div>
                                    <span>Out of Stock</span>
                                    <strong>{productStats.outOfStock}</strong>
                                </div>
                            </div>

                            <SearchBox
                                value={search}
                                onChange={setSearch}
                                placeholder="Search product, brand or category..."
                            />

                            <Table
                                headers={["Product", "Category", "Price", "Stock", "Status", "Actions"]}
                                empty="No products found. Add your first product."
                                rows={filteredProducts}
                            >
                                {filteredProducts.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="admin-product-cell">
                                                {p.image ? (
                                                    <img
                                                        src={getImageUrl(p.image)}
                                                        alt={p.name}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="admin-product-placeholder">
                                                        <Package size={18} />
                                                    </div>
                                                )}
                                                <div>
                                                    <strong>{p.name}</strong>
                                                    <small>{p.brand || "No brand"} · #{p.id}</small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{p.category}</td>

                                        <td>
                                            {money(p.price)}
                                            {p.oldPrice ? (
                                                <small className="admin-old-price">
                                                    {money(p.oldPrice)}
                                                </small>
                                            ) : null}
                                        </td>

                                        <td>{p.stock}</td>

                                        <td>
                                            <Status value={
                                                p.isActive
                                                    ? (p.stock > 0 ? "Active" : "Out of stock")
                                                    : "Archived"
                                            } />
                                        </td>

                                        <td>
                                            <div className="admin-action-buttons">
                                                <button
                                                    title="Edit"
                                                    aria-label="Edit product"
                                                    onClick={() => openEditProduct(p)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    title="Archive"
                                                    aria-label="Archive product"
                                                    onClick={() => archiveProduct(p)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </>
                    )}

                    {/* ORDERS */}

                    {!loading && section === "orders" && (
                        <>
                            <div className="admin-module-toolbar">
                                <div>
                                    <h2>Customer Orders</h2>
                                    <p>Review orders and update fulfilment status.</p>
                                </div>
                            </div>

                            <SearchBox
                                value={search}
                                onChange={setSearch}
                                placeholder="Search order ID, customer or phone..."
                            />

                            <Table
                                headers={["Order ID", "Customer", "Phone", "Date", "Total", "Status", "Update"]}
                                empty="No orders match your search."
                                rows={data.orders || []}
                            >
                                {(data.orders || []).map((o) => (
                                    <tr key={o.orderId}>
                                        <td><strong>{o.orderId}</strong></td>
                                        <td>{o.customerName}</td>
                                        <td>{o.phone}</td>
                                        <td>{date(o.createdAt)}</td>
                                        <td>{money(o.total)}</td>
                                        <td><Status value={o.status} /></td>
                                        <td>
                                            <select
                                                className="admin-inline-select"
                                                value={o.status}
                                                onChange={(e) => updateOrder(o.orderId, e.target.value)}
                                            >
                                                <option>Pending</option>
                                                <option>Processing</option>
                                                <option>Shipped</option>
                                                <option>Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </>
                    )}

                    {/* CUSTOMERS */}

                    {!loading && section === "customers" && (
                        <>
                            <div className="admin-module-toolbar">
                                <div>
                                    <h2>Customers</h2>
                                    <p>Customer records grouped by name and phone from placed orders.</p>
                                </div>
                            </div>

                            <SearchBox
                                value={search}
                                onChange={setSearch}
                                placeholder="Search customer, email or phone..."
                            />

                            <Table
                                headers={["Customer", "Phone", "Email", "City", "Orders", "Total Spent", "Last Order"]}
                                empty="No customer records found."
                                rows={data.customers || []}
                            >
                                {(data.customers || []).map((c, i) => (
                                    <tr key={`${c.phone}-${i}`}>
                                        <td><strong>{c.name}</strong></td>
                                        <td>{c.phone}</td>
                                        <td>{c.email || "—"}</td>
                                        <td>{c.city || "—"}</td>
                                        <td>{c.totalOrders}</td>
                                        <td>{money(c.totalSpent)}</td>
                                        <td>{date(c.lastOrder)}</td>
                                    </tr>
                                ))}
                            </Table>
                        </>
                    )}

                    {/* INVENTORY */}

                    {!loading && section === "inventory" && (
                        <>
                            <div className="admin-module-toolbar">
                                <div>
                                    <h2>Inventory Control</h2>
                                    <p>Update quantities and monitor low stock.</p>
                                </div>
                            </div>

                            <div className="admin-inventory-summary">
                                <div>
                                    <span>Products tracked</span>
                                    <strong>{(data.inventory || []).length}</strong>
                                </div>
                                <div>
                                    <span>Low stock (5 or less)</span>
                                    <strong>
                                        {(data.inventory || []).filter((p) => p.stock <= 5).length}
                                    </strong>
                                </div>
                                <div>
                                    <span>Total units</span>
                                    <strong>
                                        {(data.inventory || []).reduce(
                                            (n, p) => n + Number(p.stock || 0), 0
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <Table
                                headers={["Product", "SKU", "Category", "Current Stock", "Stock Level", "Save"]}
                                empty="No inventory records found."
                                rows={data.inventory || []}
                            >
                                {(data.inventory || []).map((p) => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong></td>
                                        <td>{p.sku}</td>
                                        <td>{p.category}</td>
                                        <td>
                                            <input
                                                className="admin-stock-input"
                                                type="number"
                                                inputMode="numeric"
                                                min="0"
                                                step="1"
                                                value={stockEdit[p.id] ?? p.stock}
                                                onChange={(e) => setStockEdit((v) => ({
                                                    ...v,
                                                    [p.id]: e.target.value
                                                }))}
                                            />
                                        </td>
                                        <td>
                                            <Status value={
                                                p.stock <= 0
                                                    ? "Out of stock"
                                                    : p.stock <= 5
                                                        ? "Low stock"
                                                        : "In stock"
                                            } />
                                        </td>
                                        <td>
                                            <button
                                                className="admin-small-button"
                                                onClick={() => saveStock(p.id)}
                                                disabled={
                                                    Number(stockEdit[p.id] ?? p.stock) === Number(p.stock)
                                                }
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </>
                    )}

                    {/* CATEGORIES */}

                    {!loading && section === "categories" && (
                        <>
                            <div className="admin-module-toolbar">
                                <div>
                                    <h2>Product Categories</h2>
                                    <p>Create, rename and organize product categories.</p>
                                </div>

                                <button
                                    className="admin-primary-button"
                                    onClick={() => {
                                        setCategoryForm({ name: "", oldId: null });
                                        setReturnToProduct(false);
                                        setCategoryModal(true);
                                    }}
                                >
                                    <Plus size={17} />
                                    Add Category
                                </button>
                            </div>

                            <Table
                                headers={["Category", "Products", "Actions"]}
                                empty="No categories found."
                                rows={data.categories || []}
                            >
                                {(data.categories || []).map((c) => (
                                    <tr key={c.id}>
                                        <td><strong>{c.name}</strong></td>
                                        <td>{Number(c.productCount || 0)}</td>
                                        <td>
                                            <div className="admin-action-buttons">
                                                <button
                                                    title="Rename"
                                                    aria-label="Rename category"
                                                    onClick={() => {
                                                        setCategoryForm({
                                                            name: c.name,
                                                            oldId: c.id
                                                        });
                                                        setReturnToProduct(false);
                                                        setCategoryModal(true);
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    aria-label="Delete category"
                                                    onClick={() => deleteCategory(c)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </>
                    )}

                    {/* REVIEWS */}

                    {!loading && section === "reviews" && (
                        <>
                            <div className="admin-module-toolbar">
                                <div>
                                    <h2>Customer Reviews</h2>
                                    <p>Approve reviews before displaying them publicly.</p>
                                </div>
                            </div>

                            <Table
                                headers={["Customer", "Review", "Rating", "Date", "Visibility", "Actions"]}
                                empty="No reviews available. The reviews table is ready for future submissions."
                                rows={data.reviews || []}
                            >
                                {(data.reviews || []).map((r) => (
                                    <tr key={r.id}>
                                        <td><strong>{r.customerName}</strong></td>
                                        <td className="admin-review-text">{r.reviewText}</td>
                                        <td>
                                            {"★".repeat(Number(r.rating || 0))}
                                            {"☆".repeat(Math.max(0, 5 - Number(r.rating || 0)))}
                                        </td>
                                        <td>{date(r.createdAt)}</td>
                                        <td>
                                            <Status value={r.isApproved ? "Approved" : "Pending"} />
                                        </td>
                                        <td>
                                            <div className="admin-action-buttons">
                                                <button
                                                    title={r.isApproved ? "Hide review" : "Approve review"}
                                                    aria-label={r.isApproved ? "Hide review" : "Approve review"}
                                                    onClick={() => approveReview(r, !r.isApproved)}
                                                >
                                                    {r.isApproved
                                                        ? <EyeOff size={16} />
                                                        : <Eye size={16} />
                                                    }
                                                </button>
                                                <button
                                                    title="Delete"
                                                    aria-label="Delete review"
                                                    onClick={() => deleteReview(r)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </>
                    )}

                    {/* SETTINGS */}

                    {!loading && section === "settings" && (
                        <>
                            <div className="admin-module-toolbar">
                                <div>
                                    <h2>Admin Settings</h2>
                                    <p>Manage your admin account security.</p>
                                </div>
                            </div>

                            <div className="admin-settings-card">
                                <div className="admin-settings-icon">
                                    <Settings size={25} />
                                </div>

                                <div>
                                    <h3>Change Admin Password</h3>
                                    <p>
                                        Use a strong password with at least 12 characters.
                                        You will be signed out after changing it.
                                    </p>
                                </div>

                                <form onSubmit={changePassword} className="admin-settings-form">
                                    <label>
                                        Current password
                                        <input
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm((v) => ({
                                                ...v,
                                                currentPassword: e.target.value
                                            }))}
                                        />
                                    </label>

                                    <label>
                                        New password
                                        <div className="admin-password-field">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                minLength="12"
                                                required
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm((v) => ({
                                                    ...v,
                                                    newPassword: e.target.value
                                                }))}
                                            />
                                            <button
                                                type="button"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                onClick={() => setShowPassword((v) => !v)}
                                            >
                                                {showPassword
                                                    ? <EyeOff size={17} />
                                                    : <Eye size={17} />
                                                }
                                            </button>
                                        </div>
                                    </label>

                                    <label>
                                        Confirm new password
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            minLength="12"
                                            required
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm((v) => ({
                                                ...v,
                                                confirmPassword: e.target.value
                                            }))}
                                        />
                                    </label>

                                    <button className="admin-primary-button" type="submit">
                                        <Save size={17} />
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    </motion.div>

                </section>
            </main>

            {/* PRODUCT MODAL */}

            {productModal && (
                <div
                    className="admin-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !uploadingImage && !savingProduct) {
                            setProductModal(false);
                        }
                    }}
                >
                    <form className="admin-module-modal" onSubmit={saveProduct}>

                        <div className="admin-modal-header">
                            <div>
                                <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
                                <p>Enter product details for the Smartteq store.</p>
                            </div>

                            <button
                                type="button"
                                aria-label="Close"
                                disabled={uploadingImage || savingProduct}
                                onClick={() => setProductModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-form-grid">

                            <label>
                                Product name *
                                <input
                                    required
                                    maxLength="255"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        name: e.target.value
                                    }))}
                                />
                            </label>

                            <label>
                                Brand
                                <input
                                    value={productForm.brand}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        brand: e.target.value
                                    }))}
                                />
                            </label>

                            <label>
                                Category *
                                <select
                                    required
                                    value={productForm.category}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        category: e.target.value
                                    }))}
                                >
                                    <option value="">Select category</option>
                                    {(data.categories || []).map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className="admin-small-button"
                                    onClick={() => {
                                        setCategoryForm({ name: "", oldId: null });
                                        setReturnToProduct(true);
                                        setCategoryModal(true);
                                    }}
                                >
                                    <Plus size={15} />
                                    Add New Category
                                </button>
                            </label>

                            <label>
                                Price (PKR) *
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min="1"
                                    step="0.01"
                                    required
                                    value={productForm.price}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        price: e.target.value
                                    }))}
                                />
                            </label>

                            <label>
                                Old price (PKR)
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    value={productForm.oldPrice}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        oldPrice: e.target.value
                                    }))}
                                />
                            </label>

                            <label>
                                Stock quantity *
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    required
                                    value={productForm.stock}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        stock: e.target.value
                                    }))}
                                />
                            </label>

                            {/* IMAGE UPLOAD */}

                            <label className="admin-form-full">
                                Product Image

                                <input
                                    type="url"
                                    placeholder="https://example.com/product-image.jpg"
                                    value={
                                        /^https?:\/\//i.test(productForm.image)
                                            ? productForm.image
                                            : ""
                                    }
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        image: e.target.value
                                    }))}
                                />

                                <div className="admin-image-upload">
                                    <label className="admin-secondary-button">
                                        <Upload size={17} />
                                        {uploadingImage ? "Uploading..." : "Choose Image from Device"}

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            hidden
                                            disabled={uploadingImage || savingProduct}
                                            onChange={uploadProductImage}
                                        />
                                    </label>

                                    <small>
                                        JPG, PNG, WEBP or GIF. Maximum 5 MB.
                                    </small>
                                </div>

                                {productForm.image && (
                                    <div className="admin-image-preview">
                                        <img
                                            src={getImageUrl(productForm.image)}
                                            alt="Product preview"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />

                                        <button
                                            type="button"
                                            className="admin-secondary-button"
                                            disabled={uploadingImage || savingProduct}
                                            onClick={() => setProductForm((v) => ({
                                                ...v,
                                                image: ""
                                            }))}
                                        >
                                            <Trash2 size={15} />
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                            </label>

                            <label className="admin-form-full">
                                Description
                                <textarea
                                    rows="3"
                                    value={productForm.description}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        description: e.target.value
                                    }))}
                                />
                            </label>

                            <label className="admin-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={productForm.featured}
                                    onChange={(e) => setProductForm((v) => ({
                                        ...v,
                                        featured: e.target.checked
                                    }))}
                                />
                                Show as featured product
                            </label>

                        </div>

                        <div className="admin-modal-actions">
                            <button
                                type="button"
                                className="admin-secondary-button"
                                disabled={uploadingImage || savingProduct}
                                onClick={() => setProductModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="admin-primary-button"
                                type="submit"
                                disabled={uploadingImage || savingProduct}
                            >
                                <Save size={17} />
                                {savingProduct
                                    ? "Saving..."
                                    : editingProduct
                                        ? "Update Product"
                                        : "Save Product"
                                }
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* CATEGORY MODAL */}

            {categoryModal && (
                <div
                    className="admin-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setCategoryModal(false);
                            setReturnToProduct(false);
                        }
                    }}
                >
                    <form
                        className="admin-module-modal admin-category-modal"
                        onSubmit={saveCategory}
                    >
                        <div className="admin-modal-header">
                            <div>
                                <h2>
                                    {categoryForm.oldId ? "Rename Category" : "Add Category"}
                                </h2>
                                <p>Categories are used to organize products.</p>
                            </div>

                            <button
                                type="button"
                                aria-label="Close"
                                onClick={() => {
                                    setCategoryModal(false);
                                    setReturnToProduct(false);
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <label>
                            Category name *
                            <input
                                autoFocus
                                required
                                maxLength="100"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm((v) => ({
                                    ...v,
                                    name: e.target.value
                                }))}
                            />
                        </label>

                        <div className="admin-modal-actions">
                            <button
                                type="button"
                                className="admin-secondary-button"
                                onClick={() => {
                                    setCategoryModal(false);
                                    setReturnToProduct(false);
                                }}
                            >
                                Cancel
                            </button>

                            <button className="admin-primary-button" type="submit">
                                <Save size={17} />
                                Save Category
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}

// =====================================
// COUNT-UP NUMBER (display only)
// =====================================

function CountUp({ value, format }) {
    const reduceMotion = useReducedMotion();
    const target = Number(value) || 0;
    const [shown, setShown] = useState(reduceMotion ? target : 0);

    useEffect(() => {
        if (reduceMotion) {
            setShown(target);
            return undefined;
        }

        const controls = animate(0, target, {
            duration: 1.1,
            ease: "easeOut",
            onUpdate: (v) => setShown(v)
        });

        return () => controls.stop();
    }, [target, reduceMotion]);

    return <>{format(Math.round(shown))}</>;
}

// =====================================
// STAT CARD WITH 3D TILT (display only)
// =====================================

function TiltCard({ children }) {
    const reduceMotion = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 20 });

    const onMove = (e) => {
        if (e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className="admin-stat-card"
            variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
            }}
            style={reduceMotion ? undefined : { rotateX, rotateY }}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
        >
            {children}
        </motion.div>
    );
}

// =====================================
// SEARCH BOX
// =====================================

function SearchBox({ value, onChange, placeholder }) {
    return (
        <div className="admin-module-search">
            <Search size={18} />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

// =====================================
// STATUS
// =====================================

function Status({ value }) {
    const kind = String(value || "")
        .toLowerCase()
        .replaceAll(" ", "-");

    return (
        <span className={`admin-module-status status-${kind}`}>
            {value || "—"}
        </span>
    );
}

// =====================================
// TABLE (becomes cards on phones; labels come from headers)
// =====================================

function Table({ headers, empty, rows = [], children }) {
    const labelled = Children.map(children, (row) =>
        isValidElement(row)
            ? cloneElement(
                row,
                undefined,
                Children.map(row.props.children, (cell, i) =>
                    isValidElement(cell)
                        ? cloneElement(cell, { "data-label": headers[i] })
                        : cell
                )
            )
            : row
    );

    return (
        <div className="admin-panel-card admin-module-table-wrap">
            <div className="admin-orders-table admin-orders-table--cards">
                <table>
                    <thead>
                        <tr>
                            {headers.map((h) => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>

                    {rows.length > 0 && (
                        <tbody>{labelled}</tbody>
                    )}
                </table>

                {rows.length === 0 && (
                    <div className="admin-empty-state">
                        {empty}
                    </div>
                )}
            </div>
        </div>
    );
}

// =====================================
// DASHBOARD CHARTS (real data, display only)
// =====================================

function DashboardCharts({ stats, orders }) {
    const points = [...orders]
        .filter((o) => Number(o.total) > 0)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((o) => Number(o.total));

    const W = 520;
    const H = 200;
    const P = 22;
    const max = Math.max(...points, 1);
    const step = points.length > 1 ? (W - P * 2) / (points.length - 1) : 0;
    const xy = points.map((v, i) => [
        Math.round((P + i * step) * 10) / 10,
        Math.round((H - P - (v / max) * (H - P * 2)) * 10) / 10
    ]);

    let line = "";
    xy.forEach(([x, y], i) => {
        if (i === 0) {
            line = `M${x} ${y}`;
            return;
        }
        const [px, py] = xy[i - 1];
        const mid = (px + x) / 2;
        line += ` C${mid} ${py}, ${mid} ${y}, ${x} ${y}`;
    });

    const area = xy.length > 1
        ? `${line} L${xy[xy.length - 1][0]} ${H - P} L${xy[0][0]} ${H - P} Z`
        : "";

    const delivered = Number(stats.deliveredOrders || 0);
    const pending = Number(stats.pendingOrders || 0);
    const total = Number(stats.totalOrders || 0);
    const other = Math.max(0, total - delivered - pending);
    const sum = delivered + pending + other;

    let offset = 0;
    const segs = [
        ["Delivered", delivered, "#4ade80"],
        ["Pending", pending, "#fbbf24"],
        ["In progress", other, "#38bdf8"]
    ].map(([label, value, color]) => {
        const len = sum ? (value / sum) * 100 : 0;
        const seg = { label, value, color, len, start: offset };
        offset += len;
        return seg;
    });

    return (
        <div className="admin-charts-row">

            <div className="admin-panel-card admin-chart-card">
                <div className="admin-chart-head">
                    <div>
                        <h3>Revenue Trend</h3>
                        <p>Based on your latest {points.length} orders</p>
                    </div>
                    <span className="admin-chart-value">
                        {money(points.reduce((n, v) => n + v, 0))}
                    </span>
                </div>

                {points.length < 2 ? (
                    <div className="admin-empty-state">
                        More orders are needed to draw a trend.
                    </div>
                ) : (
                    <div className="admin-trend">
                        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue trend chart">
                            <defs>
                                <linearGradient id="sqArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" stopColor="#22d3ee" stopOpacity="0.45" />
                                    <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {[0, 1, 2, 3].map((k) => (
                                <line
                                    key={k}
                                    className="grid"
                                    x1={P}
                                    x2={W - P}
                                    y1={H - P - (k * (H - P * 2)) / 3}
                                    y2={H - P - (k * (H - P * 2)) / 3}
                                />
                            ))}

                            <path className="area" d={area} />
                            <path className="line" pathLength="1" d={line} />

                            {xy.map(([x, y], i) => (
                                <circle
                                    key={i}
                                    className="dot"
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    style={{ animationDelay: `${0.4 + i * 0.12}s` }}
                                />
                            ))}
                        </svg>
                    </div>
                )}
            </div>

            <div className="admin-panel-card admin-chart-card">
                <div className="admin-chart-head">
                    <div>
                        <h3>Order Status</h3>
                        <p>Live split of all orders</p>
                    </div>
                </div>

                <div className="admin-donut-wrap">
                    <div className="admin-donut-box">
                        <svg className="admin-donut" viewBox="0 0 36 36" role="img" aria-label="Order status chart">
                            <circle className="track" cx="18" cy="18" r="15.9155" />
                            {segs.filter((x) => x.len > 0).map((x) => {
                                const a = Math.max(x.len - 1.2, 0.01);

                                return (
                                    <circle
                                        key={x.label}
                                        className="seg"
                                        cx="18"
                                        cy="18"
                                        r="15.9155"
                                        pathLength="100"
                                        stroke={x.color}
                                        strokeDashoffset={-x.start}
                                        style={{ "--a": a, "--b": 100 - a, color: x.color }}
                                    />
                                );
                            })}
                        </svg>

                        <div className="admin-donut-center">
                            <strong>{count(total)}</strong>
                            <span>Orders</span>
                        </div>
                    </div>

                    <ul className="admin-donut-legend">
                        {segs.map((x) => (
                            <li key={x.label}>
                                <i style={{ background: x.color, boxShadow: `0 0 10px ${x.color}` }} />
                                <span>{x.label}</span>
                                <b>{count(x.value)}</b>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}
