"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, MapPin, Star, BadgeCheck, Wifi, CheckCircle2,
  ChevronRight, Users, DollarSign, Filter, Home, Zap,
  FileText, Heart, AlertCircle,
} from "lucide-react";
import { mockListings, type Listing } from "@/lib/listings";
import { mockRoommates } from "@/lib/mock-roommates";
import { getPrefs, type MatchPrefs } from "@/lib/match-prefs";

/* ── Scoring (listing vs user prefs) ────────────────────────────── */
function scoreListingForTwo(l: Listing, p: MatchPrefs): number {
  let pts = 0;
  if (p.schedule === l.hostSchedule) pts += 10;
  else if (p.schedule === "flexible" || l.hostSchedule === "flexible") pts += 6;
  if (p.noise === l.hostNoise) pts += 8; else if (p.noise === "normal") pts += 4;
  if (p.pets === l.hostPets) pts += 6; else if (l.hostPets === "acepta") pts += 6;
  if (p.smoking === l.hostSmoking) pts += 10; else if (p.smoking === "no" && l.hostSmoking === "no") pts += 10;
  if (p.cleanliness === l.hostCleanliness) pts += 7; else if (p.cleanliness === "normal") pts += 3;
  if (p.personality === l.hostPersonality) pts += 5; else if (p.personality === "ambivertido" || l.hostPersonality === "ambivertido") pts += 3;
  if (p.cohabitation === l.hostCohabitation) pts += 5; else if (p.cohabitation === "cordial") pts += 2;
  if (p.visits === l.hostVisits) pts += 4;
  if (p.alcohol === l.hostAlcohol) pts += 5;
  return Math.min(100, pts);
}

/* ── Mini score ring ─────────────────────────────────────────────── */
function MiniRing({ score, size = 52 }: { score: number; size?: number }) {
  const [anim, setAnim] = useState(0);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (anim / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 55 ? "#e07030" : "#9e7a5a";
  useEffect(() => { const t = setTimeout(() => setAnim(score), 80); return () => clearTimeout(t); }, [score]);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute text-[10px] font-black" style={{ color }}>{anim}%</span>
    </div>
  );
}

