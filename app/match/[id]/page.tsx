"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ShieldCheck, BadgeCheck, Star, MapPin,
  MessageCircle, Heart, Calendar, Wifi, Clock,
  CheckCircle2, XCircle, ChevronRight, Video,
  Smartphone, Globe, UserCheck, Home, Search, FileText,
} from "lucide-react";
import { mockListings, type Listing } from "@/lib/listings";
import { getPrefs, type MatchPrefs } from "@/lib/match-prefs";

/* ── Scoring (reused from results) ─────────────────────────────── */
function calcScore(l: Listing, p: MatchPrefs): number {
  let pts = 0;
  if (p.schedule === l.hostSchedule) pts += 12;
  else if (p.schedule === "flexible" || l.hostSchedule === "flexible") pts += 7;
  else if ((p.schedule === "manana" && l.hostSchedule === "home-office") || (p.schedule === "home-office" && l.hostSchedule === "manana")) pts += 5;
  if (p.daysHome === l.hostDaysHome) pts += 8; else if (p.daysHome === "mitad") pts += 4;
  if (p.noise === l.hostNoise) pts += 8; else if (p.noise === "normal") pts += 4;
  if (p.kitchenUse === l.hostKitchenUse) pts += 5; else if (p.kitchenUse === "raramente" || l.hostKitchenUse === "raramente") pts += 2;
  if (p.commonTemp === l.hostCommonTemp) pts += 5; else if (p.commonTemp === "templado" || l.hostCommonTemp === "templado") pts += 2;
  if (p.bathroomTime === l.hostBathroomTime) pts += 4; else if (p.bathroomTime === "normal") pts += 2;
  if (p.pets === l.hostPets) pts += 6; else if (l.hostPets === "acepta") pts += 6; else if (p.pets === "acepta" && l.hostPets !== "no") pts += 3;
  if (p.smoking === l.hostSmoking) pts += 8; else if (p.smoking === "no" && l.hostSmoking === "no") pts += 8; else if (p.smoking === "afuera" && l.hostSmoking === "no") pts += 4;
  if (p.alcohol === l.hostAlcohol) pts += 5; else if (p.alcohol === "social" && l.hostAlcohol !== "frecuente") pts += 2;
  if (p.cleanliness === l.hostCleanliness) pts += 7; else if (p.cleanliness === "normal") pts += 3;
  if (p.visits === l.hostVisits) pts += 4; else if (p.visits === "a-veces") pts += 2;
  if (p.overnightGuests === l.hostOvernightGuests) pts += 3; else if (p.overnightGuests === "a-veces") pts += 1;
  if (p.personality === l.hostPersonality) pts += 5; else if (p.personality === "ambivertido" || l.hostPersonality === "ambivertido") pts += 3;
  if (p.conflictStyle === l.hostConflictStyle) pts += 5; else if (p.conflictStyle !== "evitar" && l.hostConflictStyle !== "evitar") pts += 2;
  if (p.cohabitation === l.hostCohabitation) pts += 5; else if (p.cohabitation === "cordial") pts += 2;
  if (l.price <= p.budget) pts += 5; else if (l.price <= p.budget * 1.1) pts += 2;
  if (p.occupation === "sin-preferencia" || p.occupation === l.hostOccupation) pts += 3;
  if (p.roommateGender === "sin-preferencia" || p.roommateGender === "cualquiera") pts += 2;
  else if (p.roommateGender === l.hostRoommateGender || l.hostRoommateGender === "cualquiera" || l.hostRoommateGender === "sin-preferencia") pts += 2;
  return Math.min(100, pts);
}

