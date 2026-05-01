"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, SlidersHorizontal, Star, ShieldCheck, Wifi, BadgeCheck,
  TrendingDown, CheckCircle2, XCircle, ChevronRight, Home,
} from "lucide-react";
import { mockListings, type Listing } from "@/lib/listings";

// ── Scoring logic ─────────────────────────────────────────────────────────────
type Prefs = {
  schedule: string;
  noise: string;
  visits: string;
  pets: string;
  smoking: string;
  cleanliness: string;
  budget: number;
  city: string;
  roommateGender: string;
  occupation: string;
};

type MatchTag = { label: string; match: boolean };

function calcScore(listing: Listing, prefs: Prefs): number {
  let score = 0;

  // Schedule compatibility (25 pts)
  if (prefs.schedule === listing.hostSchedule) score += 25;
  else if (
    (prefs.schedule === "flexible" || listing.hostSchedule === "flexible") ||
    (prefs.schedule === "home-office" && listing.hostSchedule === "flexible")
  ) score += 15;

  // Noise compatibility (20 pts)
  if (prefs.noise === listing.hostNoise) score += 20;
  else if (prefs.noise === "normal" && listing.hostNoise !== "muy-tranquilo") score += 10;

  // Pets compatibility (20 pts)
  const petsOk =
    prefs.pets === listing.hostPets ||
    listing.hostPets === "acepta" ||
    (prefs.pets === "no" && listing.hostPets === "no");
  if (petsOk) score += 20;

  // Smoking compatibility (15 pts)
  const smokingOk =
    prefs.smoking === listing.hostSmoking ||
    (prefs.smoking === "no" && listing.hostSmoking === "no") ||
    (prefs.smoking === "afuera" && listing.hostSmoking !== "si");
  if (smokingOk) score += 15;

  // Cleanliness compatibility (10 pts)
  if (prefs.cleanliness === listing.hostCleanliness) score += 10;
  else if (prefs.cleanliness === "normal") score += 5;

  // Visits compatibility (10 pts)
  if (prefs.visits === listing.hostVisits) score += 10;
  else if (
    (prefs.visits === "a-veces" && listing.hostVisits !== "casi-nunca") ||
    (prefs.visits === "casi-nunca" && listing.hostVisits === "casi-nunca")
  ) score += 5;

  // Budget bonus: if within budget (no direct deduction, just a boost)
  if (listing.price <= prefs.budget) score = Math.min(100, score + 5);

  // Occupation preference
  if (prefs.occupation === "sin-preferencia" || prefs.occupation === listing.hostOccupation) {
    score = Math.min(100, score + 5);
  }

  return Math.min(100, score);
}

function buildTags(listing: Listing, prefs: Prefs): MatchTag[] {
  const tags: MatchTag[] = [];

  tags.push({
    label: "Horario",
    match: prefs.schedule === listing.hostSchedule || prefs.schedule === "flexible" || listing.hostSchedule === "flexible",
  });
  tags.push({
    label: "Ruido",
    match: prefs.noise === listing.hostNoise || prefs.noise === "normal",
  });
  tags.push({
    label: "Mascotas",
    match: prefs.pets === listing.hostPets || listing.hostPets === "acepta" || (prefs.pets === "no" && listing.hostPets === "no"),
  });
  tags.push({
    label: "Tabaco",
    match: prefs.smoking === listing.hostSmoking || (prefs.smoking === "no" && listing.hostSmoking === "no") || (prefs.smoking === "afuera" && listing.hostSmoking !== "si"),
  });
  tags.push({
    label: "Limpieza",
    match: prefs.cleanliness === listing.hostCleanliness || prefs.cleanliness === "normal",
  });
  tags.push({
    label: "Presupuesto",
    match: listing.price <= prefs.budget,
  });

  return tags;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 55) return "text-primary";
  return "text-muted";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 55) return "bg-primary/5 border-primary/20";
  return "bg-muted-bg border-border";
}

function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 55) return "bg-primary";
  return "bg-muted";
}

// ── Pill summary of user prefs ────────────────────────────────────────────────
const scheduleLabel: Record<string, string> = {
  manana: "Madrugador/a", noche: "Nocturno/a",
  flexible: "Flexible", "home-office": "Home office",
};
const noiseLabel: Record<string, string> = {
  "muy-tranquilo": "Muy tranquilo", normal: "Normal", social: "Social",
};
const petsLabel: Record<string, string> = {
  no: "Sin mascotas", "si-pequena": "Mascota pequeña",
  "si-grande": "Mascota grande", acepta: "Acepta mascotas",
};
const smokingLabel: Record<string, string> = {
  no: "No fumo", afuera: "Fumo afuera", si: "Fumo en casa",
};
const cleanlinessLabel: Record<string, string> = {
  "muy-ordenado": "Muy ordenado/a", normal: "Normal", relajado: "Relajado/a",
};

