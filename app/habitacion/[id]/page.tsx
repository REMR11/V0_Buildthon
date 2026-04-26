import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotoGallery from "@/components/room/PhotoGallery";
import RoomHeader from "@/components/room/RoomHeader";
import PriceTag from "@/components/room/PriceTag";
import TagsRow from "@/components/room/TagsRow";
import AboutRoom from "@/components/room/AboutRoom";
import MapPlaceholder from "@/components/room/MapPlaceholder";
import HouseRules from "@/components/room/HouseRules";
import IncludedServices from "@/components/room/IncludedServices";
import OwnerCard from "@/components/room/OwnerCard";
import ReviewsSection from "@/components/room/ReviewsSection";
import Sidebar from "@/components/room/Sidebar";

export const metadata: Metadata = {
  title: "Habitación amueblada en Condesa — Nidoo",
  description:
    "Habitación luminosa y amueblada en La Condesa, Ciudad de México. Baño privado, internet incluido, y servicios. Disponible desde junio 2025.",
};

export default async function RoomDetailPage() {
  return (
    <main>
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-5">
          {/* Desktop: 60/40 split. Mobile: stacked */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Left / main column */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">
              <PhotoGallery />
              <RoomHeader />
              {/* Mobile-only price (hidden on desktop, shown in sidebar) */}
              <div className="lg:hidden">
                <PriceTag />
              </div>
              <TagsRow />
              <MapPlaceholder />
              <AboutRoom />
              <HouseRules />
              <IncludedServices />
              <OwnerCard />
              <ReviewsSection />
            </div>

            {/* Right / sticky sidebar */}
            <div className="hidden lg:block w-[340px] shrink-0">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </div>
          </div>

          {/* Mobile fixed bottom CTA bar */}
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-lg font-bold text-primary">$6,500</span>
                <span className="text-muted text-xs ml-1">MXN / mes</span>
              </div>
              <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm">
                Solicitar habitación
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
