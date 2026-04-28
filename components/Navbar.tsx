"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Map, Search, Heart, User, ChevronDown, Home, LogOut } from "lucide-react";

const NAV_SECTIONS = [
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "confianza", label: "Confianza" },
  { id: "habitaciones", label: "Habitaciones" },
  { id: "ciudades", label: "Ciudades" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* Logo - Now functional */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-serif text-primary tracking-tight">
              nidoo
            </span>
            <span className="w-2 h-2 rounded-full bg-primary mt-1" />
          </Link>

          {/* Desktop nav with active indicator */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={activeSection === id ? "true" : undefined}
                className={`relative hover:text-primary transition-colors ${
                  activeSection === id ? "nav-link-active text-primary" : ""
                }`}
              >
                {label}
              </a>
            ))}
            <Link
              href="/explorar"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Map size={14} />
              Explorar mapa
            </Link>
          </nav>

          {/* Desktop CTAs with search and account dropdown */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="search-trigger p-2 rounded-full hover:bg-secondary transition-colors text-foreground/70 hover:text-primary"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {/* Favorites */}
            <Link
              href="/favoritos"
              className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground/70 hover:text-primary"
              aria-label="Favoritos"
            >
              <Heart size={20} />
            </Link>

            {/* Account dropdown */}
            <div className="relative account-dropdown">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:shadow-md transition-all bg-card"
              >
                <Menu size={16} className="text-foreground/70" />
                <div className="w-7 h-7 rounded-full bg-muted-bg flex items-center justify-center">
                  <User size={16} className="text-muted" />
                </div>
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-lg border border-border py-2 animate-scale-in">
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
                    Iniciar sesión
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
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Search + Menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="search-trigger p-2 rounded-full hover:bg-secondary transition-colors text-foreground/70"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
            <button
              className="text-foreground/70 hover:text-primary transition-colors p-2"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-background border-t border-border px-5 py-4 flex flex-col gap-4 text-sm font-medium animate-slide-in-left">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                aria-current={activeSection === id ? "true" : undefined}
                className={`text-foreground/70 hover:text-primary transition-colors ${
                  activeSection === id ? "text-primary font-semibold" : ""
                }`}
              >
                {label}
              </a>
            ))}
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
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="bg-primary hover:bg-primary-hover text-white text-center px-4 py-2.5 rounded-full transition-colors font-semibold"
              >
                Publicar cuarto
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="search-modal w-full max-w-xl bg-card rounded-2xl shadow-2xl border border-border animate-scale-in">
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
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X size={20} className="text-muted" />
                </button>
              </div>
            </form>

            {/* Popular searches */}
            <div className="border-t border-border px-4 py-3">
              <p className="text-xs font-medium text-muted mb-3">Búsquedas populares</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Guadalajara, cerca de UDG",
                  "Bogotá, Zona T",
                  "Lima, Miraflores",
                  "Medellín, El Poblado",
                  "San Salvador Centro",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      window.location.href = `/explorar?q=${encodeURIComponent(suggestion)}`;
                    }}
                    className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-muted-bg transition-colors text-foreground/80"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent searches placeholder */}
            <div className="border-t border-border px-4 py-3">
              <p className="text-xs font-medium text-muted mb-2">Ciudades destacadas</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { city: "Guadalajara", count: "324 habitaciones" },
                  { city: "Bogotá", count: "512 habitaciones" },
                  { city: "Lima", count: "289 habitaciones" },
                  { city: "Medellín", count: "198 habitaciones" },
                ].map(({ city, count }) => (
                  <Link
                    key={city}
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
