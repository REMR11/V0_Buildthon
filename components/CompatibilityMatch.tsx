"use client";

import { useState } from "react";
import {
  Users,
  Music,
  Moon,
  Sun,
  Dumbbell,
  Gamepad2,
  BookOpen,
  Coffee,
  Dog,
  Cigarette,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";

const lifestyleTraits = [
  { icon: Sun, label: "Madrugador", id: "early" },
  { icon: Moon, label: "Nocturno", id: "night" },
  { icon: Music, label: "Le sube a la music", id: "music" },
  { icon: Dumbbell, label: "Gym rat", id: "gym" },
  { icon: Gamepad2, label: "Gamer", id: "gamer" },
  { icon: BookOpen, label: "Estudioso", id: "studious" },
  { icon: Coffee, label: "Home office", id: "remote" },
  { icon: Dog, label: "Con mascota", id: "pet" },
];

const benefits = [
  {
    icon: Users,
    title: "Match por compatibilidad",
    description:
      "Nuestro algoritmo analiza tus habitos, horarios y preferencias para conectarte con personas que realmente hacen click contigo.",
  },
  {
    icon: TrendingDown,
    title: "Divide y ahorra",
    description:
      "Comparte renta, servicios y hasta la despensa. Nuestros usuarios ahorran en promedio un 50% vs. rentar solos.",
  },
  {
    icon: ShieldCheck,
    title: "Sin desconocidos, sin riesgo",
    description:
      "Todos los perfiles son verificados con ID oficial. Antes de compartir, ya sabes con quien vas a vivir.",
  },
];

export default function CompatibilityMatch() {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const toggleTrait = (id: string) => {
    setSelectedTraits((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <section id="compatibilidad" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Lo que nos hace diferentes
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            {"No es solo rentar. Es vivir con alguien que te entiende."}
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            {"Sabemos que compartir espacio con un desconocido da cosa. Por eso creamos un sistema que te conecta con personas que tienen tu mismo rollo."}
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className="relative bg-card rounded-2xl p-8 border border-border hover:shadow-primary-sm transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon size={26} className="text-primary" />
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted leading-relaxed text-sm">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive trait picker */}
        <div className="bg-secondary rounded-3xl p-8 md:p-12 border border-border">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: trait selector */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-primary" />
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Pronto disponible
                </span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance">
                {"Dinos como eres y te encontramos a tu match"}
              </h3>
              <p className="text-muted leading-relaxed mb-6">
                {"Selecciona lo que te define. Nuestro sistema buscara personas con habitos y estilos de vida compatibles."}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {lifestyleTraits.map((trait) => {
                  const Icon = trait.icon;
                  const isSelected = selectedTraits.includes(trait.id);
                  return (
                    <button
                      key={trait.id}
                      onClick={() => toggleTrait(trait.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-primary-sm"
                          : "bg-card border border-border text-foreground/70 hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <Icon size={16} />
                      {trait.label}
                    </button>
                  );
                })}
              </div>

              <a
                href="/registro"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3.5 rounded-full transition-all shadow-primary-md hover:shadow-primary-lg hover:-translate-y-0.5"
              >
                <span>{"Quiero encontrar mi roommate"}</span>
                <ArrowRight size={18} />
              </a>
            </div>

            {/* Right: preview card */}
            <div className="relative">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Tu match ideal</h4>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {selectedTraits.length > 0
                      ? `${Math.min(65 + selectedTraits.length * 4, 97)}% compatible`
                      : "Selecciona tus gustos"}
                  </span>
                </div>

                {/* Compatibility bar */}
                <div className="w-full h-2 bg-muted-bg rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: selectedTraits.length > 0
                        ? `${Math.min(65 + selectedTraits.length * 4, 97)}%`
                        : "0%",
                    }}
                  />
                </div>

                {/* Mock profile cards */}
                <div className="space-y-3">
                  {[
                    { name: "Ana G.", age: 24, city: "GDL", compatibility: 94, traits: ["Gym rat", "Madrugadora"] },
                    { name: "Carlos M.", age: 27, city: "CDMX", compatibility: 89, traits: ["Gamer", "Home office"] },
                    { name: "Valentina R.", age: 22, city: "Bogota", compatibility: 85, traits: ["Estudiosa", "No fuma"] },
                  ].map((profile, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                        selectedTraits.length > 0
                          ? "bg-secondary border border-border"
                          : "bg-muted-bg/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {profile.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">
                            {profile.name}
                          </p>
                          <span className="text-xs text-muted">
                            {profile.age} - {profile.city}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {profile.traits.map((trait) => (
                            <span
                              key={trait}
                              className="text-xs bg-background text-muted px-2 py-0.5 rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">
                        {selectedTraits.length > 0
                          ? `${profile.compatibility - (3 - i) * (selectedTraits.length % 3)}%`
                          : "--"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Savings callout */}
                <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-3">
                  <TrendingDown size={18} className="text-primary shrink-0" />
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-primary">Ahorro estimado:</span>{" "}
                    {"$150-200 USD/mes al compartir con tu match"}
                  </p>
                </div>
              </div>

              {/* Decorative dots */}
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary/20" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-primary/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
