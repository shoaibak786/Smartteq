import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";
import BrandLogo from "./BrandLogo";
import "./Admin.css";
import "./AdminPremium.css";

/* 3D background loads only on large screens (design only) */
const HeroScene3D = lazy(() => import("./HeroScene3D"));

function useWideScreen() {
    const [wide, setWide] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches
    );

    useEffect(() => {
        const query = window.matchMedia("(min-width: 900px)");
        const onChange = (e) => setWide(e.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    return wide;
}

export default function AdminLogin() {
    const navigate = useNavigate();
    const wide = useWideScreen();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ---------- design only: tilt + spotlight following the mouse ---------- */
    const tiltRef = useRef(null);

    const handleMove = (e) => {
        const el = tiltRef.current;
        if (!el || window.matchMedia("(pointer: coarse)").matches) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
        el.style.setProperty("--rx", `${(0.5 - y) * 7}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
    };

    const handleLeave = () => {
        const el = tiltRef.current;
        if (!el) return;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
    };

    /* ---------- design only: floating particles ---------- */
    const particles = useMemo(
        () =>
            Array.from({ length: 26 }, (_, i) => ({
                left: `${(i * 37) % 100}%`,
                size: 2 + ((i * 5) % 4),
                dur: 14 + ((i * 7) % 12),
                delay: -((i * 3) % 16)
            })),
        []
    );

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed.");
            }

            sessionStorage.setItem("smartteq_admin_token", data.token);

            navigate("/admin/dashboard");

        } catch (err) {
            setError(err.message || "Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">

            {/* design only: aurora and particles */}
            <div className="sq-login-fx" aria-hidden="true">
                <span className="sq-aurora sq-aurora--a" />
                <span className="sq-aurora sq-aurora--b" />
                {particles.map((p, i) => (
                    <i
                        key={i}
                        className="sq-particle"
                        style={{
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            animationDuration: `${p.dur}s`,
                            animationDelay: `${p.delay}s`
                        }}
                    />
                ))}
            </div>

            {wide && (
                <div className="admin-login-bg" aria-hidden="true">
                    <Suspense fallback={null}>
                        <HeroScene3D offsetX={2.6} />
                    </Suspense>
                </div>
            )}

            <div
                className="sq-tilt"
                ref={tiltRef}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
            >
                <div className="admin-login-card">

                    <span className="sq-scanline" aria-hidden="true" />

                    <div className="admin-login-logo sq-rise" style={{ "--d": "0.05s" }}>
                        <BrandLogo size={96} className="sq-logo--login" />
                    </div>

                    <h1 className="sq-rise sq-title" style={{ "--d": "0.15s" }}>Smartteq Admin</h1>
                    <p className="admin-login-subtitle sq-rise" style={{ "--d": "0.22s" }}>
                        Super Admin Control Panel
                    </p>

                    <form onSubmit={handleLogin}>

                        <div className="sq-rise" style={{ "--d": "0.3s" }}>
                            <label>Username</label>
                            <div className="admin-input-wrapper">
                                <User size={19} />
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="sq-rise" style={{ "--d": "0.38s" }}>
                            <label>Password</label>
                            <div className="admin-input-wrapper">
                                <Lock size={19} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="admin-login-error sq-shake" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="admin-login-button sq-rise"
                            style={{ "--d": "0.46s" }}
                            disabled={loading}
                        >
                            {loading && <span className="sq-btn-spinner" aria-hidden="true" />}
                            <span>{loading ? "Signing in..." : "Secure Login"}</span>
                        </button>

                    </form>

                    <div className="admin-login-footer sq-rise" style={{ "--d": "0.55s" }}>
                        <ShieldCheck size={14} />
                        Protected Super Admin Access
                        <span className="sq-live" aria-hidden="true" />
                    </div>

                </div>
            </div>
        </div>
    );
}