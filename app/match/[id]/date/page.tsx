"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft, MessageCircle, Video, ChevronRight,
  Sparkles, Heart, ThumbsUp, Flame, Laugh, HelpCircle,
} from "lucide-react";
import { mockListings, type Listing } from "@/lib/listings";

/* ── Questions ────────────────────────────────────────────────── */
type DateQuestion = {
  question: string;
  category: string;
  getHostAnswer: (l: Listing) => string;
};

const dateQuestions: DateQuestion[] = [
  {
    question: "Que haces si llegas a casa y hay platos sucios en el fregadero?",
    category: "Limpieza",
    getHostAnswer: (l) =>
      l.hostCleanliness === "muy-ordenado"
        ? "Los lavo de una. No puedo ver platos sucios, me estresa jaja."
        : l.hostCleanliness === "normal"
        ? "Depende del dia. Si puedo los lavo, pero no me vuelvo loco si se quedan un rato."
        : "Honestamente, los dejo para despues. Pero si mi roomie los necesita, los lavo.",
  },
  {
    question: "Cual es tu guilty pleasure de series o peliculas?",
    category: "Entretenimiento",
    getHostAnswer: (l) =>
      l.hostPersonality === "introvertido"
        ? "Documentales raros de Netflix. Puedo ver uno de 4 horas sobre origami y no me aburro."
        : l.hostPersonality === "extrovertido"
        ? "Reality shows, lo admito. Son mi desconexion despues de un dia pesado."
        : "Me como temporadas enteras de series coreanas los fines de semana.",
  },
  {
    question: "Si pudieras poner UNA regla en el depa que todos deben respetar, cual seria?",
    category: "Convivencia",
    getHostAnswer: (l) =>
      l.hostNoise === "muy-tranquilo"
        ? "Silencio despues de las 10pm. Eso si, antes de las 10 pueden poner la musica que quieran."
        : l.hostCleanliness === "muy-ordenado"
        ? "Cada quien lava sus trastes el mismo dia. Es una regla simple pero cambia todo."
        : l.hostCohabitation === "independencia-total"
        ? "Respetar el espacio del otro. Si mi puerta esta cerrada, estoy en modo no molestar."
        : "Avisar si vas a invitar gente. No es pedir permiso, solo un heads up.",
  },
  {
    question: "Como es tu sabado ideal?",
    category: "Estilo de vida",
    getHostAnswer: (l) =>
      l.hostPersonality === "extrovertido"
        ? "Brunch con amigos, luego algo al aire libre, y cerrar la noche en un bar o en casa con gente."
        : l.hostPersonality === "introvertido"
        ? "Despertar sin alarma, desayuno tranquilo, leer un rato, y quizas una caminata. Nada de multitudes."
        : "Depende de la semana. A veces necesito salir y socializar, otras solo quiero estar en pijama.",
  },
  {
    question: "Que es lo mas importante que tu roommate debe respetar de ti?",
    category: "Limites",
    getHostAnswer: (l) =>
      l.hostCohabitation === "independencia-total"
        ? "Mi espacio personal y mis tiempos. No necesito que seamos mejores amigos, pero si respetuosos."
        : l.hostCohabitation === "convivir"
        ? "Que me avise las cosas. No me gusta enterarme de sorpresas. La comunicacion es todo."
        : "Que sea puntual con los pagos y que mantenga areas comunes decentes. Lo basico.",
  },
];

/* ── Reactions ────────────────────────────────────────────────── */
const reactionOptions = [
  { key: "fire", Icon: Flame, label: "Increible" },
  { key: "heart", Icon: Heart, label: "Me encanta" },
  { key: "thumbsup", Icon: ThumbsUp, label: "De acuerdo" },
  { key: "laugh", Icon: Laugh, label: "Jaja" },
  { key: "think", Icon: HelpCircle, label: "Hmm" },
];