/* ── Labels ───────────────────────────────────────────────────── */
const labelMap: Record<string, Record<string, string>> = {
  hostSchedule: { manana: "Madrugador/a", noche: "Nocturno/a", flexible: "Horario flexible", "home-office": "Home office" },
  hostDaysHome: { pocos: "Sale mucho", mitad: "Mitad en casa", "casi-siempre": "Casi siempre en casa" },
  hostNoise: { "muy-tranquilo": "Silencio total", normal: "Ambiente normal", social: "Casa animada" },
  hostKitchenUse: { raramente: "Cocina poco", "cocino-seguido": "Cocina seguido", "meal-prep": "Meal prep" },
  hostCleanliness: { "muy-ordenado": "Muy ordenado/a", normal: "Orden normal", relajado: "Relajado/a" },
  hostPersonality: { introvertido: "Introvertido/a", ambivertido: "Ambivertido/a", extrovertido: "Extrovertido/a" },
  hostCohabitation: { "independencia-total": "Independencia total", cordial: "Trato cordial", convivir: "Le gusta convivir" },
  hostConflictStyle: { "hablar-directo": "Habla directo", escrito: "Prefiere escribir", evitar: "Evita conflictos" },
  hostSmoking: { no: "No fuma", afuera: "Solo afuera", si: "Fuma" },
  hostAlcohol: { no: "No toma", social: "Social", frecuente: "Frecuente" },
  hostPets: { no: "Sin mascotas", "si-pequena": "Mascota peque\u00f1a", "si-grande": "Mascota grande", acepta: "Acepta mascotas" },
  hostVisits: { "casi-nunca": "Casi nunca", "a-veces": "A veces", seguido: "Seguido" },
  hostOvernightGuests: { no: "No", "a-veces": "A veces", si: "S\u00ed" },
  hostBathroomTime: { rapido: "R\u00e1pido", normal: "Normal", largo: "Se toma su tiempo" },
  hostCommonTemp: { frio: "Prefiere fr\u00edo", templado: "Templado", calido: "Prefiere c\u00e1lido" },
  hostOccupation: { estudiante: "Estudiante", profesional: "Profesional", "sin-preferencia": "Sin preferencia" },
};

function getLabel(field: string, value: string): string {
  return labelMap[field]?.[value] ?? value;
}

/* ── Compatibility dimensions ─────────────────────────────────── */
type DimGroup = {
  title: string;
  dims: { label: string; userVal: string; hostVal: string; match: boolean }[];
};

function buildDimGroups(l: Listing, p: MatchPrefs): DimGroup[] {
  const m = (pv: string, hv: string, loose?: string[]) =>
    pv === hv || (loose ?? []).includes(pv) || (loose ?? []).includes(hv);

  return [
    {
      title: "Ritmo de vida",
      dims: [
        { label: "Horario", userVal: getLabel("hostSchedule", p.schedule), hostVal: getLabel("hostSchedule", l.hostSchedule), match: m(p.schedule, l.hostSchedule, ["flexible"]) },
        { label: "D\u00edas en casa", userVal: getLabel("hostDaysHome", p.daysHome), hostVal: getLabel("hostDaysHome", l.hostDaysHome), match: m(p.daysHome, l.hostDaysHome, ["mitad"]) },
      ],
    },
    {
      title: "Convivencia diaria",
      dims: [
        { label: "Ruido", userVal: getLabel("hostNoise", p.noise), hostVal: getLabel("hostNoise", l.hostNoise), match: m(p.noise, l.hostNoise, ["normal"]) },
        { label: "Cocina", userVal: getLabel("hostKitchenUse", p.kitchenUse), hostVal: getLabel("hostKitchenUse", l.hostKitchenUse), match: p.kitchenUse === l.hostKitchenUse },
        { label: "Temperatura", userVal: getLabel("hostCommonTemp", p.commonTemp), hostVal: getLabel("hostCommonTemp", l.hostCommonTemp), match: m(p.commonTemp, l.hostCommonTemp, ["templado"]) },
        { label: "Ba\u00f1o", userVal: getLabel("hostBathroomTime", p.bathroomTime), hostVal: getLabel("hostBathroomTime", l.hostBathroomTime), match: m(p.bathroomTime, l.hostBathroomTime, ["normal"]) },
      ],
    },
    {
      title: "H\u00e1bitos",
      dims: [
        { label: "Mascotas", userVal: getLabel("hostPets", p.pets), hostVal: getLabel("hostPets", l.hostPets), match: p.pets === l.hostPets || l.hostPets === "acepta" || (p.pets === "no" && l.hostPets === "no") },
        { label: "Tabaco", userVal: getLabel("hostSmoking", p.smoking), hostVal: getLabel("hostSmoking", l.hostSmoking), match: p.smoking === l.hostSmoking || (p.smoking === "no" && l.hostSmoking === "no") },
        { label: "Alcohol", userVal: getLabel("hostAlcohol", p.alcohol), hostVal: getLabel("hostAlcohol", l.hostAlcohol), match: p.alcohol === l.hostAlcohol },
        { label: "Limpieza", userVal: getLabel("hostCleanliness", p.cleanliness), hostVal: getLabel("hostCleanliness", l.hostCleanliness), match: m(p.cleanliness, l.hostCleanliness, ["normal"]) },
        { label: "Visitas", userVal: getLabel("hostVisits", p.visits), hostVal: getLabel("hostVisits", l.hostVisits), match: p.visits === l.hostVisits },
        { label: "Invitados a dormir", userVal: getLabel("hostOvernightGuests", p.overnightGuests), hostVal: getLabel("hostOvernightGuests", l.hostOvernightGuests), match: p.overnightGuests === l.hostOvernightGuests },
      ],
    },
    {
      title: "Perfil social",
      dims: [
        { label: "Personalidad", userVal: getLabel("hostPersonality", p.personality), hostVal: getLabel("hostPersonality", l.hostPersonality), match: m(p.personality, l.hostPersonality, ["ambivertido"]) },
        { label: "Conflictos", userVal: getLabel("hostConflictStyle", p.conflictStyle), hostVal: getLabel("hostConflictStyle", l.hostConflictStyle), match: p.conflictStyle === l.hostConflictStyle },
        { label: "Tipo convivencia", userVal: getLabel("hostCohabitation", p.cohabitation), hostVal: getLabel("hostCohabitation", l.hostCohabitation), match: p.cohabitation === l.hostCohabitation },
      ],
    },
  ];
}

