"use client";

import {
  BadgeCheck,
  FilePenLine,
  ShieldCheck,
  Star,
  Lock,
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
  Calendar,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const signals = [
  {
    icon: BadgeCheck,
    title: "Identidad verificada",
    description:
      "Todos los usuarios pasan por un proceso de verificación de identidad antes de publicar o rentar.",
  },
  {
    icon: FilePenLine,
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
    name: "Rosa M.",
    city: "Guadalajara, M\u00e9xico",
    quote:
      "Ten\u00eda miedo de que un desconocido rentara mi cuarto extra, pero Nidoo verific\u00f3 todo. Ahora tengo una roomie incre\u00edble y un ingreso extra cada mes.",
    stars: 5,
    role: "Propietaria",
  },
  {
    name: "Andr\u00e9s V.",
    city: "Bogot\u00e1, Colombia",
    quote:
      "Llegu\u00e9 a Bogot\u00e1 a estudiar sin conocer a nadie. Nidoo me match\u00f3 con un roomie que tambi\u00e9n es gamer y madrugador. Ahorro $200 al mes y tengo un amigo nuevo.",
    stars: 5,
    role: "Roommate",
  },
  {
    name: "Camila R.",
    city: "Lima, Per\u00fa",
    quote:
      "Buscaba en grupos de WhatsApp y era puro caso. Con Nidoo encontr\u00e9 una compa que tiene el mismo ritmo de vida que yo. Mejor imposible.",
    stars: 5,
    role: "Roommate",
  },
  {
    name: "Miguel S.",
    city: "Medell\u00edn, Colombia",
    quote:
      "Yo pensaba que vivir con un extra\u00f1o era mala idea. Pero Nidoo me conect\u00f3 con alguien que tambi\u00e9n hace home office y le gusta el gym. Ya llevamos 8 meses.",
    stars: 5,
    role: "Roommate",
  },
  {
    name: "Laura H.",
    city: "San Salvador, El Salvador",
    quote:
      "Entre la renta y los servicios gastaba m\u00e1s de la mitad de mi sueldo. Ahora comparto con mi roomie y me sobra para vivir bien. Deber\u00eda ser ilegal no usar Nidoo.",
    stars: 5,
    role: "Roommate",
  },
];

const pressLogos = [
  { name: "Forbes", text: "Forbes" },
  { name: "TechCrunch", text: "TechCrunch" },
  { name: "El País", text: "El País" },
  { name: "Expansión", text: "Expansión" },
  { name: "Bloomberg", text: "Bloomberg" },
];

// Animated counter — hook called at sub-component top-level to obey Rules of Hooks
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) setHasStarted(true);
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

// Isolated sub-component — each calls useCountUp at its own top-level
function AnimatedStat({
  icon: Icon,
  value,
  label,
  prefix,
  suffix,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <div
      ref={ref}
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/10"
    >
      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-primary" />
      </div>
      <p className="text-4xl font-bold text-foreground mb-2 counter-animate">
        {prefix ?? ""}
        {count.toLocaleString("es-MX")}
        {suffix ?? ""}
      </p>
      <p className="text-muted text-sm">{label}</p>
    </div>
  );
}

const statDefs = [
  { icon: Users, value: 12000, label: "Usuarios verificados", prefix: "+" },
  { icon: Home, value: 5000, label: "Habitaciones publicadas", prefix: "+" },
  {
    icon: Calendar,
    value: 98,
    label: "Contratos firmados al día",
    suffix: "%",
  },
];

export default function TrustSignals() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () =>
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () =>
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  // Auto-advance every 5 s
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="confianza" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Seguridad real, no promesas
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            {"Vivir con alguien nuevo no tiene que dar miedo"}
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            {"Verificamos identidades, protegemos pagos y documentamos todo. Para que compartir depa sea una buena experiencia, no un salto de fe."}
          </p>
        </div>

        {/* Press logos strip */}
        <div className="mb-16">
          <p className="text-center text-sm text-muted mb-6">
            Nos han mencionado en:
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {pressLogos.map((logo) => (
              <span
                key={logo.name}
                className="text-xl md:text-2xl font-bold text-muted/40 hover:text-muted/60 transition-colors select-none"
                style={{ fontFamily: "Georgia, serif" }}
                aria-label={logo.name}
              >
                {logo.text}
              </span>
            ))}
          </div>
        </div>

        {/* Animated stats — each in its own sub-component */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {statDefs.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>

        {/* Trust pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {signals.map((signal, i) => {
            const Icon = signal.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center bg-secondary rounded-2xl p-8 border border-border hover:shadow-primary-sm transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
                  <Icon size={26} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {signal.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {signal.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
            <Lock size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">SSL Secure</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-2">
            <ShieldCheck size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              Datos protegidos
            </span>
          </div>
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-2">
            <BadgeCheck size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              Verificación KYC
            </span>
          </div>
        </div>

        {/* Testimonials carousel */}
        <div>
          <div className="text-center mb-8">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
              {"Historias de roommates reales"}
            </h3>
            <p className="text-muted">
              {"Gente como tu que se animo a compartir y no se arrepiente"}
            </p>
          </div>

          <div className="relative">
            {/* Sliding track */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4 md:px-16">
                    <div className="bg-card rounded-2xl p-8 md:p-10 border border-border shadow-sm max-w-2xl mx-auto">
                      {/* Stars */}
                      <div
                        className="flex gap-1 justify-center mb-4"
                        aria-label={`${t.stars} estrellas`}
                      >
                        {Array.from({ length: t.stars }).map((_, s) => (
                          <Star
                            key={s}
                            size={18}
                            className="fill-primary text-primary"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-foreground text-lg md:text-xl leading-relaxed text-center mb-6">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted-bg flex items-center justify-center text-lg font-bold text-primary">
                          {t.name[0]}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">
                            {t.name}
                          </p>
                          <p className="text-muted text-sm">
                            {t.city} &middot;{" "}
                            <span className="text-primary text-xs font-medium">
                              {t.role}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev / Next controls */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentTestimonial
                    ? "bg-primary w-6"
                    : "bg-border hover:bg-muted w-2"
                }`}
                aria-label={`Ir al testimonio ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
