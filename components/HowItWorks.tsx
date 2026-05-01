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
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Tan facil como pedir comida
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            {"De 'busco roomie' a 'ya tengo depa' en 3 pasos"}
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            {"Sin grupos de WhatsApp interminables ni depositos perdidos. Todo es digital, verificado y sin drama."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-14">
          <div className="flex bg-muted-bg rounded-full p-1 gap-1">
            <button
              onClick={() => setRole("owner")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                role === "owner"
                  ? "bg-primary text-white shadow-primary-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Soy propietario
            </button>
            <button
              onClick={() => setRole("tenant")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                role === "tenant"
                  ? "bg-primary text-white shadow-primary-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Soy inquilino
            </button>
          </div>
        </div>

        {/* Steps with connector line */}
        <div className="relative">
          {/* Connector line - hidden on mobile */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {/* Arrow connectors between steps */}
          <div className="hidden md:flex absolute top-[5.5rem] left-0 right-0 justify-around px-24">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight size={16} className="text-primary" />
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight size={16} className="text-primary" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={`${role}-${index}`}
                  className="relative bg-card rounded-2xl p-8 shadow-sm border border-border flex flex-col gap-5 hover:shadow-primary-sm transition-shadow animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-primary-sm">
                    {index + 1}
                  </div>

                  {/* Large watermark number */}
                  <span className="absolute top-4 right-6 text-6xl font-bold text-muted-bg/50 select-none leading-none">
                    {index + 1}
                  </span>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mt-2">
                    <Icon size={26} className="text-primary" />
                  </div>

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
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check size={12} className="text-green-600" />
                          </div>
                          <span className="text-foreground/80">{benefit}</span>
                        </li>
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
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA based on role */}
        <div className="text-center mt-12">
          <a
            href={role === "owner" ? "/publicar" : "/explorar"}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-full transition-all shadow-primary-md hover:shadow-primary-lg hover:-translate-y-0.5"
          >
            <span>{role === "owner" ? "Publicar mi cuarto gratis" : "Buscar habitaciones"}</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
