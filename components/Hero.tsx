"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Wallet, Users, TrendingDown } from "lucide-react";
import { useState } from "react";
import {
  motion,
  Reveal,
  Magnetic,
  FloatingParticle,
  TextReveal,
} from "@/components/motion";

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
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/images/hero-home.jpg"
          alt="Jovenes compartiendo un espacio de vida moderno"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </motion.div>

      {/* Floating particles */}
      <FloatingParticle className="bg-primary/20" size={12} duration={7} delay={0} x={75} y={15} />
      <FloatingParticle className="bg-white/15" size={8} duration={5} delay={1} x={85} y={45} />
      <FloatingParticle className="bg-primary/15" size={16} duration={8} delay={2} x={65} y={70} />
      <FloatingParticle className="bg-white/10" size={6} duration={6} delay={0.5} x={90} y={80} />
      <FloatingParticle className="bg-primary/10" size={10} duration={9} delay={3} x={70} y={30} />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 md:py-32 w-full">
        <div className="max-w-xl">

          {/* Badge */}
          <motion.span
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary bg-white/95 px-4 py-2 rounded-full mb-8 shadow-primary-sm animate-badge-bounce"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
          >
            <Users size={14} className="text-primary" />
            Encuentra a tu roommate ideal
          </motion.span>

          {/* Headline with word-by-word reveal */}
          <TextReveal
            text="Renta a la mitad, vive con alguien que te cae bien"
            as="h1"
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-5"
            delay={0.3}
            stagger={0.05}
          />

          {/* Subheadline */}
          <Reveal direction="up" delay={0.7} distance={30}>
            <p className="text-white/90 text-lg leading-relaxed mb-4 text-pretty">
              {"Nidoo te conecta con personas de gustos similares para compartir depa y dividir gastos. Sin awk, sin riesgo, sin pagar de m\u00e1s."}
            </p>
          </Reveal>

          {/* Value proposition pills */}
          <Reveal direction="up" delay={0.85}>
            <div className="flex flex-wrap gap-2 mb-8">
              <motion.span
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <TrendingDown size={14} />
                Ahorra hasta 50%
              </motion.span>
              <motion.span
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Users size={14} />
                Match por compatibilidad
              </motion.span>
            </div>
          </Reveal>

          {/* Search form */}
          <motion.form
            onSubmit={handleSearch}
            className="bg-white/95 rounded-2xl p-3 shadow-primary-lg mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
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
                  <motion.ul
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-lg border border-border z-20 overflow-hidden"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {cities.map((city, i) => (
                      <motion.li
                        key={city.name}
                        role="option"
                        aria-selected={selectedCity === city.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
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
                      </motion.li>
                    ))}
                  </motion.ul>
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
            <Magnetic strength={6}>
              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-primary-md animate-glow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search size={18} />
                <span>Encontrar mi roommate</span>
              </motion.button>
            </Magnetic>
          </motion.form>

          {/* Social proof strip */}
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            {socialProof.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.15 }}
              >
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />}
                <span className="text-white font-bold text-base">{stat.value}</span>
                <span className="text-white/65 text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating compatibility card -- desktop only */}
      <motion.div
        className="hidden lg:block absolute right-10 bottom-20 z-10"
        initial={{ opacity: 0, x: 80, rotate: 0 }}
        animate={{ opacity: 1, x: 0, rotate: -3 }}
        transition={{ duration: 1, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative w-64 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-primary-lg p-5"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Users size={20} className="text-primary" />
            </motion.div>
            <div>
              <p className="text-foreground font-semibold text-sm">Match encontrado</p>
              <p className="text-muted text-xs">92% compatible</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Gamer", "Madrugador", "No fuma"].map((tag, i) => (
              <motion.span
                key={tag}
                className="text-xs bg-secondary text-foreground/70 px-2 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + i * 0.15 }}
              >
                {tag}
              </motion.span>
            ))}
            <motion.span
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5 }}
            >
              $190/mes c/u
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

      {/* Overlay to close dropdown */}
      {cityDropdownOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setCityDropdownOpen(false)} aria-hidden="true" />
      )}
    </section>
  );
}