/* ── Common interests text ────────────────────────────────────── */
function buildCommonInterests(l: Listing, p: MatchPrefs): string[] {
  const items: string[] = [];
  if (p.schedule === l.hostSchedule) {
    if (p.schedule === "manana") items.push("Ambos son madrugadores");
    else if (p.schedule === "noche") items.push("Ambos son nocturnos");
    else if (p.schedule === "home-office") items.push("Ambos trabajan desde casa");
  }
  if (p.noise === l.hostNoise) {
    if (p.noise === "muy-tranquilo") items.push("Ambos prefieren el silencio");
    else if (p.noise === "social") items.push("A ambos les gusta el ambiente animado");
  }
  if (p.cleanliness === l.hostCleanliness) {
    if (p.cleanliness === "muy-ordenado") items.push("Ambos son muy ordenados");
    else if (p.cleanliness === "relajado") items.push("Ambos son relajados con el orden");
  }
  if (p.personality === l.hostPersonality) {
    items.push(`Ambos son ${getLabel("hostPersonality", p.personality).toLowerCase()}s`);
  }
  if (p.smoking === "no" && l.hostSmoking === "no") items.push("Ninguno fuma");
  if (p.cohabitation === l.hostCohabitation) {
    items.push(`Ambos prefieren ${getLabel("hostCohabitation", p.cohabitation).toLowerCase()}`);
  }
  if (p.kitchenUse === l.hostKitchenUse && p.kitchenUse !== "raramente") {
    items.push("Comparten el gusto por cocinar");
  }
  if (p.conflictStyle === l.hostConflictStyle && p.conflictStyle === "hablar-directo") {
    items.push("Ambos prefieren hablar las cosas de frente");
  }
  return items;
}

