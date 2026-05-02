"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Video, Phone, MessageCircle, Heart,
  CheckCircle2, Circle, ChevronRight, Lock, Shield,
  Clock, Lightbulb, User,
} from "lucide-react";
import { mockListings } from "@/lib/listings";

/* ── Tips for the call ────────────────────────────────────────── */
const callTips = [
  { icon: Clock, text: "Pregunta por su rutina diaria y como es un dia tipico en el depa" },
  { icon: User, text: "Habla sobre las reglas basicas: limpieza, visitas, ruido" },
  { icon: Shield, text: "No tengas miedo de preguntar cosas incomodas: es mejor saber ahora" },
  { icon: Lightbulb, text: "Preguntale que espera de un/a roommate ideal" },
  { icon: MessageCircle, text: "Comenta como manejan los conflictos: esto evita problemas futuros" },
];

export default function VideocallPage() {
  const params = useParams();
  const id = Number(params.id);
  const listing = mockListings.find((l) => l.id === id);
  const [calling, setCalling] = useState(false);
  const [ringCount, setRingCount] = useState(0);

  // Simulate ringing
  useEffect(() => {
    if (!calling) return;
    const interval = setInterval(() => {
      setRingCount((c) => {
        if (c >= 4) {
          setCalling(false);
          return 0;
        }
        return c + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [calling]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <Video size={48} className="text-muted mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">No disponible</h1>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium">Volver a resultados</Link>
        </div>
      </div>
    );
  }

  const hostName = listing.host.split(" ")[0];

  // Checklist items
  const checklistItems = [
    { label: "Perfil completo revisado", done: true, href: `/match/${id}` },
    { label: "Chat iniciado", done: false, href: `/match/${id}/chat` },
    { label: "Roommate date completado", done: false, href: `/match/${id}/date` },
  ];

  // ── Calling screen ──
  if (calling) {
    return (
      <div className="min-h-screen bg-foreground flex flex-col items-center justify-center px-5 relative overflow-hidden">
        {/* Pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white/10"
              style={{
                width: `${120 + i * 80}px`,
                height: `${120 + i * 80}px`,
                animation: `pulse-soft ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Avatar */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-6 shadow-primary-lg animate-pulse-soft"
          style={{ backgroundColor: listing.hostColor }}
        >
          {listing.hostInitials}
        </div>

        <h2 className="text-white font-serif text-2xl font-bold mb-2">{listing.host}</h2>
        <p className="text-white/60 text-sm mb-10">
          {"Llamando" + ".".repeat((ringCount % 3) + 1)}
        </p>

        {/* End call */}
        <button
          type="button"
          onClick={() => { setCalling(false); setRingCount(0); }}
          className="bg-red-500 hover:bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg"
          aria-label="Terminar llamada"
        >
          <Phone size={24} className="rotate-[135deg]" />
        </button>
      </div>
    );
  }

  // ── Preparation screen ──
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shrink-0">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href={`/match/${id}`} className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1" />
          <Link href="/" className="font-serif text-lg font-bold text-primary tracking-tight">nidoo</Link>
        </div>
      </header>

      <div className="flex-1 px-5 py-8">
        <div className="max-w-lg mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Video size={36} className="text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Videollamada con {hostName}</h1>
            <p className="text-muted leading-relaxed">{"Antes de la llamada, asegurate de haber completado estos pasos para conocerse mejor."}</p>
          </div>

          {/* Checklist */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Checklist pre-llamada</h2>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                >
                  {item.done
                    ? <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                    : <Circle size={20} className="text-border shrink-0" />}
                  <span className={`text-sm flex-1 ${item.done ? "text-foreground" : "text-muted"}`}>{item.label}</span>
                  <ChevronRight size={14} className="text-muted group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Tips para la llamada</h2>
            <div className="space-y-3">
              {callTips.map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <div key={tip.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TipIcon size={15} className="text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed pt-1">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA — registration gate */}
          <div className="bg-secondary border border-border rounded-2xl p-6 text-center">
            <Lock size={24} className="text-muted mx-auto mb-3" />
            <h2 className="font-serif text-lg font-bold text-foreground mb-2">{"La videollamada se habilita al registrarte"}</h2>
            <p className="text-sm text-muted mb-5">
              {"Ambos deben tener cuenta verificada en Nidoo para proteger la seguridad y privacidad de todos."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/registro/inquilino"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-primary-sm"
              >
                Crear mi cuenta gratis
                <ChevronRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setCalling(true)}
                className="inline-flex items-center justify-center gap-2 bg-card hover:bg-muted-bg text-foreground font-medium px-6 py-3 rounded-full transition-colors border border-border"
              >
                <Video size={16} />
                Probar llamada (demo)
              </button>
            </div>
          </div>

          {/* Alternative actions */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link
              href={`/match/${id}/chat`}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary-hover transition-colors"
            >
              <MessageCircle size={14} />
              Ir al chat
            </Link>
            <span className="text-border">|</span>
            <Link
              href={`/match/${id}/date`}
              className="flex items-center gap-1.5 text-sm text-foreground/60 font-medium hover:text-foreground transition-colors"
            >
              <Heart size={14} />
              Roommate date
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
