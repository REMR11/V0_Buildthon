"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Mail, Sparkles } from "lucide-react";

export default function CtaBanner() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <section className="py-16 md:py-24 bg-primary overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">
              <Sparkles size={14} />
              Empieza hoy - Es gratis
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance mb-6 leading-tight">
              Un hogar que se siente tuyo
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Miles de personas ya encontraron su lugar en Nidoo. Unete a la
              comunidad que esta cambiando la forma de rentar en America Latina.
            </p>

            {/* Benefits list */}
            <ul className="space-y-3 mb-8">
              {[
                "Publica gratis y gana hasta $3,000/mes",
                "Sin comisiones ocultas ni sorpresas",
                "Soporte en español 24/7",
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/publicar"
                className="flex items-center justify-center gap-2 bg-white hover:bg-secondary text-primary font-semibold text-base px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Publicar mi cuarto</span>
                <ArrowRight size={18} />
              </a>
              <a
                href="/explorar"
                className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/40 font-semibold text-base px-8 py-4 rounded-full transition-colors"
              >
                Buscar habitacion
              </a>
            </div>
          </div>

          {/* Right side - Email form + Image */}
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

            {/* Card */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              {/* Image */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                <Image
                  src="/images/rooms/room-3.jpg"
                  alt="Habitacion acogedora"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                <div className="absolute bottom-3 left-3 glass rounded-lg px-3 py-1.5">
                  <p className="text-foreground font-semibold text-sm">Disponible ahora</p>
                </div>
              </div>

              {/* Email form */}
              {!isSubmitted ? (
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Recibe las mejores ofertas
                  </h3>
                  <p className="text-muted text-sm mb-4">
                    Suscribete y te avisamos cuando haya habitaciones nuevas en tu ciudad.
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
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span>Enviando...</span>
                      ) : (
                        <>
                          <span>Suscribirme</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                  <p className="text-muted text-xs text-center mt-3">
                    Sin spam. Puedes cancelar cuando quieras.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Te has suscrito!
                  </h3>
                  <p className="text-muted text-sm">
                    Te avisaremos cuando haya habitaciones nuevas disponibles.
                  </p>
                </div>
              )}
            </div>

            {/* Urgency badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                127 nuevas esta semana
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
