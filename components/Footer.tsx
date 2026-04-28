import Link from "next/link";
import { ArrowRight, Mail, Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/60">
      {/* Pre-footer CTA */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">
                Listo para encontrar tu hogar?
              </h3>
              <p className="text-sm">
                Comienza hoy y encuentra la habitacion perfecta para ti.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/explorar"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-all text-sm"
              >
                Buscar ahora
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/publicar"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm"
              >
                Publicar cuarto
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-2xl font-bold font-serif text-white tracking-tight">
                nidoo
              </span>
              <span className="w-2 h-2 rounded-full bg-primary mb-2" />
            </Link>
            <p className="text-sm leading-relaxed mt-3 mb-6">
              La plataforma de renta de habitaciones mas confiable de America
              Latina.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com/nidoo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com/nidoo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://linkedin.com/company/nidoo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://facebook.com/nidoo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white text-xs uppercase tracking-widest mb-2">
                Plataforma
              </span>
              <Link href="/#como-funciona" className="hover:text-white transition-colors">
                Como funciona
              </Link>
              <Link href="/explorar" className="hover:text-white transition-colors">
                Explorar
              </Link>
              <Link href="/#ciudades" className="hover:text-white transition-colors">
                Ciudades
              </Link>
              <Link href="/precios" className="hover:text-white transition-colors">
                Precios
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white text-xs uppercase tracking-widest mb-2">
                Propietarios
              </span>
              <Link href="/publicar" className="hover:text-white transition-colors">
                Publicar cuarto
              </Link>
              <Link href="/propietarios" className="hover:text-white transition-colors">
                Beneficios
              </Link>
              <Link href="/propietarios/consejos" className="hover:text-white transition-colors">
                Consejos
              </Link>
              <Link href="/calculadora" className="hover:text-white transition-colors">
                Calculadora
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white text-xs uppercase tracking-widest mb-2">
                Soporte
              </span>
              <Link href="/ayuda" className="hover:text-white transition-colors">
                Centro de ayuda
              </Link>
              <Link href="/#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/contacto" className="hover:text-white transition-colors">
                Contacto
              </Link>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white text-xs uppercase tracking-widest mb-2">
                Legal
              </span>
              <Link href="/terminos" className="hover:text-white transition-colors">
                Terminos de uso
              </Link>
              <Link href="/privacidad" className="hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
              <Link href="/seguridad" className="hover:text-white transition-colors">
                Seguridad
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium mb-1">Suscribete a nuestro newsletter</p>
              <p className="text-sm">Recibe las mejores habitaciones y consejos en tu email.</p>
            </div>
            <form className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm whitespace-nowrap"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 Nidoo. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Hecho con carino en America Latina</span>
            <span className="flex gap-1">
              <span>MX</span>
              <span>CO</span>
              <span>PE</span>
              <span>SV</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
