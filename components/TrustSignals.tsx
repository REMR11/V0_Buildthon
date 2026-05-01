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
import {
  motion,
  useInView,
  Reveal,
  Stagger,
  TextReveal,
  staggerItem,
  staggerItemScale,
} from "@/components/motion";

const signals = [
  {
    icon: BadgeCheck,
    title: "Identidad verificada",
    description:
      "Todos los usuarios pasan por un proceso de verificaci\u00f3n de identidad antes de publicar o rentar.",
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
      "Procesa rentas mensuales de forma autom\u00e1tica y segura. Sin efectivo, sin malentendidos.",
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
  { name: "El Pa\u00eds", text: "El Pa\u00eds" },
  { name: "Expansi\u00f3n", text: "Expansi\u00f3n" },
  { name: "Bloomberg", text: "Bloomberg" },
];

// Animated counter
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
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

function AnimatedStat({
  icon: Icon,
  value,
  label,
  prefix,
  suffix,
  index,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  index: number;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/10"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
    >
      <motion.div
        className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4"
        whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
      >
        <Icon size={24} className="text-primary" />
      </motion.div>
      <p className="text-4xl font-bold text-foreground mb-2 counter-animate">
        {prefix ?? ""}
        {count.toLocaleString("es-MX")}
        {suffix ?? ""}
      </p>
      <p className="text-muted text-sm">{label}</p>
    </motion.div>
  );
}

const statDefs = [
  { icon: Users, value: 12000, label: "Usuarios verificados", prefix: "+" },
  { icon: Home, value: 5000, label: "Habitaciones publicadas", prefix: "+" },
  { icon: Calendar, value: 98, label: "Contratos firmados al d\u00eda", suffix: "%" },
];

export default function TrustSignals() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () =>
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () =>
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="confianza" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal direction="up">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
              Seguridad real, no promesas
            </span>
          </Reveal>
          <TextReveal
            text="Vivir con alguien nuevo no tiene que dar miedo"
            as="h2"
            className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4"
            delay={0.1}
          />
          <Reveal direction="up" delay={0.4}>
            <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
              {"Verificamos identidades, protegemos pagos y documentamos todo. Para que compartir depa sea una buena experiencia, no un salto de fe."}
            </p>
          </Reveal>
        </div>

        {/* Press logos strip */}
        <Reveal direction="up" delay={0.2}>
          <div className="mb-16">
            <p className="text-center text-sm text-muted mb-6">
              Nos han mencionado en:
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {pressLogos.map((logo, i) => (
                <motion.span
                  key={logo.name}
                  className="text-xl md:text-2xl font-bold text-muted/40 hover:text-muted/60 transition-colors select-none"
                  style={{ fontFamily: "Georgia, serif" }}
                  aria-label={logo.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.1, color: "var(--primary)" }}
                >
                  {logo.text}
                </motion.span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Animated stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {statDefs.map((stat, i) => (
            <AnimatedStat key={stat.label} {...stat} index={i} />
          ))}
        </div>

        {/* Trust pillars */}
        <Stagger className="grid md:grid-cols-3 gap-6 mb-16" stagger={0.15}>
          {signals.map((signal, i) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
                className="flex flex-col items-center text-center bg-secondary rounded-2xl p-8 border border-border hover:shadow-primary-md transition-shadow"
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5"
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                >
                  <Icon size={26} className="text-primary" />
                </motion.div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {signal.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {signal.description}
                </p>
              </motion.div>
            );
          })}
        </Stagger>

        {/* Security badges */}
        <Stagger className="flex flex-wrap justify-center items-center gap-4 mb-16" stagger={0.1}>
          {[
            { icon: Lock, label: "SSL Secure", bg: "bg-green-50", border: "border-green-200", iconColor: "text-green-600", textColor: "text-green-700" },
            { icon: ShieldCheck, label: "Datos protegidos", bg: "bg-secondary", border: "border-border", iconColor: "text-primary", textColor: "text-foreground" },
            { icon: BadgeCheck, label: "Verificaci\u00f3n KYC", bg: "bg-secondary", border: "border-border", iconColor: "text-primary", textColor: "text-foreground" },
          ].map((badge, i) => (
            <motion.div
              key={i}
              variants={staggerItemScale}
              className={`flex items-center gap-2 ${badge.bg} border ${badge.border} rounded-full px-4 py-2`}
              whileHover={{ scale: 1.05 }}
            >
              <badge.icon size={16} className={badge.iconColor} />
              <span className={`text-sm font-medium ${badge.textColor}`}>{badge.label}</span>
            </motion.div>
          ))}
        </Stagger>

        {/* Testimonials carousel */}
        <Reveal direction="up">
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
                <motion.div
                  className="flex"
                  animate={{ x: `-${currentTestimonial * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {testimonials.map((t, i) => (
                    <div key={i} className="w-full flex-shrink-0 px-4 md:px-16">
                      <div className="bg-card rounded-2xl p-8 md:p-10 border border-border shadow-sm max-w-2xl mx-auto">
                        {/* Stars */}
                        <div className="flex gap-1 justify-center mb-4" aria-label={`${t.stars} estrellas`}>
                          {Array.from({ length: t.stars }).map((_, s) => (
                            <motion.div
                              key={s}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: s * 0.1, type: "spring" }}
                            >
                              <Star size={18} className="fill-primary text-primary" />
                            </motion.div>
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
                            <p className="font-semibold text-foreground">{t.name}</p>
                            <p className="text-muted text-sm">
                              {t.city} &middot;{" "}
                              <span className="text-primary text-xs font-medium">{t.role}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Prev / Next controls */}
              <motion.button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Testimonio anterior"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              <motion.button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Siguiente testimonio"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`h-2 rounded-full transition-colors ${
                    i === currentTestimonial
                      ? "bg-primary w-6"
                      : "bg-border hover:bg-muted w-2"
                  }`}
                  aria-label={`Ir al testimonio ${i + 1}`}
                  animate={{ width: i === currentTestimonial ? 24 : 8 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
