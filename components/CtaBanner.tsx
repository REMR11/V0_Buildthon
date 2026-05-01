"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail, Users, TrendingDown, ShieldCheck } from "lucide-react";
import {
  motion,
  Reveal,
  TextReveal,
  FloatingParticle,
  Magnetic,
} from "@/components/motion";

export default function CtaBanner() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <section className="relative py-16 md:py-24 bg-primary overflow-hidden">
      {/* Floating particles */}
      <FloatingParticle className="bg-white/10" size={16} duration={7} x={10} y={15} />
      <FloatingParticle className="bg-white/5" size={24} duration={9} delay={1} x={85} y={25} />
      <FloatingParticle className="bg-white/8" size={12} duration={6} delay={2} x={70} y={75} />
      <FloatingParticle className="bg-white/6" size={20} duration={8} delay={3} x={15} y={65} />

      {/* Decorative rotating circles */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full border border-white/10 animate-rotate-slow pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full border border-white/5 animate-rotate-slow pointer-events-none" style={{ animationDirection: "reverse" }} />

      <div className="max-w-6xl mx-auto px-5 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <Reveal direction="left" delay={0}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">
                <Users size={14} />
                Tu roommate te esta esperando
              </span>
            </Reveal>

            <TextReveal
              text="Deja de pagar renta completa. Encuentra a tu match."
              as="h2"
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance mb-6 leading-tight"
              delay={0.1}
            />

            <Reveal direction="left" delay={0.5}>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                {"Miles de jovenes ya comparten depa con alguien compatible y pagan la mitad. La pregunta no es si puedes confiar en un desconocido, sino por que seguir pagando de mas."}
              </p>
            </Reveal>

            {/* Benefits list */}
            <div className="space-y-3 mb-8">
              {[
                { icon: TrendingDown, text: "Ahorra hasta 50% en tu renta mensual" },
                { icon: Users, text: "Match por gustos, horarios y estilo de vida" },
                { icon: ShieldCheck, text: "Perfiles verificados con ID oficial" },
              ].map((benefit, i) => (
                <Reveal key={i} direction="left" delay={0.6 + i * 0.1}>
                  <div className="flex items-center gap-3 text-white/90">
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.3, backgroundColor: "rgba(255,255,255,0.35)" }}
                    >
                      <benefit.icon size={12} className="text-white" />
                    </motion.div>
                    <span>{benefit.text}</span>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* CTA Buttons */}
            <Reveal direction="left" delay={0.9}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Magnetic strength={5}>
                  <motion.a
                    href="/registro"
                    className="flex items-center justify-center gap-2 bg-white hover:bg-secondary text-primary font-semibold text-base px-8 py-4 rounded-full transition-colors shadow-lg"
                    whileHover={{ scale: 1.03, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>Encontrar mi roommate</span>
                    <ArrowRight size={18} />
                  </motion.a>
                </Magnetic>
                <motion.a
                  href="/explorar"
                  className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/40 font-semibold text-base px-8 py-4 rounded-full transition-colors"
                  whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.7)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Ver habitaciones
                </motion.a>
              </div>
            </Reveal>
          </div>

          {/* Right side - Email form */}
          <Reveal direction="right" delay={0.3}>
            <div className="relative">
              {/* Decorative background */}
              <motion.div
                className="absolute -top-8 -right-8 w-64 h-64 bg-white/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              />

              {/* Card */}
              <motion.div
                className="relative bg-white rounded-3xl p-8 shadow-2xl"
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 200 } }}
              >
                {/* Savings calculator preview */}
                <div className="bg-secondary rounded-2xl p-5 mb-6">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                    Ejemplo real de ahorro
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted">Renta solo/a</span>
                    <span className="text-sm font-semibold text-foreground line-through opacity-60">$380 USD/mes</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted">Con tu roommate</span>
                    <motion.span
                      className="text-sm font-bold text-primary"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      $190 USD/mes
                    </motion.span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Ahorras al mes</span>
                    <motion.span
                      className="text-lg font-bold text-primary"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                    >
                      $190 USD
                    </motion.span>
                  </div>
                </div>

                {/* Email form */}
                {!isSubmitted ? (
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {"Se de los primeros en usar el matching"}
                    </h3>
                    <p className="text-muted text-sm mb-4">
                      {"Dejanos tu correo y te avisamos cuando el sistema de compatibilidad este listo en tu ciudad."}
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@email.com"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2 animate-glow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            Enviando...
                          </motion.span>
                        ) : (
                          <>
                            <span>Avisarme cuando este listo</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </motion.button>
                    </form>
                    <p className="text-muted text-xs text-center mt-3">
                      Sin spam. Solo lo importante.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="text-center py-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
                    >
                      <Check size={32} className="text-green-600" />
                    </motion.div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {"Listo, estas en la lista!"}
                    </h3>
                    <p className="text-muted text-sm">
                      Te avisaremos en cuanto el matching este disponible.
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Urgency badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">
                  2,300+ en lista de espera
                </span>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
