export default function CtaBanner() {
  return (
    <section className="py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-white/60 mb-4">
          Empieza hoy — Es gratis
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white text-balance mb-6 leading-tight">
          Un hogar que se siente tuyo, una habitación que trabaja para ti
        </h2>
        <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
          Miles de personas ya encontraron su lugar en Nidoo. Únete a la
          comunidad de confianza que está cambiando la forma de rentar en
          América Latina.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="#"
            className="flex items-center justify-center gap-2 bg-white hover:bg-secondary text-primary font-semibold text-base px-8 py-4 rounded-full transition-colors shadow-lg"
          >
            Publicar mi cuarto
          </a>
          <a
            href="#"
            className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/50 font-semibold text-base px-8 py-4 rounded-full transition-colors"
          >
            Buscar habitación
          </a>
        </div>

        {/* Small reassurance */}
        <p className="text-white/50 text-xs mt-8">
          Sin comisiones ocultas · Verificación gratuita · Soporte en español
        </p>
      </div>
    </section>
  );
}
