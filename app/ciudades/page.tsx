"use client";

import { useState, useMemo, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp, Search, X, ArrowLeft, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cities, groupByRegion, REGION_ORDER, type City } from "@/data/cities";

// ─── Constants ────────────────────────────────────────────────────────────────

const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=";

const REGION_FLAGS: Record<string, string> = {
  "Centroamérica": "🇸🇻",
  "México": "🇲🇽",
  "Sudamérica": "🇨🇴",
  "El Caribe": "🇩🇴",
};

// ─── City card ────────────────────────────────────────────────────────────────

function CityCard({ city, index }: { city: City; index: number }) {
  const isSoon = city.roomCount === 0;

  return (
    <li>
      <Link
        href={`/explorar?ciudad=${city.slug}&lat=${city.lat}&lng=${city.lng}&zoom=${city.zoom}`}
        aria-label={`Explorar habitaciones en ${city.name}${
          isSoon
            ? " — próximamente"
            : ` — desde $${city.priceFrom}/mes, ${city.listings} habitaciones`
        }`}
        className={[
          "group relative flex aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-sm",
          "hover:shadow-primary-lg transition-shadow duration-300",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
        ].join(" ")}
      >
        <Image
          src={city.image}
          alt={city.description}
          fill
          sizes="(max-width: 639px) calc(50vw - 20px), (max-width: 1023px) calc(33vw - 20px), calc(20vw - 16px)"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-110 will-change-transform"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          priority={index < 4}
          loading={index < 4 ? "eager" : "lazy"}
          draggable={false}
        />

        {/* Gradient overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {city.popular && (
            <div
              aria-hidden="true"
              className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <TrendingUp size={11} />
              <span>Popular</span>
            </div>
          )}
          {isSoon && (
            <div className="bg-foreground/40 text-white/90 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              Próximamente
            </div>
          )}
        </div>

        {/* Flag chip */}
        <div className="absolute top-3 right-3">
          <span
            className="text-base leading-none"
            role="img"
            aria-label={city.country}
          >
            {city.countryFlag}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-center gap-1 text-white/70 text-xs mb-0.5">
            <MapPin size={10} aria-hidden="true" />
            <span>{city.country}</span>
          </div>
          <h3 className="text-white font-bold text-base leading-snug text-balance group-hover:text-primary transition-colors">
            {city.name}
          </h3>

          {!isSoon ? (
            <div className="glass rounded-lg px-2.5 py-1.5 mt-2 flex items-center justify-between gap-2">
              <p className="text-foreground font-bold text-xs leading-tight">
                ${city.priceFrom}
                <span className="text-foreground/55 font-normal">/mes</span>
              </p>
              <p className="text-foreground/70 text-xs shrink-0">{city.listings}</p>
            </div>
          ) : (
            <div className="glass rounded-lg px-2.5 py-1.5 mt-2">
              <p className="text-foreground/65 text-xs text-center">Pronto disponible</p>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

// ─── Empty search state ───────────────────────────────────────────────────────

function NoResults({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
      <Globe size={36} className="text-border" aria-hidden="true" />
      <p className="text-foreground font-semibold">
        Sin resultados para &ldquo;{query}&rdquo;
      </p>
      <p className="text-muted text-sm max-w-xs">
        Ninguna ciudad o país coincide con tu búsqueda.
      </p>
      <a
        href={`mailto:hola@nidoo.app?subject=Sugerir%20ciudad%3A%20${encodeURIComponent(query)}`}
        className="text-primary font-semibold text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        Sugerir esta ciudad &rarr;
      </a>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CiudadesPage() {
  const [search, setSearch] = useState("");
  const searchId = useId();

  const totalCountries = useMemo(
    () => new Set(cities.map((c) => c.country)).size,
    []
  );

  const availableCount = useMemo(
    () => cities.filter((c) => c.roomCount > 0).length,
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }, [search]);

  const byRegion = useMemo(() => groupByRegion(cities), []);

  return (
    <>
      <Navbar />

      <main className="pt-20 pb-24 min-h-screen bg-background">

        {/* ── Page hero ──────────────────────────────────────────────────────── */}
        <div className="bg-muted-bg border-b border-border">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">

            {/* Back link */}
            <Link
              href="/#ciudades"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Volver al inicio
            </Link>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
                  Cobertura completa
                </span>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance leading-tight">
                  Todas las ciudades
                </h1>
                <p className="text-muted text-base mt-3 max-w-md leading-relaxed">
                  Nidoo ya está disponible en{" "}
                  <strong className="text-foreground">{availableCount} ciudades</strong> y
                  llegaremos pronto a las{" "}
                  <strong className="text-foreground">{cities.length}</strong> ciudades en{" "}
                  <strong className="text-foreground">{totalCountries} países</strong> de
                  Latinoamérica.
                </p>
              </div>

              {/* Stat chips */}
              <div className="flex gap-3 shrink-0">
                <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-primary font-serif">{cities.length}</p>
                  <p className="text-xs text-muted mt-0.5">Ciudades</p>
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-primary font-serif">{totalCountries}</p>
                  <p className="text-xs text-muted mt-0.5">Países</p>
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-primary font-serif">{availableCount}</p>
                  <p className="text-xs text-muted mt-0.5">Disponibles</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm mt-8">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor={searchId} className="sr-only">
                Buscar ciudad o país
              </label>
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ciudad o país..."
                className="w-full rounded-full py-3 pl-11 pr-10 text-sm outline-none bg-card text-foreground"
                style={{ border: "1.5px solid var(--border)" }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── City grid ──────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-5 pt-12">

          {/* Flat search results */}
          {filtered !== null ? (
            <section aria-label="Resultados de búsqueda">
              <p className="text-sm text-muted mb-6" aria-live="polite">
                {filtered.length === 0
                  ? "Sin resultados"
                  : `${filtered.length} ciudad${filtered.length !== 1 ? "es" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <ul
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 list-none p-0 m-0"
                role="list"
                aria-label="Resultados de búsqueda de ciudades"
              >
                {filtered.length === 0 ? (
                  <NoResults query={search} />
                ) : (
                  filtered.map((city, i) => (
                    <CityCard key={city.slug} city={city} index={i} />
                  ))
                )}
              </ul>
            </section>
          ) : (
            /* Grouped by region */
            <div className="flex flex-col gap-14">
              {REGION_ORDER.map((region) => {
                const group = byRegion[region];
                if (!group || group.length === 0) return null;
                const flag = REGION_FLAGS[region] ?? "";
                const liveCount = group.filter((c) => c.roomCount > 0).length;

                return (
                  <section key={region} aria-labelledby={`region-${region}`}>
                    {/* Region heading row */}
                    <div className="flex items-baseline justify-between gap-4 mb-5">
                      <h2
                        id={`region-${region}`}
                        className="font-serif font-bold text-xl md:text-2xl text-foreground flex items-center gap-2.5"
                      >
                        <span role="img" aria-label={region}>
                          {flag}
                        </span>
                        {region}
                      </h2>
                      <p className="text-sm text-muted shrink-0">
                        {liveCount > 0 ? (
                          <>
                            <span className="text-primary font-semibold">{liveCount}</span>
                            {" de "}
                            {group.length} disponible{liveCount !== 1 ? "s" : ""}
                          </>
                        ) : (
                          <>
                            {group.length} ciudad{group.length !== 1 ? "es" : ""} — próximamente
                          </>
                        )}
                      </p>
                    </div>

                    <ul
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 list-none p-0 m-0"
                      role="list"
                      aria-label={`Ciudades en ${region}`}
                    >
                      {group.map((city, i) => (
                        <CityCard key={city.slug} city={city} index={i} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}

          {/* Notify CTA */}
          <div
            className="mt-16 rounded-2xl bg-secondary border border-border px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            role="complementary"
            aria-label="Notificación de nuevas ciudades"
          >
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                ¿Tu ciudad no aparece aqui?
              </h3>
              <p className="text-muted text-sm max-w-md">
                Registrate y te avisamos cuando Nidoo llegue a tu ciudad. Sin compromiso.
              </p>
            </div>
            <Link
              href="/registro?notify=true"
              className={[
                "shrink-0 inline-flex items-center gap-2",
                "bg-primary hover:bg-primary-hover text-white font-semibold text-sm",
                "px-6 py-3 rounded-full transition-all shadow-primary-sm hover:shadow-primary-md",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
              ].join(" ")}
            >
              Avisame cuando lleguen
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
