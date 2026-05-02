"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, SlidersHorizontal, Star, ShieldCheck, BadgeCheck,
  TrendingDown, CheckCircle2, XCircle, ChevronRight, Home,
  Wifi, Thermometer, UtensilsCrossed, Clock, Users, MessageSquare,
} from "lucide-react";
import { mockListings, type Listing } from "@/lib/listings";
import { savePrefs, type MatchPrefs } from "@/lib/match-prefs";

// ── Types ─────────────────────────────────────────────────────────────────────
type Prefs = {
  schedule: string; daysHome: string;
  noise: string; kitchenUse: string; commonTemp: string; bathroomTime: string;
  pets: string; smoking: string; alcohol: string; cleanliness: string;
  visits: string; overnightGuests: string;
  personality: string; conflictStyle: string; cohabitation: string;
  budget: number; city: string; roommateGender: string; occupation: string;
};

// ── Scoring ───────────────────────────────────────────────────────────────────
// Each dimension has a max weight. Total possible = 100.
// We award points proportionally and cap at 100.

function calcScore(l: Listing, p: Prefs): number {
  let pts = 0;

  // -- Paso 1: Ritmo de vida (20 pts) --
  // Schedule (12)
  if (p.schedule === l.hostSchedule) pts += 12;
  else if (p.schedule === "flexible" || l.hostSchedule === "flexible") pts += 7;
  else if (
    (p.schedule === "manana" && l.hostSchedule === "home-office") ||
    (p.schedule === "home-office" && l.hostSchedule === "manana")
  ) pts += 5;

  // Days home (8)
  if (p.daysHome === l.hostDaysHome) pts += 8;
  else if (
    (p.daysHome === "mitad" && l.hostDaysHome !== "pocos") ||
    (p.daysHome === "pocos" && l.hostDaysHome === "pocos")
  ) pts += 4;

  // -- Paso 2: Convivencia diaria (22 pts) --
  // Noise (8)
  if (p.noise === l.hostNoise) pts += 8;
  else if (p.noise === "normal" && l.hostNoise !== "muy-tranquilo") pts += 4;
  else if (p.noise === "muy-tranquilo" && l.hostNoise === "normal") pts += 2;

  // Kitchen (5)
  if (p.kitchenUse === l.hostKitchenUse) pts += 5;
  else if (p.kitchenUse === "raramente" || l.hostKitchenUse === "raramente") pts += 2;

  // Temperature (5)
  if (p.commonTemp === l.hostCommonTemp) pts += 5;
  else if (p.commonTemp === "templado" || l.hostCommonTemp === "templado") pts += 2;

  // Bathroom (4)
  if (p.bathroomTime === l.hostBathroomTime) pts += 4;
  else if (p.bathroomTime === "normal") pts += 2;

  // -- Paso 3: Habitos (33 pts) --
  // Pets (6)
  if (p.pets === l.hostPets) pts += 6;
  else if (l.hostPets === "acepta") pts += 6;
  else if (p.pets === "no" && l.hostPets === "no") pts += 6;
  else if (p.pets === "acepta" && l.hostPets !== "no") pts += 3;

  // Smoking (8) — high weight: dealbreaker for many
  if (p.smoking === l.hostSmoking) pts += 8;
  else if (p.smoking === "no" && l.hostSmoking === "no") pts += 8;
  else if (p.smoking === "afuera" && l.hostSmoking === "afuera") pts += 8;
  else if (p.smoking === "afuera" && l.hostSmoking === "no") pts += 4;
  else if (p.smoking === "si" && l.hostSmoking !== "no") pts += 4;

  // Alcohol (5)
  if (p.alcohol === l.hostAlcohol) pts += 5;
  else if (p.alcohol === "social" && l.hostAlcohol !== "frecuente") pts += 2;
  else if (p.alcohol === "no" && l.hostAlcohol === "no") pts += 5;

  // Cleanliness (7)
  if (p.cleanliness === l.hostCleanliness) pts += 7;
  else if (p.cleanliness === "normal") pts += 3;
  else if (p.cleanliness === "muy-ordenado" && l.hostCleanliness === "normal") pts += 2;

  // Visits (4)
  if (p.visits === l.hostVisits) pts += 4;
  else if (p.visits === "a-veces" && l.hostVisits !== "casi-nunca") pts += 2;

  // Overnight guests (3)
  if (p.overnightGuests === l.hostOvernightGuests) pts += 3;
  else if (p.overnightGuests === "a-veces") pts += 1;

  // -- Paso 4: Perfil social (15 pts) --
  // Personality (5)
  if (p.personality === l.hostPersonality) pts += 5;
  else if (p.personality === "ambivertido" || l.hostPersonality === "ambivertido") pts += 3;

  // Conflict style (5)
  if (p.conflictStyle === l.hostConflictStyle) pts += 5;
  else if (p.conflictStyle !== "evitar" && l.hostConflictStyle !== "evitar") pts += 2;

  // Cohabitation (5)
  if (p.cohabitation === l.hostCohabitation) pts += 5;
  else if (p.cohabitation === "cordial") pts += 2;

  // -- Logistica (10 pts) --
  // Budget (5)
  if (l.price <= p.budget) pts += 5;
  else if (l.price <= p.budget * 1.1) pts += 2;

  // Occupation (3)
  if (p.occupation === "sin-preferencia" || p.occupation === l.hostOccupation) pts += 3;

  // Gender (2) — soft signal
  if (p.roommateGender === "sin-preferencia" || p.roommateGender === "cualquiera") pts += 2;
  else if (p.roommateGender === l.hostRoommateGender || l.hostRoommateGender === "cualquiera" || l.hostRoommateGender === "sin-preferencia") pts += 2;

  return Math.min(100, pts);
}

