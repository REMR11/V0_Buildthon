"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <span className="text-2xl font-bold font-serif text-primary tracking-tight">
            nidoo
          </span>
          <span className="w-2 h-2 rounded-full bg-primary mt-1" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
          <a href="#como-funciona" className="hover:text-primary transition-colors">
            Cómo funciona
          </a>
          <a href="#confianza" className="hover:text-primary transition-colors">
            Confianza
          </a>
          <a href="#ciudades" className="hover:text-primary transition-colors">
            Ciudades
          </a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Iniciar sesión
          </a>
          <a
            href="/registro"
            className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full transition-colors"
          >
            Publicar cuarto
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground/70 hover:text-primary transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border px-5 py-4 flex flex-col gap-4 text-sm font-medium">
          <a href="#como-funciona" onClick={() => setOpen(false)} className="text-foreground/70 hover:text-primary transition-colors">
            Cómo funciona
          </a>
          <a href="#confianza" onClick={() => setOpen(false)} className="text-foreground/70 hover:text-primary transition-colors">
            Confianza
          </a>
          <a href="#ciudades" onClick={() => setOpen(false)} className="text-foreground/70 hover:text-primary transition-colors">
            Ciudades
          </a>
          <a href="/registro" className="bg-primary hover:bg-primary-hover text-white text-center px-4 py-2 rounded-full transition-colors font-semibold">
            Publicar cuarto
          </a>
        </div>
      )}
    </header>
  );
}
