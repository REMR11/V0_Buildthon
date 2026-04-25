import { MapPin } from "lucide-react";

const cities = [
  { name: "Guadalajara", country: "México", listings: "1,200+" },
  { name: "Bogotá", country: "Colombia", listings: "980+" },
  { name: "Lima", country: "Perú", listings: "870+" },
  { name: "Medellín", country: "Colombia", listings: "640+" },
  { name: "San Salvador", country: "El Salvador", listings: "310+" },
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

        {/* City pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {cities.map((city) => (
            <a
              key={city.name}
              href="#"
              className="group flex items-center gap-2 bg-card hover:bg-primary hover:text-white border border-border rounded-full px-5 py-3 transition-colors shadow-sm"
            >
              <MapPin
                size={15}
                className="text-primary group-hover:text-white transition-colors"
              />
              <span className="font-semibold text-sm text-foreground group-hover:text-white transition-colors">
                {city.name}
              </span>
              <span className="text-muted group-hover:text-white/80 text-xs transition-colors">
                {city.country}
              </span>
              <span className="bg-secondary group-hover:bg-white/20 text-muted group-hover:text-white text-xs font-medium px-2 py-0.5 rounded-full transition-colors">
                {city.listings}
              </span>
            </a>
          ))}
        </div>

        {/* CTA to see more */}
        <div className="text-center">
          <p className="text-muted text-sm mb-4">
            ¿Tu ciudad no aparece? Regístrate y te avisamos cuando lleguemos.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold text-sm border border-primary hover:border-accent px-6 py-2.5 rounded-full transition-colors"
          >
            Notifícame cuando lleguen a mi ciudad
          </a>
        </div>
      </div>
    </section>
  );
}
