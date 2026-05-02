"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Users, Building2, ArrowRight } from "lucide-react";
import { cities, type City } from "@/data/cities";

const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=";

const popularCities = cities.filter((c) => c.popular);
const totalCities = cities.length;
const totalCountries = new Set(cities.map((c) => c.country)).size;

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon size={15} className="text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-foreground leading-none">{value}</p>
      </div>
    </div>
  );
}

// ─── Hero card (large, left) ──────────────────────────────────────────────────
function HeroCard({ city }: { city: City }) {
  return (
    <Link
      href={`/explorar?ciudad=${city.slug}&lat=${city.lat}&lng=${city.lng}&zoom=${city.zoom}`}
      aria-label={`Explorar habitaciones en ${city.name}, ${city.province} — desde $${city.priceFrom}/mes`}
      className={[
        "group relative flex flex-col justify-end overflow-hidden rounded-3xl",
        "min-h-[420px] md:min-h-[520px]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
        "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
      ].join(" ")}
    >
      {/* Photo */}
      <Image
        src={city.image}
        alt={city.description}
        fill
        sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 60vw, 640px"
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105 will-change-transform"
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        priority
        loading="eager"
        draggable={false}
      />

      {/* Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent"
      />

      {/* Top bar */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase">
          Disponible ahora
        </span>
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8">
        {/* Province + country row */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={13} className="text-white/60" aria-hidden="true" />
          <span className="text-white/70 text-sm font-medium">
            {city.province}, {city.country}
          </span>
        </div>

        {/* City name */}
        <h3 className="font-serif text-4xl md:text-5xl font-bold text-white leading-none mb-5 text-balance">
          {city.name}
        </h3>

        {/* Data chips row */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="glass-dark rounded-xl px-3.5 py-2 flex items-center gap-2">
            <Users size={13} className="text-white/70" aria-hidden="true" />
            <span className="text-white text-sm font-semibold">{city.population}</span>
            <span className="text-white/55 text-xs">hab.</span>
          </div>
          <div className="glass-dark rounded-xl px-3.5 py-2 flex items-center gap-2">
            <Building2 size={13} className="text-white/70" aria-hidden="true" />
            <span className="text-white text-sm font-semibold">{city.listings}</span>
            <span className="text-white/55 text-xs">habitaciones</span>
          </div>
          <div className="glass-dark rounded-xl px-3.5 py-2">
            <span className="text-white/55 text-xs">Desde </span>
            <span className="text-white text-sm font-bold">${city.priceFrom}</span>
            <span className="text-white/55 text-xs">/mes</span>
          </div>
        </div>

        {/* CTA */}
        <div className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-3 rounded-full group-hover:bg-primary-hover transition-colors duration-200">
          Ver habitaciones
          <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

// ─── Secondary card (right column) ───────────────────────────────────────────
function SecondaryCard({ city, index }: { city: City; index: number }) {
  return (
    <Link
      href={`/explorar?ciudad=${city.slug}&lat=${city.lat}&lng=${city.lng}&zoom=${city.zoom}`}
      aria-label={`Explorar habitaciones en ${city.name}, ${city.province} — desde $${city.priceFrom}/mes`}
      className={[
        "group relative flex flex-col justify-end overflow-hidden rounded-3xl",
        "min-h-[200px] md:min-h-0",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
      ].join(" ")}
    >
      {/* Photo */}
      <Image
        src={city.image}
        alt={city.description}
        fill
        sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 40vw, 320px"
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105 will-change-transform"
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        priority={index === 0}
        loading={index === 0 ? "eager" : "lazy"}
        draggable={false}
      />

      {/* Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent"
      />

      {/* Arrow badge top-right */}
      <div
        aria-hidden="true"
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <ArrowUpRight size={14} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin size={11} className="text-white/55" aria-hidden="true" />
          <span className="text-white/60 text-xs">{city.province}</span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-white leading-tight mb-3">
          {city.name}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-white/55" aria-hidden="true" />
            <span className="text-white/80 text-xs font-medium">{city.population}</span>
          </div>
          <span className="w-px h-3 bg-white/25" aria-hidden="true" />
          <span className="text-white/55 text-xs">Desde </span>
          <span className="text-white text-xs font-bold">${city.priceFrom}/mes</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function FeaturedCities() {
  const [hero, ...secondaries] = popularCities;

  return (
    <section
      id="ciudades"
      className="py-20 md:py-28 bg-muted-bg"
      aria-labelledby="ciudades-heading"
    >
      <div className="max-w-6xl mx-auto px-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-4">
              Donde vivir
            </span>
            <h2
              id="ciudades-heading"
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance leading-tight"
            >
              Ciudades con habitaciones disponibles
            </h2>
            <p className="text-muted text-base mt-4 leading-relaxed">
              Encuentra tu próximo hogar en estas ciudades activas. Pronto
              expandimos a{" "}
              <strong className="text-foreground font-semibold">{totalCities} ciudades</strong>{" "}
              en {totalCountries} países de Latinoamérica.
            </p>
          </div>

          {/* Stat pills — desktop only */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <StatPill icon={Building2} label="Habitaciones activas" value="430+" />
            <StatPill icon={MapPin} label="Países" value={`${totalCountries}`} />
          </div>
        </div>

        {/* ── City grid ──────────────────────────────────────────────────── */}
        <ul
          role="list"
          aria-label="Ciudades destacadas"
          className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 list-none p-0 m-0"
          style={{ minHeight: "clamp(480px, 55vw, 640px)" }}
        >
          {/* Hero — spans 2 cols × 2 rows on md+ */}
          {hero && <HeroCard city={hero} />}

          {/* Secondary cards — 1 col × 1 row each on md+ */}
          {secondaries.map((city, i) => (
            <li key={city.slug} className="contents">
              <SecondaryCard city={city} index={i} />
            </li>
          ))}
        </ul>

        {/* ── Footer strip ───────────────────────────────────────────────── */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* Stat pills — mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <StatPill icon={Building2} label="Habitaciones" value="430+" />
            <StatPill icon={MapPin} label="Países" value={`${totalCountries}`} />
          </div>

          {/* Spacer */}
          <div className="hidden sm:block flex-1" />

          {/* Coming-soon teaser */}
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 flex-1 sm:flex-none">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Próximamente en LATAM</p>
              <p className="text-xs text-muted truncate">México · Colombia · Perú · Chile · Argentina</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/ciudades"
            className={[
              "inline-flex items-center justify-center gap-2 shrink-0",
              "bg-foreground text-background font-semibold text-sm",
              "px-6 py-3 rounded-2xl transition-all",
              "hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
            ].join(" ")}
          >
            Ver todas las ciudades
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

      </div>
    </section>
  );
}