// ── Match tags by category ────────────────────────────────────────────────────
type TagGroup = { category: string; Icon: React.ElementType; tags: { label: string; match: boolean }[] };

function buildTagGroups(l: Listing, p: Prefs): TagGroup[] {
  return [
    {
      category: "Ritmo",
      Icon: Clock,
      tags: [
        { label: "Horario", match: p.schedule === l.hostSchedule || p.schedule === "flexible" || l.hostSchedule === "flexible" },
        { label: "Tiempo en casa", match: p.daysHome === l.hostDaysHome || p.daysHome === "mitad" },
      ],
    },
    {
      category: "Convivencia",
      Icon: Home,
      tags: [
        { label: "Ruido", match: p.noise === l.hostNoise || p.noise === "normal" },
        { label: "Cocina", match: p.kitchenUse === l.hostKitchenUse },
        { label: "Temperatura", match: p.commonTemp === l.hostCommonTemp || p.commonTemp === "templado" || l.hostCommonTemp === "templado" },
        { label: "Bano", match: p.bathroomTime === l.hostBathroomTime || p.bathroomTime === "normal" },
      ],
    },
    {
      category: "Habitos",
      Icon: UtensilsCrossed,
      tags: [
        { label: "Mascotas", match: p.pets === l.hostPets || l.hostPets === "acepta" || (p.pets === "no" && l.hostPets === "no") },
        { label: "Tabaco", match: p.smoking === l.hostSmoking || (p.smoking === "no" && l.hostSmoking === "no") },
        { label: "Alcohol", match: p.alcohol === l.hostAlcohol || (p.alcohol === "no" && l.hostAlcohol === "no") },
        { label: "Limpieza", match: p.cleanliness === l.hostCleanliness || p.cleanliness === "normal" },
        { label: "Visitas", match: p.visits === l.hostVisits || p.visits === "a-veces" },
        { label: "Invitados", match: p.overnightGuests === l.hostOvernightGuests },
      ],
    },
    {
      category: "Social",
      Icon: MessageSquare,
      tags: [
        { label: "Personalidad", match: p.personality === l.hostPersonality || p.personality === "ambivertido" || l.hostPersonality === "ambivertido" },
        { label: "Conflictos", match: p.conflictStyle === l.hostConflictStyle },
        { label: "Convivencia", match: p.cohabitation === l.hostCohabitation },
      ],
    },
    {
      category: "Logistica",
      Icon: Thermometer,
      tags: [
        { label: "Presupuesto", match: l.price <= p.budget },
        { label: "Ocupacion", match: p.occupation === "sin-preferencia" || p.occupation === l.hostOccupation },
      ],
    },
  ];
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 55) return "text-primary";
  return "text-muted";
}
function scoreBorderBg(score: number) {
  if (score >= 80) return "border-green-200 bg-green-50/30";
  if (score >= 55) return "border-primary/20 bg-primary/5";
  return "border-border bg-card";
}
function scoreBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 55) return "bg-primary";
  return "bg-muted";
}
function scoreLabel(score: number) {
  if (score >= 85) return "Match excelente";
  if (score >= 70) return "Muy compatible";
  if (score >= 55) return "Compatible";
  if (score >= 40) return "Poca afinidad";
  return "Poco compatible";
}

