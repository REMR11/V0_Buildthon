"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, Send, Heart, Video, Sparkles, Clock,
  ChevronDown, MessageCircle,
} from "lucide-react";
import { mockListings, type Listing } from "@/lib/listings";
import { getPrefs, type MatchPrefs } from "@/lib/match-prefs";

/* ── Types ────────────────────────────────────────────────────── */
type Message = {
  id: string;
  from: "user" | "host";
  text: string;
  time: string;
  reaction?: string;
};

/* ── Icebreakers ──────────────────────────────────────────────── */
function buildIcebreakers(l: Listing, p: MatchPrefs | null): { text: string; emoji: string }[] {
  const ib: { text: string; emoji: string }[] = [];

  // Common-ground based
  if (p?.schedule === l.hostSchedule && p.schedule === "manana")
    ib.push({ text: "Ambos somos madrugadores. A que hora arrancas tu dia normalmente?", emoji: "sunrise" });
  if (p?.schedule === l.hostSchedule && p.schedule === "noche")
    ib.push({ text: "Somos nocturnos los dos! Hasta que hora sueles estar despierto/a?", emoji: "moon" });
  if (p?.cleanliness === l.hostCleanliness && p.cleanliness === "muy-ordenado")
    ib.push({ text: "Veo que ambos somos ordenados. Tienes alguna regla de limpieza que te importa mucho?", emoji: "sparkles" });
  if (p?.noise === l.hostNoise && p.noise === "muy-tranquilo")
    ib.push({ text: "A los dos nos gusta el silencio. Usas audifonos en casa o prefieres silencio total?", emoji: "headphones" });
  if (p?.kitchenUse === l.hostKitchenUse && p.kitchenUse !== "raramente")
    ib.push({ text: "Parece que a ambos nos gusta cocinar. Cual es tu platillo estrella?", emoji: "cooking" });

  // General roommate icebreakers
  ib.push({ text: "Que es lo que mas valoras en un roommate?", emoji: "heart" });
  ib.push({ text: "Como es tu fin de semana ideal?", emoji: "calendar" });
  ib.push({ text: "Si pudieras poner una sola regla en el depa, cual seria?", emoji: "scroll" });
  ib.push({ text: "Has vivido con roommates antes? Como fue tu experiencia?", emoji: "home" });
  ib.push({ text: "Que tan seguido invitas gente a tu casa?", emoji: "users" });

  return ib.slice(0, 6);
}

