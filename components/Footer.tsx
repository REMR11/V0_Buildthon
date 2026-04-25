export default function Footer() {
  return (
    <footer className="bg-foreground text-white/60 py-12">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
          {/* Brand */}
          <div className="max-w-xs">
            <span className="text-2xl font-bold font-serif text-white tracking-tight">
              nidoo
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-primary ml-1 mb-2" />
            <p className="text-sm leading-relaxed mt-3">
              La plataforma de renta de habitaciones más confiable de América
              Latina.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white text-xs uppercase tracking-widest mb-1">
                Plataforma
              </span>
              <a href="#" className="hover:text-white transition-colors">Cómo funciona</a>
              <a href="#" className="hover:text-white transition-colors">Ciudades</a>
              <a href="#" className="hover:text-white transition-colors">Precios</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white text-xs uppercase tracking-widest mb-1">
                Soporte
              </span>
              <a href="#" className="hover:text-white transition-colors">Centro de ayuda</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white text-xs uppercase tracking-widest mb-1">
                Legal
              </span>
              <a href="#" className="hover:text-white transition-colors">Términos de uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 Nidoo. Todos los derechos reservados.</p>
          <p>Hecho con cariño en América Latina 🇲🇽🇨🇴🇵🇪🇸🇻</p>
        </div>
      </div>
    </footer>
  );
}