// ── Animated score bar ────────────────────────────────────────────────────────
function ScoreBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), delay + 150);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div className="w-full h-2 bg-muted-bg rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${scoreBarColor(score)}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ listing, score, prefs, index }: {
  listing: Listing; score: number; prefs: Prefs; index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const tagGroups = buildTagGroups(listing, prefs);
  const savings = Math.round(listing.price * 0.5);

  // Flat summary: first 5 tags
  const flatTags = tagGroups.flatMap((g) => g.tags);
  const matchCount = flatTags.filter((t) => t.match).length;
  const totalCount = flatTags.length;

  return (
    <article className={`bg-card rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary-md ${scoreBorderBg(score)}`}>

      {/* Top: score + host info */}
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: listing.hostColor }}
          >
            {listing.hostInitials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground leading-tight">{listing.host}</p>
                <p className="text-sm text-muted">{listing.neighborhood}, {listing.city}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-foreground/70">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                    {listing.rating} ({listing.reviews} resenas)
                  </span>
                  {listing.verified && (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                      <BadgeCheck size={12} />
                      Verificado
                    </span>
                  )}
                </div>
              </div>
              {/* Score badge */}
              <div className="text-right shrink-0">
                <p className={`text-3xl font-black leading-none ${scoreColor(score)}`}>{score}%</p>
                <p className="text-xs text-muted font-medium mt-0.5">{scoreLabel(score)}</p>
              </div>
            </div>

            <div className="mt-3">
              <ScoreBar score={score} delay={index * 80} />
              <p className="text-xs text-muted mt-1">{matchCount}/{totalCount} dimensiones compatibles</p>
            </div>
          </div>
        </div>

        {/* Room title + price */}
        <div className="flex items-start justify-between gap-3 pt-4 border-t border-border/60">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm leading-snug">{listing.title}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {listing.amenities.slice(0, 3).map((a) => (
                <span key={a} className="flex items-center gap-1 text-xs bg-secondary text-muted px-2 py-0.5 rounded-full">
                  {a === "WiFi" && <Wifi size={10} />}
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-foreground">${listing.price}</p>
            <p className="text-xs text-muted">/ mes</p>
          </div>
        </div>
      </div>

      {/* Compatibility detail (expandable) */}
      <div className="border-t border-border/60">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Users size={14} />
            Ver compatibilidad detallada
          </span>
          <ChevronRight
            size={14}
            className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        {expanded && (
          <div className="px-5 pb-4 space-y-4">
            {tagGroups.map((group) => {
              const GroupIcon = group.Icon;
              return (
                <div key={group.category}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <GroupIcon size={13} className="text-muted" />
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide">{group.category}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
                          tag.match
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-muted-bg text-muted border-border"
                        }`}
                      >
                        {tag.match
                          ? <CheckCircle2 size={11} strokeWidth={3} />
                          : <XCircle size={11} strokeWidth={3} />}
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: savings + CTAs */}
      <div className="px-5 py-4 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <TrendingDown size={15} className="text-primary shrink-0" />
          <span>
            Ahorra{" "}
            <span className="font-bold text-primary">${savings}/mes</span>{" "}
            compartiendo
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/match/${listing.id}/chat`}
            className="flex items-center gap-1.5 bg-secondary hover:bg-muted-bg text-foreground text-sm font-semibold px-3.5 py-2 rounded-full transition-colors border border-border"
          >
            <MessageSquare size={13} />
            Chat
          </Link>
          <Link
            href={`/match/${listing.id}`}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Ver perfil
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── Label maps ────────────────────────────────────────────────────────────────
const scheduleLabel: Record<string, string> = {
  manana: "Madrugador/a", noche: "Nocturno/a", flexible: "Flexible", "home-office": "Home office",
};
const noiseLabel: Record<string, string> = {
  "muy-tranquilo": "Silencio total", normal: "Ambiente normal", social: "Casa animada",
};
const cleanLabel: Record<string, string> = {
  "muy-ordenado": "Muy ordenado/a", normal: "Orden normal", relajado: "Relajado/a",
};
const personalityLabel: Record<string, string> = {
  introvertido: "Introvertido/a", ambivertido: "Ambivertido/a", extrovertido: "Extrovertido/a",
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MatchResultadosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const prefs: Prefs = useMemo(() => ({
    schedule:        searchParams.get("schedule") ?? "",
    daysHome:        searchParams.get("daysHome") ?? "",
    noise:           searchParams.get("noise") ?? "",
    kitchenUse:      searchParams.get("kitchenUse") ?? "",
    commonTemp:      searchParams.get("commonTemp") ?? "",
    bathroomTime:    searchParams.get("bathroomTime") ?? "",
    pets:            searchParams.get("pets") ?? "",
    smoking:         searchParams.get("smoking") ?? "",
    alcohol:         searchParams.get("alcohol") ?? "",
    cleanliness:     searchParams.get("cleanliness") ?? "",
    visits:          searchParams.get("visits") ?? "",
    overnightGuests: searchParams.get("overnightGuests") ?? "",
    personality:     searchParams.get("personality") ?? "",
    conflictStyle:   searchParams.get("conflictStyle") ?? "",
    cohabitation:    searchParams.get("cohabitation") ?? "",
    budget:          Number(searchParams.get("budget") ?? 300),
    city:            searchParams.get("city") ?? "",
    roommateGender:  searchParams.get("roommateGender") ?? "",
    occupation:      searchParams.get("occupation") ?? "",
  }), [searchParams]);

  const hasPrefs = !!prefs.schedule;

  // Persist prefs to localStorage so profile/chat/date pages can access them
  useEffect(() => {
    if (hasPrefs) savePrefs(prefs as MatchPrefs);
  }, [prefs, hasPrefs]);

  const scored = useMemo(() => {
    if (!hasPrefs) return [];
    return mockListings
      .map((l) => ({ listing: l, score: calcScore(l, prefs) }))
      .sort((a, b) => b.score - a.score);
  }, [prefs, hasPrefs]);

  const available = scored.filter((s) => s.listing.available);
  const unavailable = scored.filter((s) => !s.listing.available);
  const results = [...available, ...unavailable];

  const topScore = results[0]?.score ?? 0;
  const highMatches = results.filter((r) => r.score >= 70 && r.listing.available).length;

  const prefPills = [
    scheduleLabel[prefs.schedule],
    noiseLabel[prefs.noise],
    cleanLabel[prefs.cleanliness],
    personalityLabel[prefs.personality],
    prefs.budget ? `Hasta $${prefs.budget}` : null,
    prefs.city || null,
  ].filter(Boolean) as string[];

  if (!hasPrefs) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <Home size={48} className="text-muted mb-4" />
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Primero completa el quiz</h1>
        <p className="text-muted mb-6">Necesitamos conocer tus preferencias para mostrarte los mejores matches.</p>
        <Link href="/match" className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors">
          Ir al quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link href="/" className="font-serif text-xl font-bold text-primary tracking-tight shrink-0">
            nidoo
          </Link>
          <div className="h-5 w-px bg-border" />
          <button
            onClick={() => router.push("/match")}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Editar preferencias
          </button>
          <div className="flex-1" />
          <button
            onClick={() => router.push("/match")}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            <SlidersHorizontal size={15} />
            Ajustar
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        {/* Summary header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-1 text-balance">
                {highMatches > 0
                  ? `${highMatches} match${highMatches > 1 ? "es" : ""} encontrado${highMatches > 1 ? "s" : ""}`
                  : "Tus resultados"}
                {prefs.city ? ` en ${prefs.city}` : ""}
              </h1>
              <p className="text-muted">
                Ordenados por compatibilidad en{" "}
                <span className="font-semibold text-foreground">19 dimensiones de convivencia</span>.
                Tu mejor match: <span className="font-semibold text-primary">{topScore}%</span>.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold h-fit shrink-0">
              <ShieldCheck size={14} />
              Perfiles verificados
            </div>
          </div>

          {/* Prefs pills */}
          <div className="flex flex-wrap gap-2">
            {prefPills.map((pill) => (
              <span key={pill} className="text-xs bg-secondary text-foreground/70 border border-border px-3 py-1.5 rounded-full font-medium">
                {pill}
              </span>
            ))}
            <button
              onClick={() => router.push("/match")}
              className="text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full font-medium hover:bg-primary/10 transition-colors"
            >
              Cambiar preferencias
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-xs text-muted flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            80%+ Match excelente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary inline-block" />
            55-79% Compatible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-muted inline-block" />
            {"<55% Poca afinidad"}
          </span>
        </div>

        {/* Cards */}
        {results.length > 0 ? (
          <div className="flex flex-col gap-5">
            {results.map(({ listing, score }, i) => (
              <div key={listing.id} className={listing.available ? "" : "opacity-60"}>
                {!listing.available && i > 0 && results[i - 1].listing.available && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted font-medium px-2">No disponibles actualmente</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <ResultCard listing={listing} score={score} prefs={prefs} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-muted text-lg mb-2">Sin resultados{prefs.city ? ` en ${prefs.city}` : ""}</p>
            <p className="text-muted text-sm mb-6">Intenta con otra ciudad o ajusta tu presupuesto.</p>
            <button
              onClick={() => router.push("/match")}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Cambiar preferencias
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 p-6 bg-secondary rounded-2xl border border-border text-center">
          <h2 className="font-serif text-xl font-bold text-foreground mb-2">
            {"Te gusto algun match?"}
          </h2>
          <p className="text-muted text-sm mb-4">
            {"Registrate gratis para contactar directamente a los propietarios y asegurar tu cuarto."}
          </p>
          <Link
            href="/registro/inquilino"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-primary-md"
          >
            Crear mi cuenta gratis
            <ChevronRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