/* ── Mock auto-replies ────────────────────────────────────────── */
function getMockReply(listing: Listing, msgText: string): string {
  const name = listing.host.split(" ")[0];
  const lower = msgText.toLowerCase();

  if (lower.includes("hora") || lower.includes("madrugador") || lower.includes("despiert"))
    return `Normalmente me levanto como a las ${listing.hostSchedule === "manana" ? "6:30" : listing.hostSchedule === "noche" ? "10:00" : "8:00"}. Y tu?`;
  if (lower.includes("limpieza") || lower.includes("ordenado") || lower.includes("regla"))
    return listing.hostCleanliness === "muy-ordenado"
      ? "Solo pido que los platos no se queden en el fregadero jaja. Lo demas lo podemos acordar."
      : "Soy flexible con eso. Lo importante es que ambos estemos comodos.";
  if (lower.includes("cocin") || lower.includes("platillo"))
    return listing.hostKitchenUse === "meal-prep"
      ? "Me encanta hacer meal prep los domingos! Hago para toda la semana. Si quieres podemos turnarnos."
      : "La verdad cocino lo basico, pero siempre estoy abierto/a a compartir comida.";
  if (lower.includes("fin de semana") || lower.includes("sabado"))
    return listing.hostNoise === "social"
      ? "Me gusta salir con amigos, pero tambien disfruto una peli en casa. Un balance."
      : "Normalmente descanso en casa, leo, o salgo a caminar. Nada loco.";
  if (lower.includes("roommate") || lower.includes("valoras"))
    return "Respeto, comunicacion y que cada quien tenga su espacio. Si eso cuadra, lo demas se arregla.";
  if (lower.includes("vivido") || lower.includes("experiencia"))
    return "Si, tuve un roommate antes y la verdad fue buena experiencia. La clave es hablar las cosas.";
  if (lower.includes("invit") || lower.includes("gente"))
    return listing.hostVisits === "casi-nunca"
      ? "Casi no invito gente a casa. Soy mas de salir. Y tu?"
      : "De vez en cuando vienen amigos, pero siempre aviso con tiempo.";
  if (lower.includes("hola") || lower.includes("que tal") || lower.includes("hey"))
    return `Hola! Que gusto. Vi que tenemos buen match. Cuentame, que buscas en un roommate?`;

  // Default replies
  const defaults = [
    `Buena pregunta! Dejame pensarlo... Creo que lo mas importante es la comunicacion.`,
    `Me parece bien! Yo soy ${listing.hostPersonality === "introvertido" ? "mas tranquilo/a" : listing.hostPersonality === "extrovertido" ? "bastante social" : "un punto medio"}, asi que creo que podemos hacer buen equipo.`,
    `Totalmente de acuerdo. ${name === listing.host.split(" ")[0] ? "Creo que hay buena vibra, no?" : ""}`,
    `Interesante! Algo mas que quieras saber del depa o de mi como roommate?`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

/* ── Time helper ──────────────────────────────────────────────── */
function now() {
  const d = new Date();
  return d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

/* ── Reaction picker ─────────────────────────────────────────── */
const reactions = ["fire", "heart", "laugh", "think", "100"];
const reactionEmoji: Record<string, string> = {
  fire: "\u{1F525}", heart: "\u2764\uFE0F", laugh: "\u{1F602}", think: "\u{1F914}", "100": "\u{1F4AF}",
};

/* ── Chat page ────────────────────────────────────────────────── */
export default function ChatPage() {
  const params = useParams();
  const id = Number(params.id);
  const listing = mockListings.find((l) => l.id === id);
  const [prefs, setPrefs] = useState<MatchPrefs | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(true);
  const [reactionMsgId, setReactionMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPrefs(getPrefs()); }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Welcome message from host
  useEffect(() => {
    if (!listing) return;
    const t = setTimeout(() => {
      const name = listing.host.split(" ")[0];
      setMessages([{
        id: "welcome",
        from: "host",
        text: `Hola! Soy ${name}. Vi que tenemos buen match en Nidoo. Preguntame lo que quieras sobre el depa o sobre como es vivir conmigo.`,
        time: now(),
      }]);
      scrollToBottom();
    }, 600);
    return () => clearTimeout(t);
  }, [listing, scrollToBottom]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={48} className="text-muted mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Chat no disponible</h1>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium">Volver a resultados</Link>
        </div>
      </div>
    );
  }

  const icebreakers = buildIcebreakers(listing, prefs);
  const hostName = listing.host.split(" ")[0];

  function sendMessage(text: string) {
    if (!text.trim() || !listing) return;

    const userMsg: Message = { id: `u-${Date.now()}`, from: "user", text: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowIcebreakers(false);
    scrollToBottom();

    // Simulate typing
    setTyping(true);
    const delay = 1200 + Math.random() * 1500;
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: `h-${Date.now()}`,
        from: "host",
        text: getMockReply(listing, text),
        time: now(),
      };
      setMessages((prev) => [...prev, reply]);
      scrollToBottom();
    }, delay);
  }

  function addReaction(msgId: string, reaction: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction: reactionEmoji[reaction] } : m))
    );
    setReactionMsgId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card shrink-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/match/${id}`} className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: listing.hostColor }}
          >
            {listing.hostInitials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight">{listing.host}</p>
            <p className="text-xs text-green-600 font-medium">En linea</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/match/${id}/date`}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <Heart size={13} />
              <span className="hidden sm:inline">Roommate date</span>
            </Link>
            <Link
              href={`/match/${id}/videocall`}
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors bg-secondary px-3 py-1.5 rounded-full border border-border"
            >
              <Video size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Messages ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Compatibility banner */}
          {prefs && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted bg-secondary/60 py-2 px-4 rounded-full mx-auto w-fit mb-4">
              <Sparkles size={12} className="text-primary" />
              Match de compatibilidad con {hostName}
              <Link href={`/match/${id}`} className="text-primary font-medium hover:underline">Ver perfil</Link>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} animate-scale-in`}
            >
              <div className="relative max-w-[80%] group">
                {msg.from === "host" && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold absolute -left-9 bottom-0"
                    style={{ backgroundColor: listing.hostColor }}
                  >
                    {listing.hostInitials}
                  </div>
                )}

                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                  <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-white/60" : "text-muted"}`}>
                    {msg.time}
                  </p>
                </div>

                {/* Reaction */}
                {msg.reaction && (
                  <span className="absolute -bottom-3 right-2 text-sm bg-card border border-border rounded-full px-1.5 py-0.5 shadow-sm">
                    {msg.reaction}
                  </span>
                )}

                {/* Reaction trigger */}
                {msg.from === "host" && (
                  <button
                    type="button"
                    onClick={() => setReactionMsgId(reactionMsgId === msg.id ? null : msg.id)}
                    className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-full w-6 h-6 flex items-center justify-center text-xs text-muted hover:text-foreground shadow-sm"
                    aria-label="Reaccionar"
                  >
                    +
                  </button>
                )}

                {/* Reaction picker */}
                {reactionMsgId === msg.id && (
                  <div className="absolute -bottom-10 left-0 flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1 shadow-lg z-10 animate-scale-in">
                    {reactions.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => addReaction(msg.id, r)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-sm"
                      >
                        {reactionEmoji[r]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start animate-scale-in">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: "0.15s" }} />
                <span className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Icebreakers ───────────────────────────────────────── */}
      {showIcebreakers && messages.length <= 1 && (
        <div className="border-t border-border bg-secondary/40 shrink-0">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Sparkles size={12} className="text-primary" />
                Rompe el hielo con {hostName}
              </p>
              <button
                type="button"
                onClick={() => setShowIcebreakers(false)}
                className="text-muted hover:text-foreground transition-colors"
                aria-label="Cerrar sugerencias"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {icebreakers.map((ib, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(ib.text)}
                  className="shrink-0 text-left text-xs bg-card border border-border rounded-xl px-3 py-2.5 text-foreground/80 hover:border-primary/40 hover:bg-primary/5 transition-colors max-w-[220px] leading-snug"
                >
                  {ib.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Input ─────────────────────────────────────────────── */}
      <div className="border-t border-border bg-card shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {!showIcebreakers && messages.length > 1 && (
            <button
              type="button"
              onClick={() => setShowIcebreakers(true)}
              className="text-primary hover:text-primary-hover transition-colors shrink-0"
              aria-label="Mostrar icebreakers"
            >
              <Sparkles size={18} />
            </button>
          )}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Escribe a ${hostName}...`}
              className="w-full bg-secondary border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-primary hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send size={16} />
          </button>
        </form>
        <div className="max-w-3xl mx-auto px-4 pb-2 flex items-center justify-center gap-4">
          <Link
            href={`/match/${id}/date`}
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary-hover transition-colors"
          >
            <Heart size={12} />
            Proponer roommate date
          </Link>
          <span className="text-border">|</span>
          <Link
            href={`/match/${id}/videocall`}
            className="flex items-center gap-1.5 text-xs text-foreground/60 font-medium hover:text-foreground transition-colors"
          >
            <Video size={12} />
            Videollamada
          </Link>
        </div>
      </div>
    </div>
  );
}
