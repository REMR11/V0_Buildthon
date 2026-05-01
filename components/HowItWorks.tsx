"use client";

import { useState } from "react";
import {
  Camera,
  FileText,
  CreditCard,
  Search,
  MessageCircle,
  KeyRound,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  motion,
  Reveal,
  Stagger,
  TextReveal,
  DrawLine,
  Magnetic,
  staggerItem,
} from "@/components/motion";

const ownerSteps = [
  {
    icon: Camera,
    title: "Publica tu cuarto",
    description:
      "Sube fotos, describe el espacio y define tus condiciones. Todo en menos de 10 minutos.",
    benefits: ["Gratis", "Sin comisiones ocultas"],
  },
  {
    icon: FileText,
    title: "Recibe solicitudes",
    description:
      "Revisa perfiles verificados de posibles inquilinos y elige al que mejor se ajuste a ti.",
    benefits: ["Perfiles verificados", "Chat integrado"],
  },
  {
    icon: CreditCard,
    title: "Firma y cobra seguro",
    description:
      "Contrato digital y pagos mensuales automaticos. Sin tramites engorrosos ni riesgos.",
    benefits: ["Contrato legal", "Depositos protegidos"],
  },
];

const tenantSteps = [
  {
    icon: Search,
    title: "Busca tu zona y roommate",
    description:
      "Filtra por ciudad, precio y estilo de vida. Nidoo te muestra habitaciones y personas compatibles contigo.",
    benefits: ["Match por compatibilidad", "Precios transparentes"],
  },
  {
    icon: MessageCircle,
    title: "Conoce a tu match",
    description:
      "Chatea con tu posible roommate y con el propietario. Resuelve dudas y asegurate de que hay buena vibra antes de comprometerte.",
    benefits: ["Chat integrado", "Perfiles verificados"],
  },
  {
    icon: KeyRound,
    title: "Mudate y divide gastos",
    description:
      "Firma el contrato digital, divide la renta y empieza a ahorrar desde el dia uno. Asi de facil.",
    benefits: ["Ahorro desde el dia 1", "Soporte 24/7"],
  },
];

export default function HowItWorks() {
  const [role, setRole] = useState<"owner" | "tenant">("owner");

  const steps = role === "owner" ? ownerSteps : tenantSteps;

  return (
    <section id="como-funciona" className="py-24 bg-secondary">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal direction="up">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
              Tan facil como pedir comida
            </span>
          </Reveal>
          <TextReveal
            text="De 'busco roomie' a 'ya tengo depa' en 3 pasos"
            as="h2"
            className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4"
            delay={0.1}
          />
          <Reveal direction="up" delay={0.3}>
            <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
              {"Sin grupos de WhatsApp interminables ni depositos perdidos. Todo es digital, verificado y sin drama."}
            </p>
          </Reveal>
        </div>

        {/* Toggle */}
        <Reveal direction="up" delay={0.2}>
          <div className="flex justify-center mb-14">
            <div className="flex bg-muted-bg rounded-full p-1 gap-1">
              <motion.button
                onClick={() => setRole("owner")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  role === "owner"
                    ? "bg-primary text-white shadow-primary-sm"
                    : "text-muted hover:text-foreground"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Soy propietario
              </motion.button>
              <motion.button
                onClick={() => setRole("tenant")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  role === "tenant"
                    ? "bg-primary text-white shadow-primary-sm"
                    : "text-muted hover:text-foreground"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Soy inquilino
              </motion.button>
            </div>
          </div>
        </Reveal>

        {/* Steps with connector line */}
        <div className="relative">
          {/* Animated connector line - hidden on mobile */}
          <DrawLine className="hidden md:block absolute top-24 left-0 right-0 h-0.5" />
          
          {/* Arrow connectors between steps */}
          <div className="hidden md:flex absolute top-[5.5rem] left-0 right-0 justify-around px-24">
            <Reveal direction="none" delay={0.5}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRight size={16} className="text-primary" />
              </div>
            </Reveal>
            <Reveal direction="none" delay={0.7}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRight size={16} className="text-primary" />
              </div>
            </Reveal>
          </div>

          <Stagger className="grid md:grid-cols-3 gap-8" stagger={0.2} key={role}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={`${role}-${index}`}
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="relative bg-card rounded-2xl p-8 shadow-sm border border-border flex flex-col gap-5 hover:shadow-primary-md transition-shadow"
                >
                  {/* Step number badge */}
                  <motion.div
                    className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-primary-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.2, type: "spring", stiffness: 400 }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Large watermark number */}
                  <span className="absolute top-4 right-6 text-6xl font-bold text-muted-bg/50 select-none leading-none">
                    {index + 1}
                  </span>

                  {/* Icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mt-2"
                    whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                  >
                    <Icon size={26} className="text-primary" />
                  </motion.div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted leading-relaxed text-sm mb-4">
                      {step.description}
                    </p>

                    {/* Benefits list */}
                    <ul className="space-y-2">
                      {step.benefits.map((benefit, i) => (
                        <motion.li
                          key={i}
                          className="flex items-center gap-2 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.2 + i * 0.1 }}
                        >
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check size={12} className="text-green-600" />
                          </div>
                          <span className="text-foreground/80">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Mobile connector arrow */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center -mb-12 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center rotate-90">
                        <ArrowRight size={16} className="text-primary" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </Stagger>
        </div>

        {/* CTA based on role */}
        <Reveal direction="up" delay={0.3}>
          <div className="text-center mt-12">
            <Magnetic strength={5}>
              <motion.a
                href={role === "owner" ? "/publicar" : "/explorar"}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-full transition-colors shadow-primary-md animate-glow"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>{role === "owner" ? "Publicar mi cuarto gratis" : "Buscar habitaciones"}</span>
                <ArrowRight size={18} />
              </motion.a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
