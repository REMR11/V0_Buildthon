import Image from "next/image";

export default function Hero() {
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
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 md:py-32 w-full">
        <div className="max-w-lg">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-white/90 px-3 py-1 rounded-full mb-6">
            Plataforma de renta en América Latina
          </span>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-6">
            Tu hogar lejos de casa, con total confianza
          </h1>

          <p className="text-white/85 text-lg md:text-xl leading-relaxed mb-10 text-pretty">
            Conectamos propietarios con habitaciones disponibles y estudiantes o
            trabajadores que buscan alojamiento accesible y seguro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/registro"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-7 py-4 rounded-full transition-colors shadow-lg"
            >
              <span>Publicar mi cuarto</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#"
              className="flex items-center justify-center gap-2 bg-white/95 hover:bg-white text-foreground font-semibold text-base px-7 py-4 rounded-full transition-colors shadow-lg"
            >
              <span>Buscar habitación</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Social proof numbers */}
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-white font-bold text-2xl">+5,000</p>
              <p className="text-white/70 text-sm">habitaciones publicadas</p>
            </div>
            <div className="w-px bg-white/30" />
            <div>
              <p className="text-white font-bold text-2xl">+12,000</p>
              <p className="text-white/70 text-sm">inquilinos felices</p>
            </div>
            <div className="w-px bg-white/30" />
            <div>
              <p className="text-white font-bold text-2xl">5 países</p>
              <p className="text-white/70 text-sm">en América Latina</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
