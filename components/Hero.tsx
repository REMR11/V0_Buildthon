"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Wallet } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const cities = [
  { name: "Guadalajara", flag: "🇲🇽", country: "México" },
  { name: "Bogotá", flag: "🇨🇴", country: "Colombia" },
  { name: "Lima", flag: "🇵🇪", country: "Perú" },
  { name: "Medellín", flag: "🇨🇴", country: "Colombia" },
  { name: "San Salvador", flag: "🇸🇻", country: "El Salvador" },
];

const stats = [
  { value: "+5,000", label: "habitaciones" },
  { value: "+12,000", label: "inquilinos" },
  { value: "5", label: "países" },
];

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return { count, ref };
}

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
          alt="Interior acogedor de hogar latinoamericano"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/45 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 md:py-32 w-full">
        <div className="max-w-xl">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary bg-white/95 px-4 py-2 rounded-full mb-8 shadow-primary-sm animate-fade-in-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
            Plataforma de renta en América Latina
          </span>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-5 animate-fade-in-up-delay-1">
            Tu hogar lejos de casa, con total confianza
          </h1>

          {/* Subheadline */}
          <p className="text-white/85 text-lg leading-relaxed mb-8 text-pretty animate-fade-in-up-delay-2">
            Habitaciones verificadas para estudiantes y trabajadores en toda América Latina.
          </p>

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
                      {selectedCity || "¿A dónde vas?"}
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
                    Hasta <span className="text-primary font-semibold">${budget} USD/mes</span>
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
              <span>Buscar habitación</span>
            </button>
          </form>

          {/* Compact stats strip */}
          <div
            className="flex items-center gap-6 animate-fade-in-up"
            style={{ animationDelay: "0.5s", opacity: 0 }}
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />}
                <span className="text-white font-bold text-base">{stat.value}</span>
                <span className="text-white/65 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating room card — desktop only */}
      <div className="hidden lg:block absolute right-10 bottom-20 z-10 animate-float">
        <div className="relative w-56 h-72 rounded-2xl overflow-hidden shadow-primary-lg -rotate-3">
          <Image
            src="/images/rooms/room-1.jpg"
            alt="Habitación disponible en Guadalajara"
            fill
            className="object-cover"
            sizes="224px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
          <div className="absolute bottom-4 left-3 right-3">
            <div className="glass rounded-lg px-3 py-2">
              <p className="text-foreground font-semibold text-sm">Desde $180/mes</p>
              <p className="text-foreground/70 text-xs">Guadalajara, MX</p>
            </div>
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
