"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Bus, GraduationCap, Hospital, ShoppingCart, Trees } from "lucide-react";
import type { Listing } from "@/lib/listings";

const ZoneMap = dynamic(() => import("./ZoneMap"), { ssr: false });

type NearbyPlace = Listing["location"]["nearbyPlaces"][number];

const TYPE_ICONS: Record<NearbyPlace["type"], React.ElementType> = {
  universidad: GraduationCap,
  hospital: Hospital,
  supermercado: ShoppingCart,
  transporte: Bus,
  parque: Trees,
};

export default function RoomLocation({ location }: { location: Listing["location"] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? location.nearbyPlaces : location.nearbyPlaces.slice(0, 4);

  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="font-serif text-xl font-bold text-foreground mb-1">Zona aproximada</h2>
      <p className="text-sm text-muted mb-4">
        La dirección exacta se comparte al confirmar la solicitud.
      </p>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden h-64 mb-5 border border-border">
        <ZoneMap lat={location.lat} lng={location.lng} />
      </div>

      {/* Nearby places */}
      <ul className="space-y-3">
        {visible.map((place) => {
          const Icon = TYPE_ICONS[place.type];
          return (
            <li key={place.name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-muted" />
              </div>
              <span className="text-sm text-foreground flex-1">{place.name}</span>
              <span className="text-xs text-muted font-medium flex items-center gap-1 flex-shrink-0">
                <MapPin size={11} />
                {place.distanceMin} min
              </span>
            </li>
          );
        })}
      </ul>

      {location.nearbyPlaces.length > 4 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-sm font-semibold underline underline-offset-2"
          style={{ color: "#D85A30" }}
        >
          {showAll ? "Ver menos" : `Ver ${location.nearbyPlaces.length - 4} más`}
        </button>
      )}
    </section>
  );
}