/* ── Verdict logic ────────────────────────────────────────────── */
function buildVerdict(positiveReactions: number, totalRounds: number) {
  const ratio = positiveReactions / totalRounds;
  if (ratio >= 0.8) return { title: "Conexion fuerte", desc: "Parece que conectan en lo importante. Este roommate podria ser una gran opcion.", color: "text-green-700 bg-green-50 border-green-200" };
  if (ratio >= 0.5) return { title: "Buena vibra", desc: "Hay diferencias pero comparten valores clave. Vale la pena seguir hablando.", color: "text-primary bg-primary/10 border-primary/20" };
  return { title: "Diferentes pero posibles", desc: "Tienen estilos distintos. Hablenlo bien antes de decidir para evitar sorpresas.", color: "text-muted bg-secondary border-border" };
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function RoommateDatePage() {
  const params = useParams();
  const id = Number(params.id);
  const listing = mockListings.find((l) => l.id === id);

  const [phase, setPhase] = useState<"intro" | "playing" | "summary">("intro");
  const [round, setRound] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [showHostAnswer, setShowHostAnswer] = useState(false);
  const [hostRevealing, setHostRevealing] = useState(false);
  const [roundReactions, setRoundReactions] = useState<string[]>([]);
  const [animDir, setAnimDir] = useState<"right" | "left">("right");

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <Heart size={48} className="text-muted mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Roommate date no disponible</h1>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium">Volver a resultados</Link>
        </div>
      </div>
    );
  }

  const hostName = listing.host.split(" ")[0];
  const totalRounds = dateQuestions.length;
  const currentQ = dateQuestions[round];

  function submitAnswer() {
    if (!currentInput.trim()) return;
    setUserAnswers((prev) => [...prev, currentInput.trim()]);
    setCurrentInput("");
    // Reveal host answer with delay
    setHostRevealing(true);
    setTimeout(() => {
      setHostRevealing(false);
      setShowHostAnswer(true);
    }, 1500);
  }

  function reactAndNext(reaction: string) {
    setRoundReactions((prev) => [...prev, reaction]);
    setShowHostAnswer(false);
    setAnimDir("right");

    if (round + 1 >= totalRounds) {
      setTimeout(() => setPhase("summary"), 400);
    } else {
      setTimeout(() => setRound((r) => r + 1), 300);
    }
  }

  const positiveReactions = roundReactions.filter((r) => ["fire", "heart", "thumbsup"].includes(r)).length;

  // ── Intro ──
  if (phase === "intro") {
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

        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart size={36} className="text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Roommate Date</h1>
            <p className="text-muted mb-2 leading-relaxed">
              {"5 preguntas reales de convivencia. Tu respondes primero, luego se revela la respuesta de "}
              <span className="font-semibold text-foreground">{hostName}</span>.
            </p>
            <p className="text-sm text-muted mb-8">{"Al final veras que tan bien conectan en lo que realmente importa para vivir juntos."}</p>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: listing.hostColor }}
              >
                {listing.hostInitials}
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20">
                Tu
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhase("playing")}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-primary-md text-lg"
            >
              Empezar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Summary ──
  if (phase === "summary") {
    const verdict = buildVerdict(positiveReactions, totalRounds);

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

        <div className="flex-1 px-5 py-10">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Reporte de cita</h1>
              <p className="text-muted">{"Tu y " + hostName + " respondieron " + totalRounds + " preguntas de convivencia."}</p>
            </div>

            {/* Verdict */}
            <div className={`border rounded-2xl p-5 mb-6 text-center ${verdict.color} animate-slide-in-left`}>
              <h2 className="font-serif text-xl font-bold mb-1">{verdict.title}</h2>
              <p className="text-sm">{verdict.desc}</p>
            </div>

            {/* Round recap */}
            <div className="space-y-4 mb-8">
              {dateQuestions.map((q, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-slide-in-left" style={{ animationDelay: `${i * 100}ms` }}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{q.category}</p>
                  <p className="text-sm font-medium text-foreground mb-3">{q.question}</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="text-xs font-bold text-primary shrink-0 mt-0.5">Tu:</span>
                      <p className="text-sm text-foreground/80">{userAnswers[i]}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold shrink-0 mt-0.5" style={{ color: listing.hostColor }}>{hostName}:</span>
                      <p className="text-sm text-foreground/80">{q.getHostAnswer(listing)}</p>
                    </div>
                  </div>
                  {roundReactions[i] && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-xs text-muted">Tu reaccion:</span>
                      {(() => {
                        const r = reactionOptions.find((ro) => ro.key === roundReactions[i]);
                        if (!r) return null;
                        const RIcon = r.Icon;
                        return <span className="flex items-center gap-1 text-xs font-medium text-foreground"><RIcon size={13} /> {r.label}</span>;
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/match/${id}/chat`}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-3 rounded-full transition-colors shadow-primary-sm"
              >
                <MessageCircle size={16} />
                Seguir hablando en el chat
                <ChevronRight size={14} />
              </Link>
              <Link
                href={`/match/${id}/videocall`}
                className="flex items-center justify-center gap-2 bg-card hover:bg-secondary text-foreground font-semibold px-5 py-3 rounded-full transition-colors border border-border"
              >
                <Video size={16} />
                Videollamada
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ──
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shrink-0">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link href={`/match/${id}`} className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 flex items-center justify-center gap-2">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < round ? "bg-primary w-6" : i === round ? "bg-primary w-10" : "bg-border w-6"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-muted shrink-0">
            {round + 1}/{totalRounds}
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div
          key={round}
          className={`max-w-lg w-full ${animDir === "right" ? "animate-slide-in-right" : "animate-slide-in-left-reverse"}`}
        >
          {/* Category badge */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full">
              {currentQ.category}
            </span>
          </div>

          {/* Question */}
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-center mb-8 text-balance leading-snug">
            {currentQ.question}
          </h2>

          {/* User answer input */}
          {!showHostAnswer && !hostRevealing && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4">
                <label htmlFor="user-answer" className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">Tu respuesta</label>
                <textarea
                  id="user-answer"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Escribe tu respuesta honesta..."
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={submitAnswer}
                disabled={!currentInput.trim()}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full transition-colors shadow-primary-sm"
              >
                Enviar y ver respuesta de {hostName}
              </button>
            </div>
          )}

          {/* Host revealing animation */}
          {hostRevealing && (
            <div className="text-center animate-pulse-soft">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
                style={{ backgroundColor: listing.hostColor }}
              >
                {listing.hostInitials}
              </div>
              <p className="text-muted font-medium">{hostName + " esta respondiendo..."}</p>
            </div>
          )}

          {/* Host answer revealed */}
          {showHostAnswer && (
            <div className="space-y-4 animate-scale-in">
              {/* User answer recap */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Tu respuesta</p>
                <p className="text-sm text-foreground">{userAnswers[round]}</p>
              </div>

              {/* Host answer */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: listing.hostColor }}
                  >
                    {listing.hostInitials}
                  </div>
                  <p className="text-xs font-semibold text-foreground">{hostName}</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{currentQ.getHostAnswer(listing)}</p>
              </div>

              {/* Reactions */}
              <div className="text-center">
                <p className="text-xs text-muted mb-3">{"Como te parece su respuesta?"}</p>
                <div className="flex items-center justify-center gap-2">
                  {reactionOptions.map((r) => {
                    const RIcon = r.Icon;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => reactAndNext(r.key)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-secondary border border-transparent hover:border-border transition-all group"
                      >
                        <RIcon size={22} className="text-muted group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-muted">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
