
import { Routes, Route, Outlet } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import FeaturedProducts from "./components/FeaturedProducts";
import WhyChooseUs from "./components/WhyChooseUs";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import Customerreviews from "./components/CustomerReviews";

import Product from "./pages/Products";
import Repairing from "./pages/Repairing";
import Trackorder from "./pages/TrackOrder";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminPanel from "./admin/AdminPanel";

import { CartProvider } from "./context/CartContext";

import "./App.css";

function HomePage() {
    return (
        <>
            <HeroSection />
            <CategorySection />
            <FeaturedProducts />
            <WhyChooseUs />
            <Customerreviews />
            <FAQSection />
        </>
    );
}

function PublicLayout() {
    return (
        <main className="site-shell">
            <Navbar />
            <Outlet />
            <Footer />
        </main>
    );
}

export default function App() {
    return (
        <CartProvider>
            <Routes>
                {/* ADMIN LOGIN */}
                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />

                {/* PROTECTED ADMIN WORKSPACE */}
                <Route element={<AdminLayout />}>
                    <Route
                        path="/admin/*"
                        element={<AdminPanel />}
                    />
                </Route>

                {/* PUBLIC WEBSITE */}
                <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products" element={<Product />} />
                    <Route path="repairing" element={<Repairing />} />
                    <Route path="track-order" element={<Trackorder />} />
                    <Route
                        path="track-order/:token"
                        element={<Trackorder />}
                    />
                    <Route path="about" element={<About />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route
                        path="product/:id"
                        element={<ProductDetails />}
                    />
                </Route>
            </Routes>
        </CartProvider>
    );
}
