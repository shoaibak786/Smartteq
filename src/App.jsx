
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import FeaturedProducts from "./components/FeaturedProducts";
import WhyChooseUs from "./components/WhyChooseUs";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer"
import "./App.css";

export default function App() {
  return (
    <main className="site-shell">
      <Navbar />
      <HeroSection />
      <CategorySection/>
      <FeaturedProducts/>
       <WhyChooseUs />
       <FAQSection/>
       <Footer/>
    </main>
  );
}
