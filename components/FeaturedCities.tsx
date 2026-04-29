"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp, Search, X } from "lucide-react";
import { cities, groupByRegion, REGION_ORDER, type City } from "@/data/cities";

const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=";

// The first flag of each region group, used as a decorative accent next to the heading.
const REGION_FLAG_HINT: Record<string, string> = {
  "Centroamérica": "🇸🇻",
  "México": "🇲🇽",
  "Sudamérica": "🇨🇴",
  "El Caribe": "🇩🇴",
};

function CityCard({ city, index }: { city: City; index: number }) {
  const isPriority = index < 2;
  const isSoon = city.roomCount === 0;

  return (
    <li>
      <Link
        href={`/explorar?ciudad=${city.slug}&lat=${city.lat}&lng=${city.lng}&zoom=${city.zoom}`}
        aria-label={`Explorar habitaciones en ${city.name}${isSoon ? " — próximamente" : ` — desde $${city.priceFrom}/mes`}`}
        className={[
          "group relative flex aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-sm",
          "hover:shadow-primary-lg transition-shadow duration-300",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
        ].join(" ")}
      >
        {/* Background image */}
        <Image
          src={city.image}
          alt={city.description}
          fill
          sizes="(max-width: 640px) calc(50vw - 20px), (max-width: 1024px) calc(33vw - 20px), calc(20vw - 16px)"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-110 will-change-transform"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          priority={isPriority}
          loading={isPriority ? "eager" : "lazy"}
          draggable={false}
        />

        {/* Gradient overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent"
        />

        {/* Top badges row */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {city.popular && (
            <div
              aria-hidden="true"
              className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <TrendingUp size={12} aria-hidden="true" />
              <span>Popular</span>
            </div>
          )}
          {isSoon && (
            <div className="flex items-center bg-foreground/40 text-white/90 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              Próximamente
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
            <MapPin size={12} aria-hidden="true" />
            <span>{city.country}</span>
          </div>

          <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-200 text-balance leading-snug">
            {city.name}
          </h3>

          {/* Price pill — hidden for coming-soon cities */}
          {!isSoon ? (
            <div className="glass rounded-lg px-3 py-2 mt-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-foreground/60 text-xs leading-tight">Desde</p>
                  <p className="text-foreground font-bold leading-tight truncate">
                    ${city.priceFrom}
                    <span className="text-foreground/60 font-normal text-xs">/mes</span>
                  </p>
                </div>
                <div className="text-right min-w-0 shrink-0">
                  <p className="text-foreground/60 text-xs leading-tight">Habitaciones</p>
                  <p className="text-foreground font-semibold text-sm leading-tight">
                    {city.listings}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-lg px-3 py-2 mt-2">
              <p className="text-foreground/70 text-xs text-center">
                Pronto disponible
              </p>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-14 text-center gap-3">
      <MapPin size={32} className="text-border" aria-hidden="true" />
      <p className="text-foreground font-semibold">
        No encontramos ciudades con &ldquo;{query}&rdquo;
      </p>
      <p className="text-muted text-sm">
        ¿Quieres que Nidoo llegue ahí?
      </p>
      <a
        href={`mailto:hola@nidoo.app?subject=Sugerir%20ciudad%3A%20${encodeURIComponent(query)}`}
        className="text-primary font-semibold text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        Sugerir ciudad &rarr;
      </a>
    </div>
  );
}

export default function FeaturedCities() {
  const [search, setSearch] = useState("");

  const filtered =
    search.trim() === ""
      ? null // null = show grouped view
      : cities.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.country.toLowerCase().includes(search.toLowerCase())
        );

  const byRegion = groupByRegion(cities);

  return (
    <section
      id="ciudades"
      className="py-24 bg-muted-bg"
      aria-labelledby="ciudades-heading"
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Section header */}
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Estamos cerca de ti
          </span>
          <h2
            id="ciudades-heading"
            className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4"
          >
            Ciudades disponibles
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Nidoo ya está en El Salvador y llegará pronto a toda Latinoamérica.
          </p>
        </div>

        {/* Search input */}
        <div className="relative max-w-sm mx-auto mb-12">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ciudad o país..."
            aria-label="Buscar ciudad o país"
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

        {/* ── Filtered flat view ── */}
        {filtered !== null ? (
          <ul
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0"
            role="list"
            aria-label="Resultados de búsqueda"
            aria-live="polite"
          >
            {filtered.length === 0 ? (
              <NoResults query={search} />
            ) : (
              filtered.map((city, i) => (
                <CityCard key={city.slug} city={city} index={i} />
              ))
            )}
          </ul>
        ) : (
          /* ── Grouped by region view ── */
          <div className="flex flex-col gap-12">
            {REGION_ORDER.map((region) => {
              const group = byRegion[region];
              if (!group || group.length === 0) return null;
              const flag = REGION_FLAG_HINT[region] ?? "";
              return (
                <div key={region}>
                  <h3 className="font-serif font-bold text-xl text-foreground mb-5 flex items-center gap-2">
                    <span aria-hidden="true">{flag}</span>
                    {region}
                  </h3>
                  <ul
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 list-none p-0 m-0"
                    role="list"
                    aria-label={`Ciudades en ${region}`}
                  >
                    {group.map((city, i) => (
                      <CityCard key={city.slug} city={city} index={i} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA footer */}
        <div className="text-center mt-14">
          <p className="text-muted text-sm mb-4">
            ¿Tu ciudad no aparece? Regístrate y te avisamos cuando lleguemos.
          </p>
          <Link
            href="/registro?notify=true"
            className="inline-flex items-center gap-2 text-primary hover:text-white hover:bg-primary font-semibold text-sm border-2 border-primary px-6 py-3 rounded-full transition-all hover:shadow-primary-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Notifícame cuando lleguen a mi ciudad
          </Link>
        </div>
      </div>
    </section>
  );
}
