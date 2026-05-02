"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search,
  Star,
  X,
  MapPin,
  Navigation,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { mockListings, type Listing } from "@/lib/listings";
import { cities, getCityBySlug } from "@/data/cities";

// Leaflet must be loaded client-side only
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#D85A30",
  primaryHover: "#c04f28",
  bg: "#fdf8f4",
  card: "#ffffff",
  border: "#e2cbb5",
  muted: "#9e7a5a",
  mutedBg: "#f0e4d7",
  foreground: "#2c1a0e",
  teal: "#1a7a6a",
  tealBg: "#e8f4f1",
};

// Default center: geographic center of LATAM — used when clearing the city filter
const LATAM_CENTER = { lat: 4.0, lng: -74.0, zoom: 4 };

// ─── Filter chips ──────────────────────────────────────────────────────────────
type FilterKey =
  | "Todos"
  | "Disponibles"
  | "Verificados"
  | "Familia con hijos"
  | "Persona sola"
  | "Pareja"
  | "Vivo solo/a";

const FILTERS: FilterKey[] = [
  "Todos",
  "Disponibles",
  "Verificados",
  "Familia con hijos",
  "Persona sola",
  "Pareja",
  "Vivo solo/a",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function applyFilter(listings: Listing[], filter: FilterKey): Listing[] {
  if (filter === "Todos") return listings;
  if (filter === "Disponibles") return listings.filter((l) => l.available);
  if (filter === "Verificados") return listings.filter((l) => l.verified);
  return listings.filter((l) => l.environment === filter);
}

function applySearch(listings: Listing[], query: string): Listing[] {
  const q = query.toLowerCase().trim();
  if (!q) return listings;
  return listings.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.neighborhood.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.host.toLowerCase().includes(q)
  );
}

/** Convert a city name to a slug for comparison against the URL param */
function cityToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function applyCity(listings: Listing[], citySlug: string | null): Listing[] {
  if (!citySlug) return listings;
  return listings.filter((l) => cityToSlug(l.city) === citySlug);
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: C.muted }}>
      <Star size={11} fill="#f5a623" stroke="none" />
      <span style={{ color: C.foreground, fontWeight: 600 }}>{rating.toFixed(1)}</span>
      <span>({reviews})</span>
    </span>
  );
}