/* ── Room card ───────────────────────────────────────────────────── */
function RoomCard({
  listing, score, combinedBudget, roommateId,
}: { listing: Listing; score: number; combinedBudget: number; roommateId: string }) {
  const perPerson = Math.round(listing.price / 2);
  const canAfford = combinedBudget >= listing.price;

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-primary-sm">
      {/* Room image area */}
      <div
        className="h-32 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${listing.hostColor}18, ${listing.hostColor}35)` }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: listing.hostColor }}
        >
          {listing.hostInitials}
        </div>
        {!listing.available && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-foreground/70 px-3 py-1 rounded-full">
              No disponible
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <MiniRing score={score} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-bold text-foreground text-sm flex-1">{listing.title}</h3>
          {listing.verified && <BadgeCheck size={15} className="text-primary shrink-0 mt-0.5" />}
        </div>
        <p className="flex items-center gap-1 text-xs text-muted mb-3">
          <MapPin size={11} />
          {listing.neighborhood}, {listing.city}
        </p>

        {/* Precio */}
        <div className={`rounded-xl px-3 py-2.5 mb-3 ${canAfford ? "bg-primary/5 border border-primary/15" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Por persona</p>
              <p className={`font-black text-lg ${canAfford ? "text-primary" : "text-red-600"}`}>
                ${perPerson}<span className="text-xs font-normal text-muted">/mes</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Total</p>
              <p className="font-semibold text-foreground text-sm">${listing.price}/mes</p>
            </div>
          </div>
          {!canAfford && (
            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle size={11} />
              Supera el presupuesto combinado
            </p>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {listing.amenities.slice(0, 3).map((a) => (
            <span key={a} className="text-xs bg-secondary text-foreground/70 border border-border px-2 py-1 rounded-full">
              {a}
            </span>
          ))}
          {listing.amenities.length > 3 && (
            <span className="text-xs text-muted px-2 py-1">+{listing.amenities.length - 3}</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1 text-xs text-foreground/60">
            <Star size={11} className="text-yellow-500 fill-yellow-500" />
            {listing.rating} ({listing.reviews} reseñas)
          </span>
          <span className="text-xs text-muted">{listing.environment}</span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <Link
            href={`/cuarto/${listing.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-secondary hover:bg-muted-bg text-foreground border border-border px-3 py-2.5 rounded-full transition-colors"
          >
            Ver cuarto
          </Link>
          <Link
            href={`/cuarto/${listing.id}/contrato?roommate=${roommateId}`}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-full transition-colors ${listing.available
              ? "bg-primary hover:bg-primary-hover text-white"
              : "bg-muted-bg text-muted cursor-not-allowed border border-border"}`}
            aria-disabled={!listing.available}
            onClick={(e) => !listing.available && e.preventDefault()}
          >
            <FileText size={12} />
            Rentar juntos
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function BuscarJuntosPage() {
  const params = useParams();
  const roommateId = params.roommateId as string;
  const roommate = mockRoommates.find((r) => r.id === Number(roommateId));

  const [prefs, setPrefs] = useState<MatchPrefs | null>(null);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterCity, setFilterCity] = useState("todas");

  useEffect(() => { setPrefs(getPrefs()); }, []);

  const combinedBudget = useMemo(() => {
    const userBudget = prefs?.budget ?? 200;
    const roommateBudget = roommate?.budget ?? 200;
    return userBudget + roommateBudget;
  }, [prefs, roommate]);

  const scored = useMemo(() => {
    return mockListings
      .map((l) => ({
        listing: l,
        score: prefs ? scoreListingForTwo(l, prefs) : 50,
      }))
      .filter((x) => {
        if (filterAvailable && !x.listing.available) return false;
        if (filterCity !== "todas" && x.listing.city !== filterCity) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [prefs, filterAvailable, filterCity]);

  const cities = Array.from(new Set(mockListings.map((l) => l.city)));

  if (!roommate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <Users size={40} className="text-muted mx-auto mb-4" />
          <p className="font-serif text-xl font-bold text-foreground mb-2">Roommate no encontrado</p>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium text-sm">
            Volver a resultados
          </Link>
        </div>
      </div>
    );
  }

  const perPersonCapacity = Math.floor(combinedBudget / 2);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link href={`/match/${roommateId}`} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
            Perfil de {roommate.name.split(" ")[0]}
          </Link>
          <div className="flex-1" />
          <Link href="/" className="font-serif text-lg font-bold text-primary tracking-tight">nidoo</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">

        {/* Banner de duo */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Avatares duo */}
            <div className="flex items-center -space-x-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-background flex items-center justify-center text-primary font-bold text-sm">
                TU
              </div>
              <div
                className="w-12 h-12 rounded-xl border-2 border-background flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: roommate.color }}
              >
                {roommate.initials}
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-background bg-green-100 flex items-center justify-center ml-1">
                <Heart size={14} className="text-green-600" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">Tu y {roommate.name}</p>
              <p className="text-xs text-muted">Buscando cuarto juntos</p>
            </div>

            {/* Presupuesto combinado */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-right shrink-0">
              <p className="text-xs text-muted">Presupuesto combinado</p>
              <p className="font-black text-primary text-lg">${combinedBudget}<span className="text-xs font-normal text-muted">/mes</span></p>
              <p className="text-xs text-muted">${perPersonCapacity} c/u max</p>
            </div>
          </div>
        </div>

        {/* Info sobre el filtrado */}
        <div className="bg-muted-bg border border-border rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
          <Zap size={15} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted leading-relaxed">
            Los cuartos estan ordenados por <strong>compatibilidad de tus habitos</strong> con el arrendador. El presupuesto combinado de ${combinedBudget}/mes te permite pagar hasta ${perPersonCapacity} por persona.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
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
              checked={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.checked)}
              className="accent-primary rounded"
            />
            Solo disponibles
          </label>
          <span className="text-xs text-muted ml-auto">
            {scored.length} cuarto{scored.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid de cuartos */}
        <div className="grid sm:grid-cols-2 gap-4">
          {scored.map(({ listing, score }) => (
            <RoomCard
              key={listing.id}
              listing={listing}
              score={score}
              combinedBudget={combinedBudget}
              roommateId={roommateId}
            />
          ))}
          {scored.length === 0 && (
            <div className="sm:col-span-2 text-center py-16">
              <Home size={40} className="text-muted mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-foreground mb-1">Sin resultados</p>
              <p className="text-sm text-muted">Prueba quitando los filtros activos.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
