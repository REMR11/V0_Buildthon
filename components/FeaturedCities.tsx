import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp } from "lucide-react";

const cities = [
  {
    name: "Guadalajara",
    country: "México",
    listings: "1,200+",
    priceFrom: 180,
    image: "/images/cities/guadalajara.jpg",
    popular: true,
  },
  {
    name: "Bogotá",
    country: "Colombia",
    listings: "980+",
    priceFrom: 200,
    image: "/images/cities/bogota.jpg",
    popular: true,
  },
  {
    name: "Lima",
    country: "Perú",
    listings: "870+",
    priceFrom: 220,
    image: "/images/cities/lima.jpg",
    popular: false,
  },
  {
    name: "Medellín",
    country: "Colombia",
    listings: "640+",
    priceFrom: 190,
    image: "/images/cities/medellin.jpg",
    popular: true,
  },
  {
    name: "San Salvador",
    country: "El Salvador",
    listings: "310+",
    priceFrom: 150,
    image: "/images/cities/san-salvador.jpg",
    popular: false,
  },
];

export default function FeaturedCities() {
  return (
    <section id="ciudades" className="py-24 bg-muted-bg">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Estamos cerca de ti
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            Ciudades disponibles
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Nidoo ya está presente en las principales ciudades de América
            Latina, con nuevas ciudades sumándose cada mes.
          </p>
        </div>

        {/* City grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {cities.map((city) => (
            <Link
              key={city.name}
              href={`/explorar?ciudad=${city.name.toLowerCase()}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-primary-lg transition-all duration-300"
            >
              {/* Background image */}
              <Image
                src={city.image}
                alt={`${city.name}, ${city.country}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

              {/* Popular badge */}
              {city.popular && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} />
                  <span>Popular</span>
                </div>
              )}

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                {/* City info */}
                <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                  <MapPin size={12} />
                  <span>{city.country}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                  {city.name}
                </h3>

                {/* Price and listings */}
                <div className="glass rounded-lg px-3 py-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-xs">Desde</p>
                      <p className="text-foreground font-bold">
                        ${city.priceFrom}
                        <span className="text-foreground/60 font-normal text-xs">
                          /mes
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground/60 text-xs">Habitaciones</p>
                      <p className="text-foreground font-semibold text-sm">
                        {city.listings}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA to see more */}
        <div className="text-center">
          <p className="text-muted text-sm mb-4">
            Tu ciudad no aparece? Registrate y te avisamos cuando lleguemos.
          </p>
          <Link
            href="/registro?notify=true"
            className="inline-flex items-center gap-2 text-primary hover:text-white hover:bg-primary font-semibold text-sm border-2 border-primary px-6 py-3 rounded-full transition-all hover:shadow-primary-md"
          >
            Notificame cuando lleguen a mi ciudad
          </Link>
        </div>
      </div>
    </section>
  );
}
