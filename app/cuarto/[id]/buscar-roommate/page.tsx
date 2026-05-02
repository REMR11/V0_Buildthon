"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BadgeCheck, Star, CheckCircle2, XCircle,
  MessageCircle, ChevronRight, Users, DollarSign, Zap,
  Home, Filter, SlidersHorizontal,
} from "lucide-react";
import { mockListings } from "@/lib/listings";
import { mockRoommates, type Roommate } from "@/lib/mock-roommates";
import { getPrefs, type MatchPrefs } from "@/lib/match-prefs";

/* ── Scoring against quiz prefs ─────────────────────────────────── */
function scoreRoommate(r: Roommate, p: MatchPrefs): number {
  let pts = 0;
  if (p.schedule === r.schedule) pts += 12;
  else if (p.schedule === "flexible" || r.schedule === "flexible") pts += 7;
  if (p.daysHome === r.daysHome) pts += 8; else if (p.daysHome === "mitad") pts += 4;
  if (p.noise === r.noise) pts += 8; else if (p.noise === "normal") pts += 4;
  if (p.kitchenUse === r.kitchenUse) pts += 5;
  if (p.commonTemp === r.commonTemp) pts += 5; else if (p.commonTemp === "templado" || r.commonTemp === "templado") pts += 2;
  if (p.bathroomTime === r.bathroomTime) pts += 4; else if (p.bathroomTime === "normal") pts += 2;
  if (p.pets === r.pets) pts += 6; else if (r.pets === "acepta") pts += 6;
  if (p.smoking === r.smoking) pts += 10; else if (p.smoking === "no" && r.smoking === "afuera") pts += 4;
  if (p.alcohol === r.alcohol) pts += 5; else if (p.alcohol === "social" && r.alcohol !== "frecuente") pts += 2;
  if (p.cleanliness === r.cleanliness) pts += 8; else if (p.cleanliness === "normal") pts += 3;
  if (p.visits === r.visits) pts += 4; else if (p.visits === "a-veces") pts += 2;
  if (p.overnightGuests === r.overnightGuests) pts += 3;
  if (p.personality === r.personality) pts += 5; else if (p.personality === "ambivertido" || r.personality === "ambivertido") pts += 3;
  if (p.conflictStyle === r.conflictStyle) pts += 5; else if (p.conflictStyle !== "evitar" && r.conflictStyle !== "evitar") pts += 2;
  if (p.cohabitation === r.cohabitation) pts += 5; else if (p.cohabitation === "cordial") pts += 2;
  if (p.occupation === "sin-preferencia" || p.occupation === r.occupation) pts += 3;
  return Math.min(100, pts);
}

/* Bonus score for how compatible roommate is with the listing's host */
function scoreRoommateWithHost(r: Roommate, p: MatchPrefs, listingPrice: number): number {
  let bonus = 0;
  if (r.budget >= listingPrice / 2) bonus += 10; // can afford it
  return bonus;
}

/* ── Labels ─────────────────────────────────────────────────────── */
const LABELS: Record<string, Record<string, string>> = {
  schedule: { manana: "Madrugador/a", noche: "Nocturno/a", flexible: "Flexible", "home-office": "Home office" },
  cleanliness: { "muy-ordenado": "Muy ordenado/a", normal: "Normal", relajado: "Relajado/a" },
  personality: { introvertido: "Introvertido/a", ambivertido: "Ambivertido/a", extrovertido: "Extrovertido/a" },
  noise: { "muy-tranquilo": "Tranquilo/a", normal: "Normal", social: "Sociable" },
  smoking: { no: "No fuma", afuera: "Fuma afuera", si: "Fuma" },
  cohabitation: { "independencia-total": "Independencia total", cordial: "Trato cordial", convivir: "Le gusta convivir" },
  occupation: { estudiante: "Estudiante", profesional: "Profesional", "sin-preferencia": "Flexible" },
};

function label(field: string, val: string) {
  return LABELS[field]?.[val] ?? val;
}

/* ── Score ring mini ─────────────────────────────────────────────── */
function MiniScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 55 ? "#e07030" : "#9e7a5a";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 56, height: 56 }}>
      <svg width={56} height={56} className="-rotate-90">
        <circle cx={28} cy={28} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute text-xs font-black" style={{ color }}>{animated}%</span>
    </div>
  );
}

