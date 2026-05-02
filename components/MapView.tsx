"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Listing } from "@/lib/listings";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [13.6929, -89.2182];
const DEFAULT_ZOOM = 13;

const C = {
  primary: "#D85A30",
  primaryText: "#ffffff",
  card: "#ffffff",
  border: "#e2cbb5",
  muted: "#9e7a5a",
  foreground: "#2c1a0e",
  teal: "#1a7a6a",
};

// ─── Price pill divIcon ───────────────────────────────────────────────────────
function makePillIcon(listing: Listing, active: boolean) {
  const bg = !listing.available
    ? "#d1ccc7"
    : active
    ? C.primary
    : C.card;
  const color = !listing.available
    ? "#888"
    : active
    ? C.primaryText
    : C.primary;
  const border = !listing.available ? "#bbb" : C.primary;
  const opacity = !listing.available ? 0.65 : 1;
  const scale = active ? "scale(1.12)" : "scale(1)";
  const shadow = active
    ? "0 4px 16px rgba(216,90,48,0.35)"
    : "0 2px 8px rgba(44,26,14,0.13)";
  const fontWeight = active ? "700" : "600";

  return L.divIcon({
    className: "",
    iconAnchor: [32, 18],
    html: `
      <div style="
        display:inline-flex;align-items:center;gap:2px;
        background:${bg};
        color:${color};
        border:2px solid ${border};
        border-radius:999px;
        padding:5px 11px;
        font-size:13px;
        font-weight:${fontWeight};
        font-family:inherit;
        white-space:nowrap;
        box-shadow:${shadow};
        opacity:${opacity};
        transform:${scale};
        transition:transform 0.15s,box-shadow 0.15s;
        cursor:pointer;
      ">$${listing.price}</div>`,
  });
}

// ─── Popup HTML string ────────────────────────────────────────────────────────
function makePopupHtml(listing: Listing) {
  const stars = "★".repeat(Math.round(listing.rating)) + "☆".repeat(5 - Math.round(listing.rating));
  const amenityTags = listing.amenities
    .slice(0, 3)
    .map(
      (a) =>
        `<span style="background:#f0e4d7;color:#9e7a5a;border-radius:999px;padding:2px 8px;font-size:11px;">${a}</span>`
    )
    .join("");

  return `
    <div style="width:260px;font-family:inherit;">
      <div style="
        background:${listing.hostColor};
        height:100px;
        border-radius:10px 10px 0 0;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:2rem;
        font-weight:700;
        color:#fff;
        letter-spacing:0.04em;
      ">${listing.hostInitials}</div>
      <div style="padding:12px 14px 14px;">
        <div style="font-weight:600;font-size:14px;color:${C.foreground};margin-bottom:2px;line-height:1.3;">${listing.title}</div>
        <div style="font-size:12px;color:${C.muted};margin-bottom:6px;">${listing.neighborhood} · ${listing.city}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:16px;font-weight:700;color:${C.primary};">$${listing.price}<span style="font-size:11px;font-weight:400;color:${C.muted};">/mes</span></span>
          <span style="font-size:12px;color:#f5a623;">${stars}</span>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">${amenityTags}</div>
        <a href="/habitacion/${listing.slug}" style="
          display:block;
          text-align:center;
          background:${C.primary};
          color:#fff;
          border-radius:999px;
          padding:8px 0;
          font-size:13px;
          font-weight:600;
          text-decoration:none;
        ">Ver habitación →</a>
      </div>
    </div>`;
}

// ─── Inner map component (needs useMap) ───────────────────────────────────────
interface InnerMapProps {
  listings: Listing[];
  activeListing: Listing | null;
  onMarkerClick: (listing: Listing) => void;
  flyTarget: { lat: number; lng: number; zoom: number } | null;
  resetCenter: boolean;
  onResetDone: () => void;
}

function InnerMap({
  listings,
  activeListing,
  onMarkerClick,
  flyTarget,
  resetCenter,
  onResetDone,
}: InnerMapProps) {
  const map = useMap();
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const popupsRef = useRef<Map<number, L.Popup>>(new Map());

  // Apply warm tile filter
  useEffect(() => {
    const pane = map.getPane("tilePane");
    if (pane) {
      pane.style.filter = "saturate(0.85) brightness(1.02)";
    }
  }, [map]);

  // Fly to target when flyTarget changes
  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom, {
        duration: 0.9,
        easeLinearity: 0.25,
      });
    }
  }, [map, flyTarget]);

  // Reset center
  useEffect(() => {
    if (resetCenter) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.9 });
      onResetDone();
    }
  }, [map, resetCenter, onResetDone]);

  // Manage markers
  useEffect(() => {
    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      const still = listings.find((l) => l.id === id);
      if (!still) {
        marker.remove();
        markersRef.current.delete(id);
        popupsRef.current.delete(id);
      }
    });

    // Add / update markers
    listings.forEach((listing) => {
      const isActive = activeListing?.id === listing.id;
      const existing = markersRef.current.get(listing.id);

      if (existing) {
        existing.setIcon(makePillIcon(listing, isActive));
      } else {
        const popup = L.popup({
          maxWidth: 280,
          minWidth: 260,
          closeButton: true,
          className: "nidoo-popup",
          offset: [0, -8],
        }).setContent(makePopupHtml(listing));

        const marker = L.marker([listing.lat, listing.lng], {
          icon: makePillIcon(listing, isActive),
        })
          .addTo(map)
          .bindPopup(popup)
          .on("click", () => onMarkerClick(listing));

        markersRef.current.set(listing.id, marker);
        popupsRef.current.set(listing.id, popup);
      }
    });
  }, [listings, activeListing, map, onMarkerClick]);

  // Open popup for active listing
  useEffect(() => {
    if (!activeListing) return;
    const marker = markersRef.current.get(activeListing.id);
    if (marker) {
      marker.setIcon(makePillIcon(activeListing, true));
      marker.openPopup();
    }
    // Reset all others
    markersRef.current.forEach((m, id) => {
      if (id !== activeListing.id) {
        const l = listings.find((x) => x.id === id);
        if (l) m.setIcon(makePillIcon(l, false));
        m.closePopup();
      }
    });
  }, [activeListing, listings]);

  return null;
}

// ─── Exported MapView ─────────────────────────────────────────────────────────
export interface MapViewProps {
  listings: Listing[];
  activeListing: Listing | null;
  onMarkerClick: (listing: Listing) => void;
  flyTarget: { lat: number; lng: number; zoom: number } | null;
  resetCenter: boolean;
  onResetDone: () => void;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
}

export default function MapView(props: MapViewProps) {
  const {
    initialLat = DEFAULT_CENTER[0],
    initialLng = DEFAULT_CENTER[1],
    initialZoom = DEFAULT_ZOOM,
    ...rest
  } = props;

  return (
    <>
      <style>{`
        .nidoo-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(44,26,14,0.18);
          border: none;
        }
        .nidoo-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .nidoo-popup .leaflet-popup-tip-container {
          display: none;
        }
        .leaflet-container {
          font-family: inherit;
          position: relative;
        }
      `}</style>
      {/* position: relative is required by Leaflet to correctly calculate scroll offsets */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        center={[initialLat, initialLng]}
        zoom={initialZoom}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <InnerMap {...rest} />
      </MapContainer>
      </div>
    </>
  );
}
