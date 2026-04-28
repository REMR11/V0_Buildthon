import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import TrustSignals from "@/components/TrustSignals";
import FeaturedRooms from "@/components/FeaturedRooms";
import FeaturedCities from "@/components/FeaturedCities";
import FAQ from "@/components/FAQ";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <TrustSignals />
      <FeaturedRooms />
      <FeaturedCities />
      <FAQ />
      <CtaBanner />
      <Footer />
    </main>
  );
}
