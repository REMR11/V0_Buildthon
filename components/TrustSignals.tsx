import { BadgeCheck, FileSignature, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";

const signals = [
  {
    icon: BadgeCheck,
    title: "Identidad verificada",
    description:
      "Todos los usuarios pasan por un proceso de verificación de identidad antes de publicar o rentar.",
  },
  {
    icon: FileSignature,
    title: "Contrato digital",
    description:
      "Genera y firma contratos de arrendamiento 100% legales en minutos, sin salir de la plataforma.",
  },
  {
    icon: ShieldCheck,
    title: "Pagos seguros",
    description:
      "Procesa rentas mensuales de forma automática y segura. Sin efectivo, sin malentendidos.",
  },
];

const testimonials = [
  {
    avatar: "/images/avatar-1.jpg",
    name: "Rosa Méndez",
    city: "Guadalajara, México",
    quote:
      "Tenía miedo de rentar a un extraño, pero con Nidoo verifiqué la identidad del inquilino y firmamos el contrato en línea. Fue facilísimo.",
    stars: 5,
  },
  {
    avatar: "/images/avatar-2.jpg",
    name: "Andrés Villanueva",
    city: "Bogotá, Colombia",
    quote:
      "Llegué a Bogotá a estudiar sin conocer a nadie. En tres días encontré una habitación limpia y segura. Nidoo me salvó el semestre.",
    stars: 5,
  },
  {
    avatar: "/images/avatar-3.jpg",
    name: "Camila Ríos",
    city: "Lima, Perú",
    quote:
      "Buscaba en grupos de WhatsApp y era un caos. Nidoo tiene fotos reales, precios claros y atención inmediata. No vuelvo a buscar diferente.",
    stars: 5,
  },
];

export default function TrustSignals() {
  return (
    <section id="confianza" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Tu tranquilidad, nuestra prioridad
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            Diseñado para inspirar confianza
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Cada función de Nidoo fue pensada para proteger a propietarios e
            inquilinos por igual.
          </p>
        </div>

        {/* Trust badges */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {signals.map((signal, i) => {
            const Icon = signal.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center bg-secondary rounded-2xl p-8 border border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
                  <Icon size={26} className="text-primary" />
                </div>
                <h3 className="font-semibold text-base text-foreground mb-2">
                  {signal.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {signal.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-7 border border-border shadow-sm flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1" aria-label={`${t.stars} estrellas`}>
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star
                    key={s}
                    size={14}
                    className="fill-primary text-primary"
                  />
                ))}
              </div>
              {/* Quote */}
              <p className="text-foreground/80 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Image
                  src={t.avatar}
                  alt={`Foto de ${t.name}`}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {t.name}
                  </p>
                  <p className="text-muted text-xs">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
