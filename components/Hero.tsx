"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Wallet, Users, TrendingDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const cities = [
  { name: "Guadalajara", flag: "\u{1F1F2}\u{1F1FD}", country: "M\u00e9xico" },
  { name: "Bogot\u00e1", flag: "\u{1F1E8}\u{1F1F4}", country: "Colombia" },
  { name: "Lima", flag: "\u{1F1F5}\u{1F1EA}", country: "Per\u00fa" },
  { name: "Medell\u00edn", flag: "\u{1F1E8}\u{1F1F4}", country: "Colombia" },
  { name: "San Salvador", flag: "\u{1F1F8}\u{1F1FB}", country: "El Salvador" },
];

const socialProof = [
  { value: "+12,000", label: "roommates conectados" },
  { value: "50%", label: "ahorro promedio" },
  { value: "5", label: "pa\u00edses" },
];

export default function Hero() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [budget, setBudget] = useState(400);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set("ciudad", selectedCity);
    if (moveInDate) params.set("fecha", moveInDate);
    if (budget) params.set("presupuesto", budget.toString());
    router.push(`/explorar?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-home.jpg"
          alt="Jovenes compartiendo un espacio de vida moderno"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 md:py-32 w-full">
        <div className="max-w-xl">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary bg-white/95 px-4 py-2 rounded-full mb-8 shadow-primary-sm animate-fade-in-up">
            <Users size={14} className="text-primary" />
            Encuentra a tu roommate ideal
          </span>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-5 animate-fade-in-up-delay-1">
            Renta a la mitad, vive con alguien que te cae bien
          </h1>

          {/* Subheadline */}
          <p className="text-white/90 text-lg leading-relaxed mb-4 text-pretty animate-fade-in-up-delay-2">
            {"Nidoo te conecta con personas de gustos similares para compartir depa y dividir gastos. Sin awk, sin riesgo, sin pagar de m\u00e1s."}
          </p>

          {/* Value proposition pills */}
          <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up-delay-2">
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20">
              <TrendingDown size={14} />
              Ahorra hasta 50%
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20">
              <Users size={14} />
              Match por compatibilidad
            </span>
          </div>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="bg-white/95 rounded-2xl p-3 shadow-primary-lg mb-6 animate-fade-in-up-delay-3"
          >
            {/* Row 1: three fields */}
            <div className="flex flex-col sm:flex-row gap-1 mb-2">

              {/* City */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  aria-haspopup="listbox"
                  aria-expanded={cityDropdownOpen}
                >
                  <MapPin size={16} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-medium text-foreground/50 mb-0.5">Ciudad</span>
                    <span className="text-foreground font-medium text-sm truncate block">
                      {selectedCity || "\u00bfD\u00f3nde quieres vivir?"}
                    </span>
                  </div>
                </button>

                {cityDropdownOpen && (
                  <ul
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-lg border border-border z-20 overflow-hidden"
                  >
                    {cities.map((city) => (
                      <li key={city.name} role="option" aria-selected={selectedCity === city.name}>
                        <button
                          type="button"
                          onClick={() => { setSelectedCity(city.name); setCityDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                        >
                          <span className="text-lg">{city.flag}</span>
                          <div>
                            <p className="font-medium text-sm text-foreground">{city.name}</p>
                            <p className="text-xs text-muted">{city.country}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-border my-2 shrink-0" />

              {/* Date */}
              <div className="flex flex-1 items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors">
                <Calendar size={16} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <label htmlFor="hero-date" className="block text-xs font-medium text-foreground/50 mb-0.5">
                    Entrada
                  </label>
                  <input
                    id="hero-date"
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-transparent text-foreground font-medium text-sm focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-border my-2 shrink-0" />

              {/* Budget */}
              <div className="flex flex-1 items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors">
                <Wallet size={16} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <label htmlFor="hero-budget" className="block text-xs font-medium text-foreground/50 mb-0.5">
                    {"Hasta "}
                    <span className="text-primary font-semibold">${budget} USD/mes</span>
                  </label>
                  <input
                    id="hero-budget"
                    type="range"
                    min={100}
                    max={800}
                    step={50}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="custom-slider w-full"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: full-width search button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-primary-md hover:shadow-primary-lg hover:-translate-y-0.5"
            >
              <Search size={18} />
              <span>Encontrar mi roommate</span>
            </button>
          </form>

          {/* Social proof strip */}
          <div
            className="flex items-center gap-6 animate-fade-in-up"
            style={{ animationDelay: "0.5s", opacity: 0 }}
          >
            {socialProof.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />}
                <span className="text-white font-bold text-base">{stat.value}</span>
                <span className="text-white/65 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating compatibility card -- desktop only */}
      <div className="hidden lg:block absolute right-10 bottom-20 z-10 animate-float">
        <div className="relative w-64 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-primary-lg -rotate-3 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm">Match encontrado</p>
              <p className="text-muted text-xs">92% compatible</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-secondary text-foreground/70 px-2 py-1 rounded-full">Gamer</span>
            <span className="text-xs bg-secondary text-foreground/70 px-2 py-1 rounded-full">Madrugador</span>
            <span className="text-xs bg-secondary text-foreground/70 px-2 py-1 rounded-full">No fuma</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">$190/mes c/u</span>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {cityDropdownOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setCityDropdownOpen(false)} aria-hidden="true" />
      )}
    </section>
  );
}
