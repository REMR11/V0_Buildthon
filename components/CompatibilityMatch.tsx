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
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import {
  motion,
  Reveal,
  Stagger,
  TextReveal,
  FloatingParticle,
  Magnetic,
  staggerItem,
} from "@/components/motion";

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
    <section id="compatibilidad" className="relative py-24 bg-background overflow-hidden">
      {/* Decorative floating particles */}
      <FloatingParticle className="bg-primary/10" size={20} duration={8} x={5} y={10} />
      <FloatingParticle className="bg-primary/5" size={30} duration={10} delay={2} x={92} y={20} />
      <FloatingParticle className="bg-primary/8" size={14} duration={7} delay={1} x={80} y={70} />

      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal direction="up" delay={0}>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
              Lo que nos hace diferentes
            </span>
          </Reveal>
          <TextReveal
            text="No es solo rentar. Es vivir con alguien que te entiende."
            as="h2"
            className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4"
            delay={0.1}
          />
          <Reveal direction="up" delay={0.4}>
            <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
              {"Sabemos que compartir espacio con un desconocido da cosa. Por eso creamos un sistema que te conecta con personas que tienen tu mismo rollo."}
            </p>
          </Reveal>
        </div>

        {/* Benefits grid */}
        <Stagger className="grid md:grid-cols-3 gap-6 mb-16" stagger={0.15}>
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
                className="relative bg-card rounded-2xl p-8 border border-border hover:shadow-primary-md transition-shadow group"
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                >
                  <Icon size={26} className="text-primary" />
                </motion.div>
                <h3 className="font-semibold text-xl text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted leading-relaxed text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </Stagger>

        {/* Interactive trait picker */}
        <Reveal direction="up" delay={0.1}>
          <div className="bg-secondary rounded-3xl p-8 md:p-12 border border-border relative overflow-hidden">
            {/* Decorative rotating element */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-primary/10 animate-rotate-slow pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full border border-primary/5 animate-rotate-slow pointer-events-none" style={{ animationDirection: "reverse" }} />

            <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
              {/* Left: trait selector */}
              <div>
                <Reveal direction="left" delay={0.1}>
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles size={18} className="text-primary" />
                    </motion.div>
                    <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                      Pronto disponible
                    </span>
                  </div>
                </Reveal>
                <Reveal direction="left" delay={0.2}>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance">
                    {"Dinos como eres y te encontramos a tu match"}
                  </h3>
                </Reveal>
                <Reveal direction="left" delay={0.3}>
                  <p className="text-muted leading-relaxed mb-6">
                    {"Selecciona lo que te define. Nuestro sistema buscara personas con habitos y estilos de vida compatibles."}
                  </p>
                </Reveal>

                <div className="flex flex-wrap gap-2 mb-6">
                  {lifestyleTraits.map((trait, i) => {
                    const Icon = trait.icon;
                    const isSelected = selectedTraits.includes(trait.id);
                    return (
                      <motion.button
                        key={trait.id}
                        onClick={() => toggleTrait(trait.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-white shadow-primary-sm"
                            : "bg-card border border-border text-foreground/70 hover:border-primary/40 hover:text-foreground"
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        layout
                      >
                        <Icon size={16} />
                        {trait.label}
                      </motion.button>
                    );
                  })}
                </div>

                <Magnetic strength={5}>
                  <motion.a
                    href="/registro"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3.5 rounded-full transition-colors shadow-primary-md animate-glow"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>{"Quiero encontrar mi roommate"}</span>
                    <ArrowRight size={18} />
                  </motion.a>
                </Magnetic>
              </div>

              {/* Right: preview card */}
              <Reveal direction="right" delay={0.3}>
                <div className="relative">
                  <motion.div
                    className="bg-card rounded-2xl p-6 border border-border shadow-sm"
                    animate={selectedTraits.length > 0 ? { boxShadow: "0 4px 16px -4px rgba(224, 112, 48, 0.3)" } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">Tu match ideal</h4>
                      <motion.span
                        className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full"
                        key={selectedTraits.length}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {selectedTraits.length > 0
                          ? `${Math.min(65 + selectedTraits.length * 4, 97)}% compatible`
                          : "Selecciona tus gustos"}
                      </motion.span>
                    </div>

                    {/* Compatibility bar */}
                    <div className="w-full h-2 bg-muted-bg rounded-full mb-6 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{
                          width: selectedTraits.length > 0
                            ? `${Math.min(65 + selectedTraits.length * 4, 97)}%`
                            : "0%",
                        }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>

                    {/* Mock profile cards */}
                    <div className="space-y-3">
                      {[
                        { name: "Ana G.", age: 24, city: "GDL", compatibility: 94, traits: ["Gym rat", "Madrugadora"] },
                        { name: "Carlos M.", age: 27, city: "CDMX", compatibility: 89, traits: ["Gamer", "Home office"] },
                        { name: "Valentina R.", age: 22, city: "Bogota", compatibility: 85, traits: ["Estudiosa", "No fuma"] },
                      ].map((profile, i) => (
                        <motion.div
                          key={i}
                          className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                            selectedTraits.length > 0
                              ? "bg-secondary border border-border"
                              : "bg-muted-bg/50"
                          }`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.12 }}
                          whileHover={{ x: 4, transition: { type: "spring", stiffness: 300 } }}
                        >
                          <motion.div
                            className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0"
                            whileHover={{ scale: 1.15 }}
                          >
                            {profile.name[0]}
                          </motion.div>
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
                          <motion.span
                            className="text-xs font-bold text-primary shrink-0"
                            key={`${i}-${selectedTraits.length}`}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                          >
                            {selectedTraits.length > 0
                              ? `${profile.compatibility - (3 - i) * (selectedTraits.length % 3)}%`
                              : "--"}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Savings callout */}
                    <motion.div
                      className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <TrendingDown size={18} className="text-primary shrink-0" />
                      <p className="text-sm text-foreground">
                        <span className="font-semibold text-primary">Ahorro estimado:</span>{" "}
                        {"$150-200 USD/mes al compartir con tu match"}
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Decorative dots */}
                  <motion.div
                    className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-primary/10"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
