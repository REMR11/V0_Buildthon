"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LocationData {
  lat: number;
  lng: number;
  neighborhood: string;
  city: string;
}

interface LocationPickerProps {
  initialCity?: string;
  onLocationChange?: (data: LocationData) => void;
}

// ─── Design tokens (mirror onboarding) ───────────────────────────────────────
const TOKEN = {
  primary: "#D85A30",
  primaryHover: "#c04f28",
  bg: "#fdf8f4",
  border: "#e2cbb5",
  muted: "#9e7a5a",
  mutedBg: "#f0e4d7",
  foreground: "#2c1a0e",
};

// ─── City → lat/lng defaults for LATAM cities ─────────────────────────────────
const CITY_COORDS: Record<string, [number, number]> = {
  "San Salvador":        [13.6929, -89.2182],
  "Santa Ana":           [13.9942, -89.5597],
  "San Miguel":          [13.4792, -88.1772],
  "Ciudad de México":    [19.4326, -99.1332],
  "Guadalajara":         [20.6597, -103.3496],
  "Monterrey":           [25.6866, -100.3161],
  "Bogotá":              [4.7110,  -74.0721],
  "Medellín":            [6.2442,  -75.5812],
  "Cali":                [3.4516,  -76.5319],
  "Buenos Aires":        [-34.6037, -58.3816],
  "Córdoba":             [-31.4201, -64.1888],
  "Rosario":             [-32.9468, -60.6393],
  "Lima":                [-12.0464, -77.0428],
  "Arequipa":            [-16.4090, -71.5375],
  "Santiago":            [-33.4569, -70.6483],
  "Valparaíso":          [-33.0472, -71.6127],
  "Ciudad de Guatemala": [14.6349, -90.5069],
  "Tegucigalpa":         [14.0818, -87.2068],
  "Managua":             [12.1364, -86.2814],
};

// ─── Nominatim reverse-geocoder ───────────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<{ neighborhood: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
      { headers: { "User-Agent": "NidooApp/1.0" } }
    );
    const data = await res.json();
    const addr = data.address ?? {};
    const neighborhood =
      addr.neighbourhood || addr.suburb || addr.quarter || addr.district || addr.county || "";
    const city =
      addr.city || addr.town || addr.village || addr.municipality || "";
    return { neighborhood, city };
  } catch {
    return { neighborhood: "", city: "" };
  }
}

// ─── Nominatim forward search ─────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function searchAddress(query: string): Promise<NominatimResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=es`,
      { headers: { "User-Agent": "NidooApp/1.0" } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

// ─── Inner map (loaded client-side only) ─────────────────────────────────────
function LeafletMap({ initialCity, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const circleRef = useRef<import("leaflet").Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [locationLabel, setLocationLabel] = useState<{ neighborhood: string; city: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultCenter: [number, number] = CITY_COORDS[initialCity ?? ""] ?? [13.6929, -89.2182];

  // Update marker + circle position and emit change
  const updatePin = useCallback(async (lat: number, lng: number) => {
    if (!mapRef.current) return;
    const L = (await import("leaflet")).default;

    // Move or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          background:${TOKEN.primary};border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", (e) => {
        const pos = (e.target as import("leaflet").Marker).getLatLng();
        updatePin(pos.lat, pos.lng);
      });
    }

    // Move or create 300m privacy circle
    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
    } else {
      circleRef.current = L.circle([lat, lng], {
        radius: 300,
        color: TOKEN.primary,
        fillColor: TOKEN.primary,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      }).addTo(mapRef.current);
    }

    mapRef.current.panTo([lat, lng], { animate: true });

    // Reverse geocode
    const geo = await reverseGeocode(lat, lng);
    setLocationLabel(geo);
    onLocationChange?.({ lat, lng, ...geo });
  }, [onLocationChange]);

  // Init Leaflet map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Click to place marker
      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        updatePin(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;

      // Place initial pin at city center
      await updatePin(defaultCenter[0], defaultCenter[1]);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leaflet CSS
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  // Address search debounce
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAddress(value);
      setSuggestions(results);
      setShowSuggestions(true);
      setSearching(false);
    }, 600);
  };

  const pickSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery(result.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    updatePin(lat, lng);
    mapRef.current?.setView([lat, lng], 15, { animate: true });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="relative">
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{
            background: TOKEN.bg,
            border: `1.5px solid ${TOKEN.border}`,
          }}
        >
          {searching
            ? <Loader2 size={16} style={{ color: TOKEN.muted }} className="animate-spin flex-shrink-0" />
            : <MapPin size={16} style={{ color: TOKEN.primary }} className="flex-shrink-0" />
          }
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="Busca una dirección…"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: TOKEN.foreground, fontFamily: "inherit" }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            aria-label="Buscar dirección"
            aria-autocomplete="list"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-lg"
            style={{ background: "#fff", border: `1.5px solid ${TOKEN.border}` }}
          >
            {suggestions.map(s => (
              <li
                key={s.place_id}
                role="option"
                aria-selected="false"
                onMouseDown={() => pickSuggestion(s)}
                className="px-4 py-3 text-xs cursor-pointer hover:bg-orange-50 transition-colors"
                style={{ color: TOKEN.foreground, borderBottom: `1px solid ${TOKEN.border}` }}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden"
        style={{
          height: 280,
          border: `1.5px solid ${TOKEN.border}`,
          background: TOKEN.mutedBg,
          position: "relative",
          zIndex: 0,
        }}
        aria-label="Mapa de ubicación"
      />

      {/* Location label */}
      {locationLabel && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3"
          style={{ background: TOKEN.mutedBg }}
        >
          <MapPin size={15} style={{ color: TOKEN.primary, marginTop: 1, flexShrink: 0 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: TOKEN.foreground }}>
              Ubicación guardada:{" "}
              {[locationLabel.neighborhood, locationLabel.city].filter(Boolean).join(", ") || "Ubicación seleccionada"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: TOKEN.muted }}>
              Solo mostramos un radio aproximado a los inquilinos. Tu número de casa nunca es visible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dynamic export (disables SSR for Leaflet) ────────────────────────────────
const LocationPicker = dynamic(() => Promise.resolve(LeafletMap), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl flex flex-col items-center justify-center gap-2"
      style={{
        height: 280,
        background: TOKEN.mutedBg,
        border: `1.5px solid ${TOKEN.border}`,
      }}
    >
      <Loader2 size={24} style={{ color: TOKEN.primary }} className="animate-spin" />
      <p className="text-xs" style={{ color: TOKEN.muted }}>Cargando mapa…</p>
    </div>
  ),
});

export default LocationPicker;