// ─── Listing card ──────────────────────────────────────────────────────────────
function ListingCard({
  listing,
  active,
  onClick,
}: {
  listing: Listing;
  active: boolean;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (active && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [active]);

  return (
    <Link
      href={`/habitacion/${listing.slug}`}
      ref={cardRef}
      onClick={onClick}
      className="flex gap-3 rounded-2xl p-3 cursor-pointer transition-all"
      style={{
        background: C.card,
        border: `2px solid ${active ? C.primary : C.border}`,
        boxShadow: active
          ? `0 0 0 3px ${C.primary}18`
          : "0 1px 4px rgba(44,26,14,0.06)",
        opacity: listing.available ? 1 : 0.7,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Avatar placeholder */}
      <div
        className="flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-white text-sm"
        style={{
          background: listing.hostColor,
          width: 72,
          height: 72,
          fontSize: 18,
          letterSpacing: "0.05em",
        }}
      >
        {listing.hostInitials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p
            className="font-semibold text-sm leading-snug truncate"
            style={{ color: C.foreground }}
          >
            {listing.title}
          </p>
          {listing.verified && (
            <span
              className="flex-shrink-0 flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5"
              style={{ background: C.tealBg, color: C.teal }}
            >
              <CheckCircle2 size={10} />
              Verificado
            </span>
          )}
        </div>

        {!listing.available && (
          <span
            className="inline-block text-xs font-medium rounded-full px-2 py-0.5 mb-1"
            style={{ background: "#2c1a0e22", color: C.foreground }}
          >
            No disponible
          </span>
        )}

        <p className="text-xs mb-1 truncate" style={{ color: C.muted }}>
          <MapPin size={10} className="inline mr-0.5" />
          {listing.neighborhood} &middot; {listing.city}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm" style={{ color: C.primary }}>
            ${listing.price}
            <span className="font-normal text-xs" style={{ color: C.muted }}>
              /mes
            </span>
          </span>
          <StarRating rating={listing.rating} reviews={listing.reviews} />
        </div>

        <div className="flex gap-1 flex-wrap mt-1.5">
          <span
            className="text-xs rounded-full px-2 py-0.5"
            style={{ background: C.mutedBg, color: C.muted }}
          >
            {listing.environment}
          </span>
          {listing.amenities.slice(0, 2).map((a) => (
            <span
              key={a}
              className="text-xs rounded-full px-2 py-0.5"
              style={{ background: C.mutedBg, color: C.muted }}
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ─── Mobile bottom drawer ──────────────────────────────────────────────────────
function BottomDrawer({
  listing,
  onClose,
}: {
  listing: Listing | null;
  onClose: () => void;
}) {
  if (!listing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        style={{ background: "transparent" }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl shadow-2xl"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          maxHeight: "55vh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{ width: 36, height: 4, background: C.border }}
          />
        </div>

        <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: "48vh" }}>
          {/* Host avatar strip */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{
                background: listing.hostColor,
                width: 48,
                height: 48,
                fontSize: 16,
              }}
            >
              {listing.hostInitials}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: C.foreground }}>
                {listing.title}
              </p>
              <p className="text-xs" style={{ color: C.muted }}>
                {listing.neighborhood} &middot; {listing.city}
              </p>
            </div>
          </div>

          {/* Price + rating */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-xl" style={{ color: C.primary }}>
              ${listing.price}
              <span className="text-sm font-normal" style={{ color: C.muted }}>
                /mes
              </span>
            </span>
            <StarRating rating={listing.rating} reviews={listing.reviews} />
          </div>

          {/* Amenity tags */}
          <div className="flex gap-2 flex-wrap mb-4">
            {listing.amenities.map((a) => (
              <span
                key={a}
                className="text-xs rounded-full px-3 py-1"
                style={{ background: C.mutedBg, color: C.muted }}
              >
                {a}
              </span>
            ))}
          </div>

          {/* CTA */}
          <a
            href={`/habitacion/${listing.slug}`}
            className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-colors"
            style={{ background: C.primary }}
          >
            Ver habitacion &rarr;
          </a>
        </div>
      </div>
    </>
  );
}

// ─── Empty state for city filter ──────────────────────────────────────────────
function EmptyCityState({ cityName }: { cityName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MapPin size={32} style={{ color: C.border }} className="mb-3" />
      <p className="text-sm font-medium" style={{ color: C.foreground }}>
        No hay habitaciones disponibles en {cityName} todavía
      </p>
      <p className="text-xs mt-1" style={{ color: C.muted }}>
        Sé el primero en publicar una habitación aquí
      </p>
      <Link
        href="/registro/propietario"
        className="mt-4 text-sm font-medium"
        style={{ color: C.primary }}
      >
        Publicar habitación →
      </Link>
    </div>
  );
}

// ─── Skeleton shown during SSR / param resolution ──────────────────────────────
function ExplorarSkeleton() {
  return (
    <div className="flex h-screen w-full">
      <div
        className="hidden md:flex flex-col flex-shrink-0 gap-3 p-4"
        style={{ width: 380, borderRight: "1px solid #e2cbb5", background: "#fdf8f4" }}
      >
        <div className="h-5 w-48 rounded-md animate-pulse" style={{ background: "#e2cbb5" }} />
        <div className="h-4 w-32 rounded-md animate-pulse" style={{ background: "#e2cbb5" }} />
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-20 rounded-full animate-pulse" style={{ background: "#e2cbb5" }} />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 w-full rounded-xl animate-pulse" style={{ background: "#e2cbb5" }} />
        ))}
      </div>
      <div className="flex-1 animate-pulse" style={{ background: "#e2cbb5" }} />
    </div>
  );
}

// ─── Main page content (uses useSearchParams — must be inside Suspense) ─────────
function ExplorarContent() {
  const searchParams = useSearchParams();
  const ciudadParam = searchParams.get("ciudad");
  const latParam    = searchParams.get("lat");
  const lngParam    = searchParams.get("lng");
  const zoomParam   = searchParams.get("zoom");

  // Resolve city display name from slug
  const cityData = ciudadParam ? getCityBySlug(ciudadParam) : null;
  const cityDisplayName = cityData?.name ?? ciudadParam ?? null;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Todos");
  const [activeCity, setActiveCity] = useState<string | null>(ciudadParam);
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(
    latParam && lngParam
      ? {
          lat: parseFloat(latParam),
          lng: parseFloat(lngParam),
          zoom: zoomParam ? parseInt(zoomParam) : 13,
        }
      : null
  );
  const [resetCenter, setResetCenter] = useState(false);

  // Sync activeCity when URL param changes
  useEffect(() => {
    if (ciudadParam) {
      setActiveCity(ciudadParam);
    }
  }, [ciudadParam]);

  // Debounce search 200ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  // Derived listings — filter by city first, then other filters, then search
  const filtered = useMemo(() => {
    const byCity   = applyCity(mockListings, activeCity);
    const byFilter = applyFilter(byCity, activeFilter);
    return applySearch(byFilter, debouncedSearch);
  }, [activeCity, activeFilter, debouncedSearch]);

  const availableCount = filtered.filter((l) => l.available).length;

  // Badge text changes based on active city
  const badgeText = activeCity && cityDisplayName
    ? `${availableCount} disponibles en ${cityDisplayName}`
    : `${availableCount} disponibles ahora`;

  const handleCardClick = useCallback((listing: Listing) => {
    setActiveListing(listing);
    setFlyTarget({ lat: listing.lat, lng: listing.lng, zoom: 15 });
  }, []);

  const handleMarkerClick = useCallback((listing: Listing) => {
    setActiveListing(listing);
    setFlyTarget({ lat: listing.lat, lng: listing.lng, zoom: 15 });
  }, []);

  const handleResetCenter = () => setResetCenter(true);
  const handleResetDone = useCallback(() => setResetCenter(false), []);

  const clearActive = () => setActiveListing(null);

  const clearCityFilter = () => {
    setActiveCity(null);
    setActiveListing(null);
    setFlyTarget(LATAM_CENTER);
  };

  // Initial map center: use URL params if present, else LATAM overview
  const initialLat = latParam ? parseFloat(latParam) : LATAM_CENTER.lat;
  const initialLng = lngParam ? parseFloat(lngParam) : LATAM_CENTER.lng;
  const initialZoom = zoomParam ? parseInt(zoomParam) : LATAM_CENTER.zoom;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: C.bg }}>
      <Navbar />

      {/* Main content area */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ marginTop: 65 }}
      >
        {/* ── Sidebar (hidden on mobile) ──────────────────────────────────── */}
        <aside
          className="hidden md:flex flex-col flex-shrink-0 overflow-hidden"
          style={{
            width: 380,
            borderRight: `1px solid ${C.border}`,
            background: C.bg,
          }}
        >
          {/* Header */}
          <div
            className="px-5 pt-5 pb-3"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <h1
              className="font-serif font-bold text-xl leading-tight mb-0.5"
              style={{ color: C.foreground }}
            >
              {activeCity && cityDisplayName
                ? `Habitaciones en ${cityDisplayName}`
                : "Habitaciones disponibles"}
            </h1>
            <p className="text-xs" style={{ color: C.muted }}>
              {activeCity && cityData
                ? `${cityData.name}, ${cityData.country}`
                : "Toda Latinoamérica"}
            </p>

            {/* Search */}
            <div className="relative mt-3">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: C.muted }}
              />
              <input
                type="text"
                placeholder="Buscar por colonia, ciudad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl pl-9 pr-9 py-2.5 text-sm outline-none"
                style={{
                  background: C.card,
                  border: `1.5px solid ${C.border}`,
                  color: C.foreground,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: C.muted }}
                  aria-label="Limpiar busqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter chips */}
          <div
            className="px-5 py-2.5 flex gap-2 overflow-x-auto"
            style={{
              borderBottom: `1px solid ${C.border}`,
              scrollbarWidth: "none",
            }}
          >
            {FILTERS.map((f) => {
              const on = f === activeFilter;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: on ? C.primary : C.card,
                    color: on ? "#fff" : C.muted,
                    border: `1.5px solid ${on ? C.primary : C.border}`,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <div className="px-5 py-2.5 flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: C.muted }}>
              Mostrando{" "}
              <span style={{ color: C.foreground, fontWeight: 700 }}>
                {filtered.length}
              </span>{" "}
              habitacion{filtered.length !== 1 ? "es" : ""}
            </p>
            {activeListing && (
              <button
                onClick={clearActive}
                className="text-xs flex items-center gap-1"
                style={{ color: C.primary }}
              >
                <X size={12} />
                Deseleccionar
              </button>
            )}
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
            {filtered.length === 0 && activeCity && cityDisplayName ? (
              <EmptyCityState cityName={cityDisplayName} />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <MapPin size={32} style={{ color: C.border }} />
                <p className="text-sm font-medium" style={{ color: C.muted }}>
                  No se encontraron resultados
                </p>
                <p className="text-xs" style={{ color: C.border }}>
                  Intenta con otros filtros o palabras clave
                </p>
              </div>
            ) : (
              filtered.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  active={activeListing?.id === listing.id}
                  onClick={() => handleCardClick(listing)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Map area ──────────────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          {/* Map — position:relative required by Leaflet for correct scroll-offset calculation */}
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <MapView
              listings={filtered}
              activeListing={activeListing}
              onMarkerClick={handleMarkerClick}
              flyTarget={flyTarget}
              resetCenter={resetCenter}
              onResetDone={handleResetDone}
              initialLat={initialLat}
              initialLng={initialLng}
              initialZoom={initialZoom}
            />
          </div>

          {/* Overlay badge + clear city + center button */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg"
              style={{
                background: C.card,
                border: `1.5px solid ${C.border}`,
                color: C.foreground,
              }}
            >
              <span
                className="inline-block rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: C.teal,
                  boxShadow: `0 0 0 3px ${C.teal}30`,
                }}
              />
              {badgeText}
            </div>

            {activeCity && (
              <button
                onClick={clearCityFilter}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold shadow-lg transition-colors"
                style={{
                  background: C.primary,
                  color: "#fff",
                  border: `1.5px solid ${C.primary}`,
                }}
                aria-label="Limpiar filtro de ciudad"
              >
                <X size={13} />
                Limpiar filtro
              </button>
            )}

            <button
              onClick={handleResetCenter}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition-colors"
              style={{
                background: C.card,
                border: `1.5px solid ${C.border}`,
                color: C.muted,
              }}
            >
              <Navigation size={13} />
              Centrar
            </button>
          </div>

          {/* Mobile search + filter overlay */}
          <div
            className="absolute top-4 left-4 right-4 z-10 flex md:hidden flex-col gap-2"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 shadow-lg"
              style={{
                background: C.card,
                border: `1.5px solid ${C.border}`,
              }}
            >
              <Search size={15} style={{ color: C.muted }} />
              <input
                type="text"
                placeholder="Buscar habitaciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: C.foreground }}
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={14} style={{ color: C.muted }} />
                </button>
              )}
            </div>
            {/* Mobile filter chips */}
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {FILTERS.map((f) => {
                const on = f === activeFilter;
                return (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm"
                    style={{
                      background: on ? C.primary : C.card,
                      color: on ? "#fff" : C.muted,
                      border: `1.5px solid ${on ? C.primary : C.border}`,
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom drawer ─────────────────────────────────────────────── */}
      <div className="md:hidden">
        <BottomDrawer listing={activeListing} onClose={clearActive} />
      </div>
    </div>
  );
}

// ─── Default export wraps content in Suspense ──────────────────────────────────
export default function ExplorarPage() {
  return (
    <Suspense fallback={<ExplorarSkeleton />}>
      <ExplorarContent />
    </Suspense>
  );
}