/* ── Trust badges mock data ───────────────────────────────────── */
function getTrustBadges(l: Listing) {
  const badges = [];
  if (l.verified) badges.push({ icon: BadgeCheck, label: "Identidad verificada", color: "text-green-600 bg-green-50 border-green-200" });
  badges.push({ icon: Smartphone, label: "Tel\u00e9fono verificado", color: "text-blue-600 bg-blue-50 border-blue-200" });
  if (l.rating >= 4.5) badges.push({ icon: Star, label: `${l.rating} estrellas (${l.reviews} rese\u00f1as)`, color: "text-yellow-600 bg-yellow-50 border-yellow-200" });
  if (l.verified) badges.push({ icon: Globe, label: "Redes sociales vinculadas", color: "text-purple-600 bg-purple-50 border-purple-200" });
  badges.push({ icon: Calendar, label: `${Math.floor(Math.random() * 12) + 3} meses en Nidoo`, color: "text-muted bg-secondary border-border" });
  return badges;
}

/* ── Score ring SVG ───────────────────────────────────────────── */
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animatedScore / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 55 ? "#e07030" : "#9e7a5a";

  useEffect(() => {
    const t = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-foreground">{animatedScore}%</span>
        <span className="text-xs text-muted font-medium">compatibilidad</span>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function MatchProfilePage() {
  const params = useParams();
  const id = Number(params.id);
  const listing = mockListings.find((l) => l.id === id);
  const [prefs, setPrefs] = useState<MatchPrefs | null>(null);

  useEffect(() => {
    setPrefs(getPrefs());
  }, []);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <Home size={48} className="text-muted mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Perfil no encontrado</h1>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium">Volver a resultados</Link>
        </div>
      </div>
    );
  }

  const score = prefs ? calcScore(listing, prefs) : 0;
  const dimGroups = prefs ? buildDimGroups(listing, prefs) : [];
  const commonInterests = prefs ? buildCommonInterests(listing, prefs) : [];
  const trustBadges = getTrustBadges(listing);
  const savings = Math.round(listing.price * 0.5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link href="/match/resultados" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
            Resultados
          </Link>
          <div className="flex-1" />
          <Link href="/" className="font-serif text-lg font-bold text-primary tracking-tight">nidoo</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        {/* ── Hero card ─────────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-primary-md"
                style={{ backgroundColor: listing.hostColor }}
              >
                {listing.hostInitials}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{listing.host}</h1>
                  {listing.verified && <BadgeCheck size={20} className="text-primary shrink-0" />}
                </div>
                <p className="text-muted flex items-center justify-center md:justify-start gap-1.5">
                  <MapPin size={14} />
                  {listing.neighborhood}, {listing.city}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-foreground/70">
                    <Star size={13} className="text-yellow-500 fill-yellow-500" />
                    {listing.rating} ({listing.reviews})
                  </span>
                  <span className="flex items-center gap-1 text-foreground/70">
                    <UserCheck size={13} />
                    {getLabel("hostOccupation", listing.hostOccupation)}
                  </span>
                </div>
              </div>

              {/* Score ring */}
              {prefs && <ScoreRing score={score} />}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href={`/match/${id}/chat`}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-3 rounded-full transition-colors shadow-primary-sm"
              >
                <MessageCircle size={18} />
                Iniciar chat
              </Link>
              <Link
                href={`/match/${id}/date`}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-muted-bg text-foreground font-semibold px-5 py-3 rounded-full transition-colors border border-border"
              >
                <Heart size={18} />
                Roommate date
              </Link>
              <Link
                href={`/match/${id}/videocall`}
                className="flex items-center justify-center gap-2 text-foreground/70 hover:text-foreground font-medium px-5 py-3 rounded-full transition-colors border border-border hover:bg-secondary"
              >
                <Video size={18} />
                <span className="sm:hidden lg:inline">Videollamada</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Trust badges ──────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">Verificaciones</h2>
          <div className="flex flex-wrap gap-2">
            {trustBadges.map((b) => {
              const Icon = b.icon;
              return (
                <span key={b.label} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border ${b.color}`}>
                  <Icon size={13} />
                  {b.label}
                </span>
              );
            })}
          </div>
        </section>

        {/* ── In common ─────────────────────────────────────────── */}
        {commonInterests.length > 0 && (
          <section className="mb-6 bg-green-50/50 border border-green-200/60 rounded-2xl p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
              <CheckCircle2 size={16} />
              {"Lo que tienen en comun"}
            </h2>
            <ul className="space-y-2">
              {commonInterests.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-green-800">
                  <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Compatibility breakdown ───────────────────────────── */}
        {prefs && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Compatibilidad detallada</h2>
            <div className="space-y-4">
              {dimGroups.map((group) => {
                const matchCount = group.dims.filter((d) => d.match).length;
                return (
                  <div key={group.title} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${matchCount === group.dims.length ? "bg-green-50 text-green-700" : matchCount >= group.dims.length / 2 ? "bg-primary/10 text-primary" : "bg-muted-bg text-muted"}`}>
                        {matchCount}/{group.dims.length}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {group.dims.map((dim) => (
                        <div key={dim.label} className="flex items-center gap-3">
                          {dim.match
                            ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                            : <XCircle size={15} className="text-muted/50 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted font-medium">{dim.label}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-foreground font-medium truncate">Tu: {dim.userVal}</span>
                              <span className="text-muted">{"vs"}</span>
                              <span className="text-foreground/70 truncate">{dim.hostVal}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Room info ─────────────────────────────────────────── */}
        <section className="mb-6 bg-card border border-border rounded-2xl p-5">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">Su espacio</h2>
          <h3 className="font-serif text-lg font-bold text-foreground mb-1">{listing.title}</h3>
          <p className="text-sm text-muted mb-4">{listing.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-foreground">${listing.price}<span className="text-sm font-normal text-muted">/mes</span></p>
              <p className="text-xs text-primary font-medium">Compartiendo: ~${savings}/mes (ahorro 50%)</p>
            </div>
            {!listing.available && (
              <span className="text-xs font-medium bg-muted-bg text-muted px-3 py-1.5 rounded-full">No disponible</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {listing.amenities.map((a) => (
              <span key={a} className="flex items-center gap-1 text-xs bg-secondary text-foreground/70 px-3 py-1.5 rounded-full border border-border">
                {a === "WiFi" && <Wifi size={11} />}
                {a}
              </span>
            ))}
          </div>
        </section>

        {/* ── Reviews mock ──────────────────────────────────────── */}
        <section className="mb-6 bg-card border border-border rounded-2xl p-5">
          <h2 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-muted mb-4">
            <ShieldCheck size={14} />
            {"Resenas de roommates anteriores"}
          </h2>
          <div className="space-y-4">
            {[
              { name: "Carlos M.", text: "Excelente roommate. Muy respetuoso con los espacios y siempre puntual con los pagos. 100% recomendado.", stars: 5 },
              { name: "Laura P.", text: "Vivimos 6 meses juntos. Buena comunicacion y casa siempre limpia. Nos llevamos muy bien.", stars: 4 },
            ].map((review) => (
              <div key={review.name} className="border-b border-border/50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{review.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} size={11} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted">{review.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Buscar cuarto juntos (Flujo 2) ────────────────────── */}
        <section className="mb-6 bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
              <Search size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-base font-bold text-foreground mb-1">
                {"Ya conectaron? Busquen cuarto juntos."}
              </h2>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                {"Si ya decidieron ser roommates, les mostramos cuartos dentro del presupuesto combinado de los dos."}
              </p>
              <Link
                href={`/buscar-juntos/${id}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
              >
                <Search size={15} />
                Buscar cuarto juntos
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────── */}
        <div className="bg-secondary border border-border rounded-2xl p-6 text-center">
          <h2 className="font-serif text-xl font-bold text-foreground mb-2">{"Te interesa este match?"}</h2>
          <p className="text-sm text-muted mb-4">{"Chatea con " + listing.host.split(" ")[0] + ", proponle un roommate date, y ve si hay buena vibra."}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/match/${id}/chat`}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-primary-sm"
            >
              <MessageCircle size={16} />
              Iniciar chat
              <ChevronRight size={14} />
            </Link>
            <Link
              href={`/match/${id}/date`}
              className="inline-flex items-center justify-center gap-2 bg-card hover:bg-muted-bg text-foreground font-semibold px-6 py-3 rounded-full transition-colors border border-border"
            >
              <Heart size={16} />
              Roommate date
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
