"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Map, Search, Heart, User, Home, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "@/components/motion";

const NAV_SECTIONS = [
  { id: "como-funciona", label: "C\u00f3mo funciona" },
  { id: "confianza", label: "Confianza" },
  { id: "habitaciones", label: "Habitaciones" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for active section detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    NAV_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".account-dropdown")) {
        setAccountOpen(false);
      }
      if (!target.closest(".search-modal") && !target.closest(".search-trigger")) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explorar?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-border shadow-sm"
            : "bg-background/70 backdrop-blur-sm border-transparent"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.span
              className="text-2xl font-bold font-serif text-primary tracking-tight"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              nidoo
            </motion.span>
            <motion.span
              className="w-2 h-2 rounded-full bg-primary mt-1"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Link>

          {/* Desktop nav with active indicator */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
            {NAV_SECTIONS.map(({ id, label }) => (
              <motion.a
                key={id}
                href={`#${id}`}
                aria-current={activeSection === id ? "true" : undefined}
                className={`relative hover:text-primary transition-colors ${
                  activeSection === id ? "text-primary" : ""
                }`}
                whileHover={{ y: -1 }}
              >
                {label}
                {activeSection === id && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    layoutId="nav-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
            <Link
              href="/match"
              className="flex items-center gap-1.5 hover:text-primary transition-colors font-semibold text-primary"
            >
              <Sparkles size={14} />
              Encontrar match
            </Link>
            <Link href="/ciudades" className="hover:text-primary transition-colors">
              Ciudades
            </Link>
            <Link
              href="/explorar"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Map size={14} />
              Explorar mapa
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={() => setSearchOpen(true)}
              className="search-trigger p-2 rounded-full hover:bg-secondary transition-colors text-foreground/70 hover:text-primary"
              aria-label="Buscar"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search size={20} />
            </motion.button>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href="/favoritos"
                className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground/70 hover:text-primary block"
                aria-label="Favoritos"
              >
                <Heart size={20} />
              </Link>
            </motion.div>

            {/* Account dropdown */}
            <div className="relative account-dropdown">
              <motion.button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:shadow-md transition-all bg-card"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Menu size={16} className="text-foreground/70" />
                <div className="w-7 h-7 rounded-full bg-muted-bg flex items-center justify-center">
                  <User size={16} className="text-muted" />
                </div>
              </motion.button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-lg border border-border py-2"
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href="/registro"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-sm font-semibold"
                    >
                      Registrarse
                    </Link>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-sm"
                    >
                      Iniciar sesi\u00f3n
                    </Link>
                    <div className="border-t border-border my-2" />
                    <Link
                      href="/publicar"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-sm"
                    >
                      <Home size={16} />
                      Publicar mi cuarto
                    </Link>
                    <Link
                      href="/ayuda"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-sm"
                    >
                      Centro de ayuda
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile: Search + Menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              onClick={() => setSearchOpen(true)}
              className="search-trigger p-2 rounded-full hover:bg-secondary transition-colors text-foreground/70"
              aria-label="Buscar"
              whileTap={{ scale: 0.9 }}
            >
              <Search size={20} />
            </motion.button>
            <motion.button
              className="text-foreground/70 hover:text-primary transition-colors p-2"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={22} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="md:hidden bg-background border-t border-border px-5 py-4 flex flex-col gap-4 text-sm font-medium"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {NAV_SECTIONS.map(({ id, label }, i) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  aria-current={activeSection === id ? "true" : undefined}
                  className={`text-foreground/70 hover:text-primary transition-colors ${
                    activeSection === id ? "text-primary font-semibold" : ""
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {label}
                </motion.a>
              ))}
              <Link
                href="/ciudades"
                onClick={() => setOpen(false)}
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Ciudades
              </Link>
              <Link
                href="/match"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-primary font-semibold hover:text-primary-hover transition-colors"
              >
                <Sparkles size={14} />
                Encontrar match
              </Link>
              <Link
                href="/explorar"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-foreground/70 hover:text-primary transition-colors"
              >
                <Map size={14} />
                Explorar mapa
              </Link>
              <Link
                href="/favoritos"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-foreground/70 hover:text-primary transition-colors"
              >
                <Heart size={14} />
                Mis favoritos
              </Link>
              <div className="border-t border-border pt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-foreground/70 hover:text-primary transition-colors font-medium"
                >
                  Iniciar sesi\u00f3n
                </Link>
                <Link
                  href="/explorar"
                  className="bg-primary hover:bg-primary-hover text-white text-center px-4 py-2.5 rounded-full transition-colors font-semibold"
                >
                  Buscar cuarto
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="search-modal w-full max-w-xl bg-card rounded-2xl shadow-2xl border border-border"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <form onSubmit={handleSearch} className="p-4">
                <div className="flex items-center gap-3">
                  <Search size={20} className="text-muted flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar ciudad, zona o universidad..."
                    className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
                    autoFocus
                  />
                  <motion.button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} className="text-muted" />
                  </motion.button>
                </div>
              </form>

              {/* Popular searches */}
              <div className="border-t border-border px-4 py-3">
                <p className="text-xs font-medium text-muted mb-3">B\u00fasquedas populares</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Guadalajara, cerca de UDG",
                    "Bogot\u00e1, Zona T",
                    "Lima, Miraflores",
                    "Medell\u00edn, El Poblado",
                    "San Salvador Centro",
                  ].map((suggestion, i) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        window.location.href = `/explorar?q=${encodeURIComponent(suggestion)}`;
                      }}
                      className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-muted-bg transition-colors text-foreground/80"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div className="border-t border-border px-4 py-3">
                <p className="text-xs font-medium text-muted mb-2">Ciudades destacadas</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { city: "Guadalajara", count: "324 habitaciones" },
                    { city: "Bogot\u00e1", count: "512 habitaciones" },
                    { city: "Lima", count: "289 habitaciones" },
                    { city: "Medell\u00edn", count: "198 habitaciones" },
                  ].map(({ city, count }, i) => (
                    <motion.div
                      key={city}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        href={`/explorar?ciudad=${city.toLowerCase()}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                        onClick={() => setSearchOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted-bg flex items-center justify-center">
                          <Map size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{city}</p>
                          <p className="text-xs text-muted">{count}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
