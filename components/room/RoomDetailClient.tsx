"use client";

import { useRef } from "react";
import type { Listing } from "@/lib/listings";
import RoomGallery from "./RoomGallery";
import RoomHeader from "./RoomHeader";
import RoomDescription from "./RoomDescription";
import RoomIncludes from "./RoomIncludes";
import RoomRules from "./RoomRules";
import RoomLocation from "./RoomLocation";
import RoomHost from "./RoomHost";
import RoomStickyBar from "./RoomStickyBar";

export default function RoomDetailClient({ room }: { room: Listing }) {
  const headerCardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background pt-[65px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-12">
        {/* Section 1 — Gallery */}
        <RoomGallery images={room.images} title={room.title} hostColor={room.hostColor} hostInitials={room.hostInitials} />

        {/* Section 2 — Header + price card */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <RoomHeader room={room} ref={headerCardRef} />

            {/* Section 3 — Description */}
            <RoomDescription
              description={room.description}
              roomSize={room.roomSize}
              floor={room.floor}
              availableFrom={room.availableFrom}
              minStay={room.minStay}
              contractType={room.contractType}
            />

            {/* Section 4 — Includes */}
            <RoomIncludes includes={room.includes} />

            {/* Section 5 — Rules */}
            <RoomRules rules={room.rules} />

            {/* Section 6 — Location */}
            <RoomLocation location={room.location} />

            {/* Section 7 — Host */}
            <RoomHost host={room.hostProfile} rating={room.rating} reviews={room.reviews} />
          </div>

          {/* Desktop sticky price card */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div
                ref={headerCardRef}
                className="rounded-2xl border border-border bg-card shadow-md p-6"
              >
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">${room.price}</span>
                  <span className="text-muted text-sm ml-1">/mes</span>
                </div>
                <p className="text-sm text-muted mb-6">
                  más depósito de <span className="font-semibold text-foreground">${room.deposit}</span>
                </p>
                <button
                  className="w-full py-3 rounded-full font-semibold text-white text-sm transition-colors mb-3"
                  style={{ background: "#D85A30" }}
                  onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "#c04f28")}
                  onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "#D85A30")}
                >
                  Solicitar esta habitación
                </button>
                <button className="w-full py-3 rounded-full font-semibold text-sm border border-border text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Guardar
                </button>
                <p className="text-xs text-center text-muted mt-4">No se te cobrará nada todavía</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <RoomStickyBar price={room.price} deposit={room.deposit} headerCardRef={headerCardRef} />
    </div>
  );
}
