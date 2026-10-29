
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import FeaturedProducts from "./components/FeaturedProducts";
import WhyChooseUs from "./components/WhyChooseUs";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import Product from "./pages/Products";
import Repairing from "./pages/Repairing";
import Trackorder from "./pages/TrackOrder"
import About from "./pages/About"

import "./App.css";

function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <WhyChooseUs />
      <FAQSection />
    </>
  );
}

export default function App() {
  return (
    <main className="site-shell">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Product />} />
        <Route path="/repairing" element={<Repairing />} />
        <Route path="/track-order" element={<Trackorder />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <Footer />
    </main>
  );
}
