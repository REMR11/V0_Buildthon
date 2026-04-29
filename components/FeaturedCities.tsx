import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp } from "lucide-react";
import { cities } from "@/data/cities";

// Minimal 1×1 warm-beige base64 placeholder — shown while the real image loads.
const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=";

export default function FeaturedCities() {
  return (
    <section
      id="ciudades"
      className="py-24 bg-muted-bg"
      aria-labelledby="ciudades-heading"
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Section header */}
        <div className="text-center mb-12">
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
            Nidoo ya está presente en las principales ciudades de El Salvador,
            con nuevas ciudades sumándose cada mes.
          </p>
        </div>

        {/* City grid */}
        <ul
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12 list-none p-0 m-0"
          role="list"
          aria-label="Ciudades disponibles en Nidoo"
        >
          {cities.map((city, index) => (
            <li key={city.slug}>
              <Link
                href={`/explorar?ciudad=${city.slug}&lat=${city.lat}&lng=${city.lng}&zoom=${city.zoom}`}
                aria-label={`Explorar habitaciones en ${city.name} — desde $${city.priceFrom}/mes, ${city.listings} habitaciones`}
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
                  // Eagerly load the two above-the-fold images; lazy-load the rest
                  priority={index < 2}
                  loading={index < 2 ? "eager" : "lazy"}
                  draggable={false}
                />

                {/* Gradient overlay — darkens bottom for legible text */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent"
                />

                {/* Popular badge */}
                {city.popular && (
                  <div
                    aria-hidden="true"
                    className="absolute top-3 left-3 flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    <TrendingUp size={12} aria-hidden="true" />
                    <span>Popular</span>
                  </div>
                )}

                {/* Card content */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                    <MapPin size={12} aria-hidden="true" />
                    <span>{city.country}</span>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-200">
                    {city.name}
                  </h3>

                  {/* Price / listings glass pill */}
                  <div className="glass rounded-lg px-3 py-2 mt-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-foreground/60 text-xs leading-tight">
                          Desde
                        </p>
                        <p className="text-foreground font-bold leading-tight truncate">
                          ${city.priceFrom}
                          <span className="text-foreground/60 font-normal text-xs">
                            /mes
                          </span>
                        </p>
                      </div>
                      <div className="text-right min-w-0 shrink-0">
                        <p className="text-foreground/60 text-xs leading-tight">
                          Habitaciones
                        </p>
                        <p className="text-foreground font-semibold text-sm leading-tight">
                          {city.listings}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA footer */}
        <div className="text-center">
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
