"use client";

import { useState } from "react";
import {
  Camera,
  FileText,
  CreditCard,
  Search,
  MessageCircle,
  KeyRound,
} from "lucide-react";

const ownerSteps = [
  {
    icon: Camera,
    title: "Publica tu cuarto",
    description:
      "Sube fotos, describe el espacio y define tus condiciones. Todo en menos de 10 minutos.",
  },
  {
    icon: FileText,
    title: "Recibe solicitudes",
    description:
      "Revisa perfiles verificados de posibles inquilinos y elige al que mejor se ajuste a ti.",
  },
  {
    icon: CreditCard,
    title: "Firma y cobra seguro",
    description:
      "Contrato digital y pagos mensuales automáticos. Sin trámites engorrosos ni riesgos.",
  },
];

const tenantSteps = [
  {
    icon: Search,
    title: "Busca tu habitación",
    description:
      "Filtra por ciudad, precio, y características. Sin grupos de WhatsApp ni información falsa.",
  },
  {
    icon: MessageCircle,
    title: "Contacta al propietario",
    description:
      "Chatea directamente, agenda visitas y resuelve todas tus dudas antes de comprometerte.",
  },
  {
    icon: KeyRound,
    title: "Mudate con tranquilidad",
    description:
      "Firma el contrato digital y paga en línea. Tu nuevo hogar en pocos días.",
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
            Simple y transparente
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            ¿Cómo funciona Nidoo?
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Ya seas propietario o inquilino, el proceso es sencillo, seguro y
            completamente digital.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-14">
          <div className="flex bg-muted-bg rounded-full p-1 gap-1">
            <button
              onClick={() => setRole("owner")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                role === "owner"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Soy propietario
            </button>
            <button
              onClick={() => setRole("tenant")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                role === "tenant"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Soy inquilino
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-card rounded-2xl p-8 shadow-sm border border-border flex flex-col gap-5"
              >
                {/* Step number */}
                <span className="absolute top-6 right-6 text-5xl font-bold text-muted-bg select-none leading-none">
                  {index + 1}
                </span>
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