/* ── Roommate card ───────────────────────────────────────────────── */
function RoommateCard({
  roommate, score, listingId,
}: { roommate: Roommate; score: number; listingId: number }) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    score >= 80 ? "text-green-700 bg-green-50 border-green-200" :
    score >= 55 ? "text-primary bg-primary/5 border-primary/20" :
    "text-muted bg-secondary border-border";

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-primary-sm">
      {/* Top row */}
      <div className="p-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: roommate.color }}
          >
            {roommate.initials}
          </div>
          {roommate.verified && (
            <BadgeCheck size={16} className="text-primary absolute -bottom-1 -right-1 bg-card rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-foreground text-sm truncate">{roommate.name}</p>
            <span className="text-xs text-muted shrink-0">{roommate.age} anos</span>
          </div>
          <p className="text-xs text-muted mb-1">{label("occupation", roommate.occupation)} · {roommate.city}</p>
          <div className="flex items-center gap-1 text-xs text-foreground/60">
            <Star size={11} className="text-yellow-500 fill-yellow-500" />
            {roommate.rating} ({roommate.reviews})
          </div>
        </div>

        <MiniScoreRing score={score} />
      </div>

      {/* Tags */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {[
          label("schedule", roommate.schedule),
          label("cleanliness", roommate.cleanliness),
          label("personality", roommate.personality),
          label("noise", roommate.noise),
          roommate.smoking === "no" ? "No fuma" : null,
        ].filter(Boolean).map((tag) => (
          <span key={tag} className="text-xs bg-secondary text-foreground/70 border border-border px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Bio (expandable) */}
      {expanded && (
        <div className="px-5 pb-4">
          <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{roommate.bio}&rdquo;</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border flex items-center justify-between gap-3 bg-muted-bg/40">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted hover:text-foreground transition-colors font-medium"
        >
          {expanded ? "Ocultar bio" : "Ver bio"}
        </button>
        <div className="flex items-center gap-2">
          <Link
            href={`/match/${listingId}/chat?roommate=${roommate.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold bg-secondary hover:bg-muted-bg text-foreground border border-border px-3 py-2 rounded-full transition-colors"
          >
            <MessageCircle size={13} />
            Chat
          </Link>
          <Link
            href={`/cuarto/${listingId}/contrato?roommate=${roommate.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-full transition-colors"
          >
            Rentar juntos
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function BuscarRoommateParaCuartoPage() {
  const params = useParams();
  const id = Number(params.id);
  const listing = mockListings.find((l) => l.id === id);
  const [prefs, setPrefs] = useState<MatchPrefs | null>(null);
  const [filterCity, setFilterCity] = useState<string>("todas");
  const [filterBudget, setFilterBudget] = useState<boolean>(false);

  useEffect(() => { setPrefs(getPrefs()); }, []);

  const perPersonPrice = listing ? Math.round(listing.price / 2) : 0;

  const scored = useMemo(() => {
    return mockRoommates
      .map((r) => ({
        roommate: r,
        score: prefs ? scoreRoommate(r, prefs) + scoreRoommateWithHost(r, prefs, listing?.price ?? 0) : 60,
      }))
      .filter((x) => {
        if (filterCity !== "todas" && x.roommate.city !== filterCity) return false;
        if (filterBudget && x.roommate.budget < perPersonPrice) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [prefs, filterCity, filterBudget, perPersonPrice, listing]);

  const cities = Array.from(new Set(mockRoommates.map((r) => r.city)));

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <Home size={48} className="text-muted mx-auto mb-4" />
          <p className="font-serif text-xl font-bold text-foreground mb-2">Cuarto no encontrado</p>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium text-sm">
            Ver resultados
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link
            href={`/cuarto/${id}`}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            {listing.title}
          </Link>
          <div className="flex-1" />
          <Link href="/" className="font-serif text-lg font-bold text-primary tracking-tight">nidoo</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">

        {/* Intro banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground mb-0.5">Roommates compatibles para este cuarto</p>
            <p className="text-sm text-muted leading-relaxed">
              El score considera tu compatibilidad de habitos <strong>y</strong> si pueden pagar ${perPersonPrice}/mes cada uno.
            </p>
          </div>
        </div>

        {/* Cuarto resumen */}
        <div className="bg-card border border-border rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: listing.hostColor }}
          >
            {listing.hostInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{listing.title}</p>
            <p className="text-xs text-muted">{listing.neighborhood} · <span className="font-semibold text-primary">${perPersonPrice}/mes c/u</span></p>
          </div>
          <Link href={`/cuarto/${id}`} className="text-xs text-muted hover:text-foreground flex items-center gap-1">
            Ver <ChevronRight size={12} />
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted font-semibold">
            <SlidersHorizontal size={13} />
            Filtrar:
          </div>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="text-xs bg-card border border-border rounded-full px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="todas">Todas las ciudades</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterBudget}
              onChange={(e) => setFilterBudget(e.target.checked)}
              className="accent-primary rounded"
            />
            Solo con presupuesto suficiente
          </label>
        </div>

        {/* Resultados */}
        <p className="text-xs text-muted mb-4 font-medium">
          {scored.length} roommate{scored.length !== 1 ? "s" : ""} encontrado{scored.length !== 1 ? "s" : ""}
        </p>

        <div className="space-y-4">
          {scored.map(({ roommate, score }) => (
            <RoommateCard
              key={roommate.id}
              roommate={roommate}
              score={Math.min(100, score)}
              listingId={id}
            />
          ))}
          {scored.length === 0 && (
            <div className="text-center py-16">
              <Users size={40} className="text-muted mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-foreground mb-1">Sin resultados</p>
              <p className="text-sm text-muted">Prueba quitando algun filtro.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