// ── Animated score bar ────────────────────────────────────────────────────────
function ScoreBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), delay + 100);
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
function ResultCard({
  listing,
  score,
  prefs,
  index,
}: {
  listing: Listing;
  score: number;
  prefs: Prefs;
  index: number;
}) {
  const tags = buildTags(listing, prefs);
  const matchTags = tags.filter((t) => t.match);
  const savings = Math.round(listing.price * 0.5);

  return (
    <article
      className={`bg-card rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-primary-md hover:-translate-y-0.5 ${scoreBg(score)}`}
    >
      {/* Score header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Host avatar + info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: listing.hostColor }}
            >
              {listing.hostInitials}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm leading-tight">{listing.host}</p>
              <p className="text-xs text-muted">{listing.neighborhood}, {listing.city}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={11} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium text-foreground/80">
                  {listing.rating} ({listing.reviews})
                </span>
                {listing.verified && (
                  <span className="flex items-center gap-0.5 text-xs text-primary font-medium ml-1">
                    <BadgeCheck size={12} />
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Compatibility badge */}
          <div className="text-right shrink-0">
            <p className={`text-2xl font-black leading-none ${scoreColor(score)}`}>{score}%</p>
            <p className="text-xs text-muted font-medium mt-0.5">compatible</p>
          </div>
        </div>

        <ScoreBar score={score} delay={index * 80} />
      </div>

      {/* Room info */}
      <div className="px-5 pb-3 border-t border-border/50">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">{listing.title}</p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {listing.amenities.slice(0, 3).map((a) => (
                <span key={a} className="text-xs bg-secondary text-muted px-2 py-0.5 rounded-full">
                  {a === "WiFi" ? <span className="flex items-center gap-1"><Wifi size={10} />{a}</span> : a}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-foreground">${listing.price}</p>
            <p className="text-xs text-muted">/ mes</p>
          </div>
        </div>
      </div>

      {/* Match tags */}
      <div className="px-5 pb-3">
        <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
          Compatibilidad detallada
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                tag.match
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-muted-bg text-muted border border-border"
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

      {/* Savings + CTA */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <TrendingDown size={15} className="text-primary shrink-0" />
            <span>
              Ahorra{" "}
              <span className="font-bold text-primary">${savings}/mes</span>{" "}
              al compartir
            </span>
          </div>
          <Link
            href={`/habitacion/${listing.id}`}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shrink-0"
          >
            Ver cuarto
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MatchResultadosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const prefs: Prefs = useMemo(() => ({
    schedule:       searchParams.get("schedule") ?? "",
    noise:          searchParams.get("noise") ?? "",
    visits:         searchParams.get("visits") ?? "",
    pets:           searchParams.get("pets") ?? "",
    smoking:        searchParams.get("smoking") ?? "",
    cleanliness:    searchParams.get("cleanliness") ?? "",
    budget:         Number(searchParams.get("budget") ?? 300),
    city:           searchParams.get("city") ?? "",
    roommateGender: searchParams.get("roommateGender") ?? "",
    occupation:     searchParams.get("occupation") ?? "",
  }), [searchParams]);

  const hasPrefs = !!prefs.schedule;

  // Score every listing
  const scored = useMemo(() => {
    if (!hasPrefs) return mockListings.map((l) => ({ listing: l, score: 0 }));
    return mockListings
      .filter((l) => !prefs.city || l.city.toLowerCase().includes(prefs.city.toLowerCase()) || prefs.city === "CDMX" || prefs.city === "Guadalajara" || prefs.city === "Monterrey" || prefs.city === "Bogota" || prefs.city === "Medellin" || prefs.city === "Lima")
      .map((l) => ({ listing: l, score: calcScore(l, prefs) }))
      .sort((a, b) => b.score - a.score);
  }, [prefs, hasPrefs]);

  // Show all available first, unavailable at the bottom
  const available = scored.filter((s) => s.listing.available);
  const unavailable = scored.filter((s) => !s.listing.available);
  const results = [...available, ...unavailable];

  const topScore = results[0]?.score ?? 0;
  const highMatches = results.filter((r) => r.score >= 70).length;

  const prefPills = [
    scheduleLabel[prefs.schedule],
    noiseLabel[prefs.noise],
    petsLabel[prefs.pets],
    smokingLabel[prefs.smoking],
    cleanlinessLabel[prefs.cleanliness],
    prefs.budget ? `Hasta $${prefs.budget}` : null,
  ].filter(Boolean) as string[];

  if (!hasPrefs) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <Home size={48} className="text-muted mb-4" />
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          Primero completa el quiz
        </h1>
        <p className="text-muted mb-6">Necesitamos conocer tus preferencias para mostrarte los mejores matches.</p>
        <Link
          href="/match"
          className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
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
        {/* Summary */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-1 text-balance">
                {highMatches > 0
                  ? `${highMatches} match${highMatches > 1 ? "es" : ""} encontrado${highMatches > 1 ? "s" : ""} para ti`
                  : "Tus resultados"}
                {prefs.city ? ` en ${prefs.city}` : ""}
              </h1>
              <p className="text-muted">
                Ordenados por compatibilidad. Tu mejor match tiene{" "}
                <span className="font-semibold text-primary">{topScore}%</span> de afinidad.
              </p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
                <ShieldCheck size={14} />
                Perfiles verificados
              </div>
            </div>
          </div>

          {/* Prefs pills */}
          <div className="flex flex-wrap gap-2">
            {prefPills.map((pill) => (
              <span
                key={pill}
                className="text-xs bg-secondary text-foreground/70 border border-border px-3 py-1.5 rounded-full font-medium"
              >
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

        {/* Score legend */}
        <div className="flex items-center gap-4 mb-6 text-xs text-muted flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            80%+ Muy compatible
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

        {/* Results grid */}
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
            <p className="text-muted text-lg mb-2">Sin resultados en {prefs.city}</p>
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
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-primary-md animate-glow"
          >
            Crear mi cuenta gratis
            <ChevronRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
