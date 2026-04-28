"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Home,
  Globe,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const cities = [
  { name: "Guadalajara", flag: "🇲🇽", country: "México" },
  { name: "Bogotá", flag: "🇨🇴", country: "Colombia" },
  { name: "Lima", flag: "🇵🇪", country: "Perú" },
  { name: "Medellín", flag: "🇨🇴", country: "Colombia" },
  { name: "San Salvador", flag: "🇸🇻", country: "El Salvador" },
];

const popularSearches = [
  "Cerca de la UDG",
  "Zona T Bogotá",
  "Miraflores Lima",
  "El Poblado",
];

const recentUsers = [
  { name: "Ana", city: "Guadalajara", time: "hace 2 días" },
  { name: "Carlos", city: "Bogotá", time: "hace 5 horas" },
  { name: "María", city: "Lima", time: "ayer" },
];

// Animated counter hook — must be called at component top-level only
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

// Isolated sub-component so each card can call useCountUp at its own top-level
function StatCard({
  icon: Icon,
  value,
  prefix,
  suffix,
  label,
  delay,
}: {
  icon: React.ElementType;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  delay: number;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <div
      ref={ref}
      className="glass rounded-xl px-5 py-4 flex items-center gap-3 shadow-primary-sm hover:shadow-primary-md transition-shadow animate-fade-in-up"
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-foreground font-bold text-lg leading-tight counter-animate">
          {prefix}
          {count.toLocaleString("es-MX")}
          {suffix}
        </p>
        <p className="text-foreground/60 text-sm">{label}</p>
      </div>
    </div>
  );
}

const statDefs = [
  { icon: Home, value: 5000, prefix: "+", suffix: "", label: "habitaciones" },
  { icon: Users, value: 12000, prefix: "+", suffix: "", label: "inquilinos felices" },
  { icon: Globe, value: 5, prefix: "", suffix: " países", label: "en LATAM" },
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
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-home.jpg"
          alt="Interior acogedor de hogar latinoamericano"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 md:py-32 w-full">
        <div className="max-w-2xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary bg-white/95 px-4 py-2 rounded-full mb-6 shadow-primary-sm animate-fade-in-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
            Plataforma de renta en América Latina
          </span>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-6 animate-fade-in-up-delay-1">
            Tu hogar lejos de casa, con total confianza
          </h1>

          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8 text-pretty animate-fade-in-up-delay-2">
            Conectamos propietarios con habitaciones disponibles y estudiantes o
            trabajadores que buscan alojamiento accesible y seguro.
          </p>

          {/* Functional search bar */}
          <form
            onSubmit={handleSearch}
            className="glass rounded-2xl p-2 shadow-primary-lg mb-6 animate-fade-in-up-delay-3"
          >
            <div className="flex flex-col md:flex-row gap-2">
              {/* City selector */}
              <div className="flex-1 relative">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 transition-colors text-left"
                  aria-haspopup="listbox"
                  aria-expanded={cityDropdownOpen}
                >
                  <MapPin size={20} className="text-primary shrink-0" />
                  <div className="flex-1">
                    <span className="block text-xs font-medium text-foreground/60 mb-0.5">
                      Ciudad
                    </span>
                    <span className="text-foreground font-medium text-sm">
                      {selectedCity || "Selecciona una ciudad"}
                    </span>
                  </div>
                </button>

                {cityDropdownOpen && (
                  <ul
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border z-20 animate-scale-in overflow-hidden"
                  >
                    {cities.map((city) => (
                      <li key={city.name} role="option" aria-selected={selectedCity === city.name}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCity(city.name);
                            setCityDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                        >
                          <span className="text-xl">{city.flag}</span>
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

              {/* Date picker */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 transition-colors">
                <Calendar size={20} className="text-primary shrink-0" />
                <div className="flex-1">
                  <label
                    htmlFor="hero-date"
                    className="block text-xs font-medium text-foreground/60 mb-0.5"
                  >
                    Fecha de entrada
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

              {/* Budget slider */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 transition-colors">
                <Wallet size={20} className="text-primary shrink-0" />
                <div className="flex-1">
                  <label
                    htmlFor="hero-budget"
                    className="block text-xs font-medium text-foreground/60 mb-0.5"
                  >
                    Presupuesto:{" "}
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
                    className="custom-slider w-full mt-1"
                  />
                </div>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-4 rounded-xl transition-all shadow-primary-md hover:shadow-primary-lg hover:-translate-y-0.5"
              >
                <Search size={20} />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>
          </form>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in-up-delay-3">
            <span className="text-white/60 text-sm">Popular:</span>
            {popularSearches.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() =>
                  router.push(`/explorar?q=${encodeURIComponent(search)}`)
                }
                className="text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in-up-delay-3">
            <a
              href="/publicar"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-7 py-4 rounded-full transition-all shadow-primary-md hover:shadow-primary-lg hover:-translate-y-0.5"
            >
              <span>Publicar mi cuarto</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#como-funciona"
              className="flex items-center justify-center gap-2 glass-dark hover:bg-white/20 text-white font-semibold text-base px-7 py-4 rounded-full transition-all"
            >
              <span>Ver cómo funciona</span>
            </a>
          </div>

          {/* Animated stat cards — each in its own component to satisfy Rules of Hooks */}
          <div className="flex flex-wrap gap-4 mb-8">
            {statDefs.map((stat, index) => (
              <StatCard key={stat.label} {...stat} delay={0.4 + index * 0.1} />
            ))}
          </div>

          {/* Social proof */}
          <div
            className="glass rounded-xl px-4 py-3 inline-flex items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "0.7s", opacity: 0 }}
          >
            <div className="flex -space-x-2" aria-hidden="true">
              {recentUsers.map((user) => (
                <div
                  key={user.name}
                  className="w-8 h-8 rounded-full bg-muted-bg border-2 border-white flex items-center justify-center text-xs font-bold text-primary"
                >
                  {user.name[0]}
                </div>
              ))}
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold">Ana</span> se mudó a Guadalajara{" "}
              <span className="text-muted">hace 2 días</span>
            </p>
            <TrendingUp size={16} className="text-green-600" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Floating decorative room card */}
      <div className="hidden lg:block absolute right-8 bottom-24 z-10 animate-float">
        <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-primary-lg transform -rotate-3">
          <Image
            src="/images/rooms/room-1.jpg"
            alt="Habitación acogedora disponible"
            fill
            className="object-cover"
            sizes="256px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass rounded-lg px-3 py-2">
              <p className="text-foreground font-semibold text-sm">Desde $180/mes</p>
              <p className="text-foreground/70 text-xs">Guadalajara, MX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close city dropdown */}
      {cityDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setCityDropdownOpen(false)}
          aria-hidden="true"
        />
      )}
    </section>
  );
}
