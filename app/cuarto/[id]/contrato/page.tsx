"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle2, FileText, Shield,
  User, Home, Calendar, DollarSign, AlertCircle,
  PenLine, BadgeCheck, Download, Share2, Sparkles, ChevronRight,
} from "lucide-react";
import { mockListings } from "@/lib/listings";
import { mockRoommates } from "@/lib/mock-roommates";
import { getPrefs } from "@/lib/match-prefs";

/* ── Types ────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4 | 5;

type Party = {
  name: string;
  role: "Arrendador" | "Inquilino 1" | "Inquilino 2";
  initials: string;
  color: string;
  signed: boolean;
};

/* ── Habit-based clauses ─────────────────────────────────────────── */
function buildConvivenciaClauses(listingId: number): string[] {
  const listing = mockListings.find((l) => l.id === listingId);
  if (!listing) return [];

  const clauses: string[] = [];

  if (listing.hostSmoking === "no") {
    clauses.push("Queda estrictamente prohibido fumar dentro del inmueble o en areas comunes.");
  } else if (listing.hostSmoking === "afuera") {
    clauses.push("Fumar solo esta permitido en areas exteriores designadas, no dentro del inmueble.");
  }

  if (listing.hostPets === "no") {
    clauses.push("No se permite la tenencia de mascotas de ningun tipo dentro del inmueble.");
  } else if (listing.hostPets === "si-pequena") {
    clauses.push("Se permite una mascota de tamano pequeno (menos de 10kg). El inquilino responde por danos causados.");
  } else if (listing.hostPets === "acepta") {
    clauses.push("Se permite la tenencia de mascotas, previo aviso al arrendador y previa aprobacion del tipo de animal.");
  }

  if (listing.hostNoise === "muy-tranquilo") {
    clauses.push("El inmueble es zona de silencio. Se prohibe musica alta, fiestas o ruidos molestos en cualquier horario.");
  } else {
    clauses.push("Los inquilinos deben mantener niveles de ruido razonables entre las 10pm y las 8am.");
  }

  if (listing.hostVisits === "casi-nunca" || listing.hostOvernightGuests === "no") {
    clauses.push("Las visitas de terceros deben ser esporadicas y no exceder las 11pm. No se permiten invitados a dormir sin previa autorizacion.");
  } else {
    clauses.push("Se permite recibir visitas con aviso previo al roommate. Los invitados a dormir no pueden superar 3 noches consecutivas.");
  }

  if (listing.hostCleanliness === "muy-ordenado") {
    clauses.push("Los inquilinos deben mantener las areas comunes en optimas condiciones de limpieza en todo momento. Se establece un horario de limpieza compartida semanal.");
  } else {
    clauses.push("Los inquilinos son responsables de mantener el orden en areas comunes. Se realizara limpieza profunda al menos una vez al mes.");
  }

  if (listing.hostKitchenUse !== "raramente") {
    clauses.push("El uso de la cocina es compartido. Cada inquilino es responsable de lavar y guardar sus utensilios el mismo dia de uso.");
  }

  return clauses;
}

/* ── Step indicator ─────────────────────────────────────────────── */
const STEPS = [
  { label: "Partes", icon: User },
  { label: "Condiciones", icon: FileText },
  { label: "Revision", icon: CheckCircle2 },
  { label: "Firma", icon: PenLine },
  { label: "Confirmacion", icon: Sparkles },
];

function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const n = (i + 1) as Step;
        const done = n < current;
        const active = n === current;
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-muted-bg border border-border text-muted"
              }`}>
                {done ? <CheckCircle2 size={15} /> : <Icon size={15} />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? "text-primary" : done ? "text-green-600" : "text-muted"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 transition-colors duration-500 ${done ? "bg-green-400" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────── */
export default function ContratoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = Number(params.id);
  const roommateId = searchParams.get("roommate") ? Number(searchParams.get("roommate")) : null;

  const listing = mockListings.find((l) => l.id === listingId);
  const roommate = roommateId ? mockRoommates.find((r) => r.id === roommateId) : null;
  const prefs = typeof window !== "undefined" ? getPrefs() : null;

  const [step, setStep] = useState<Step>(1);
  const [checkedClauses, setCheckedClauses] = useState<Record<string, boolean>>({});
  const [checkedTerms, setCheckedTerms] = useState({ tenant1: false, tenant2: false, read: false });
  const [signature, setSignature] = useState("");
  const [coSignature, setCoSignature] = useState("");
  const [signedAt, setSignedAt] = useState<string | null>(null);

  const perPerson = listing ? Math.round(listing.price / 2) : 0;
  const deposit = listing ? listing.price * 2 : 0;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  const formatDate = (d: Date) => d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  const convivenciaClauses = useMemo(() => buildConvivenciaClauses(listingId), [listingId]);

  const parties: Party[] = [
    {
      name: listing?.host ?? "Arrendador",
      role: "Arrendador",
      initials: listing?.hostInitials ?? "?",
      color: listing?.hostColor ?? "#999",
      signed: step >= 4,
    },
    {
      name: prefs ? "Tu (Inquilino)" : "Inquilino 1",
      role: "Inquilino 1",
      initials: "TU",
      color: "#e07030",
      signed: step === 5 && !!signature,
    },
    ...(roommate ? [{
      name: roommate.name,
      role: "Inquilino 2" as const,
      initials: roommate.initials,
      color: roommate.color,
      signed: step === 5 && !!coSignature,
    }] : []),
  ];

  const allClausesChecked =
    checkedClauses["renta"] &&
    checkedClauses["deposito"] &&
    checkedClauses["duracion"] &&
    convivenciaClauses.every((_, i) => checkedClauses[`conv_${i}`]);

  const allTermsChecked = checkedTerms.tenant1 && checkedTerms.read &&
    (!roommate || checkedTerms.tenant2);

  const canSign = signature.trim().length >= 3 && (!roommate || coSignature.trim().length >= 3);

  function handleSign() {
    if (!canSign) return;
    setSignedAt(new Date().toLocaleString("es-ES"));
    setStep(5);
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <Home size={48} className="text-muted mx-auto mb-4" />
          <p className="font-serif text-xl font-bold text-foreground mb-2">Cuarto no encontrado</p>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium text-sm">Volver</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link
            href={`/cuarto/${listingId}`}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Cuarto
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            <Shield size={12} />
            Contrato seguro
          </div>
          <Link href="/" className="font-serif text-lg font-bold text-primary tracking-tight">nidoo</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">
            Contrato de arrendamiento
          </h1>
          <p className="text-sm text-muted">
            {listing.title} · {listing.neighborhood}, {listing.city}
          </p>
        </div>

        <StepBar current={step} />

        {/* ── PASO 1: Partes ───────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-slide-in-right">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-foreground mb-5">
                Partes del contrato
              </h2>
              <div className="space-y-4">
                {parties.map((p) => (
                  <div key={p.role} className="flex items-center gap-4 p-4 bg-muted-bg rounded-xl">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted">{p.role}</p>
                    </div>
                    {listing.verified && p.role === "Arrendador" && (
                      <BadgeCheck size={18} className="text-primary shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cuarto resumen */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-foreground mb-4">Inmueble</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Direccion</span>
                  <span className="font-medium text-foreground text-right">{listing.neighborhood}, {listing.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Tipo</span>
                  <span className="font-medium text-foreground">{listing.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Amenidades</span>
                  <span className="font-medium text-foreground text-right">{listing.amenities.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Fechas y pagos */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-foreground mb-4">Condiciones economicas</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted flex items-center gap-1.5"><Calendar size={13} /> Inicio</span>
                  <span className="font-medium text-foreground">{formatDate(startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted flex items-center gap-1.5"><Calendar size={13} /> Fin</span>
                  <span className="font-medium text-foreground">{formatDate(endDate)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-muted flex items-center gap-1.5"><DollarSign size={13} /> Renta mensual total</span>
                  <span className="font-bold text-foreground">${listing.price}</span>
                </div>
                {roommate && (
                  <div className="flex justify-between">
                    <span className="text-muted">Por persona</span>
                    <span className="font-bold text-primary">${perPerson} c/u</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Deposito de garantia</span>
                  <span className="font-bold text-foreground">${deposit}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-3.5 rounded-full transition-colors"
            >
              Continuar a condiciones
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── PASO 2: Condiciones ──────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-slide-in-right">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-foreground mb-2">
                Clausulas principales
              </h2>
              <p className="text-xs text-muted mb-5">
                En lenguaje simple, sin jerga juridica. Marca cada clausula al leerla.
              </p>

              <div className="space-y-3">
                {/* Clausula renta */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${checkedClauses["renta"] ? "bg-green-50/50 border-green-200" : "bg-muted-bg border-border hover:bg-secondary"}`}>
                  <input type="checkbox" className="mt-0.5 accent-primary shrink-0"
                    checked={!!checkedClauses["renta"]}
                    onChange={(e) => setCheckedClauses(p => ({ ...p, renta: e.target.checked }))} />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">Pago de renta</p>
                    <p className="text-xs text-muted leading-relaxed">
                      La renta de ${listing.price}/mes se paga antes del dia 5 de cada mes.
                      {roommate && ` Cada inquilino paga $${perPerson} por su parte. Los pagos tardios generan un recargo del 5%.`}
                      {!roommate && " El pago tardio genera un recargo del 5%."}
                    </p>
                  </div>
                </label>

                {/* Clausula deposito */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${checkedClauses["deposito"] ? "bg-green-50/50 border-green-200" : "bg-muted-bg border-border hover:bg-secondary"}`}>
                  <input type="checkbox" className="mt-0.5 accent-primary shrink-0"
                    checked={!!checkedClauses["deposito"]}
                    onChange={(e) => setCheckedClauses(p => ({ ...p, deposito: e.target.checked }))} />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">Deposito de garantia</p>
                    <p className="text-xs text-muted leading-relaxed">
                      Se entrega un deposito de ${deposit} al inicio del contrato. Se devuelve integro al finalizar si el inmueble esta en las mismas condiciones.
                    </p>
                  </div>
                </label>

                {/* Clausula duracion */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${checkedClauses["duracion"] ? "bg-green-50/50 border-green-200" : "bg-muted-bg border-border hover:bg-secondary"}`}>
                  <input type="checkbox" className="mt-0.5 accent-primary shrink-0"
                    checked={!!checkedClauses["duracion"]}
                    onChange={(e) => setCheckedClauses(p => ({ ...p, duracion: e.target.checked }))} />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">Duracion y salida</p>
                    <p className="text-xs text-muted leading-relaxed">
                      Contrato por 12 meses ({formatDate(startDate)} a {formatDate(endDate)}). Para salir anticipadamente se requiere aviso con 30 dias de anticipacion.
                    </p>
                  </div>
                </label>

                {/* Clausulas de convivencia generadas desde habitos */}
                {convivenciaClauses.map((clause, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${checkedClauses[`conv_${i}`] ? "bg-green-50/50 border-green-200" : "bg-muted-bg border-border hover:bg-secondary"}`}
                  >
                    <input type="checkbox" className="mt-0.5 accent-primary shrink-0"
                      checked={!!checkedClauses[`conv_${i}`]}
                      onChange={(e) => setCheckedClauses(p => ({ ...p, [`conv_${i}`]: e.target.checked }))} />
                    <div>
                      <p className="text-xs font-semibold text-muted mb-0.5 uppercase tracking-wide">Convivencia</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{clause}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {!allClausesChecked && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="shrink-0" />
                Debes leer y marcar todas las clausulas para continuar.
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground border border-border px-4 py-3 rounded-full transition-colors">
                <ArrowLeft size={15} /> Atras
              </button>
              <button
                onClick={() => allClausesChecked && setStep(3)}
                disabled={!allClausesChecked}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-full transition-colors"
              >
                Continuar a revision <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: Revision ─────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-slide-in-right">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-foreground mb-2">
                Revision final
              </h2>
              <p className="text-xs text-muted mb-5">
                Confirma que todas las partes han leido y aceptan el contrato.
              </p>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${checkedTerms.read ? "bg-green-50/50 border-green-200" : "bg-muted-bg border-border"}`}>
                  <input type="checkbox" className="mt-0.5 accent-primary shrink-0"
                    checked={checkedTerms.read}
                    onChange={(e) => setCheckedTerms(p => ({ ...p, read: e.target.checked }))} />
                  <p className="text-sm text-foreground leading-relaxed">
                    Declaro haber leido y comprendido todas las clausulas de este contrato.
                  </p>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${checkedTerms.tenant1 ? "bg-green-50/50 border-green-200" : "bg-muted-bg border-border"}`}>
                  <input type="checkbox" className="mt-0.5 accent-primary shrink-0"
                    checked={checkedTerms.tenant1}
                    onChange={(e) => setCheckedTerms(p => ({ ...p, tenant1: e.target.checked }))} />
                  <p className="text-sm text-foreground leading-relaxed">
                    Acepto las condiciones del arrendador y me comprometo a cumplirlas durante la vigencia del contrato.
                  </p>
                </label>

                {roommate && (
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${checkedTerms.tenant2 ? "bg-green-50/50 border-green-200" : "bg-muted-bg border-border"}`}>
                    <input type="checkbox" className="mt-0.5 accent-primary shrink-0"
                      checked={checkedTerms.tenant2}
                      onChange={(e) => setCheckedTerms(p => ({ ...p, tenant2: e.target.checked }))} />
                    <p className="text-sm text-foreground leading-relaxed">
                      Confirmo que <strong>{roommate.name}</strong> ha sido notificado del contrato y esta de acuerdo con las condiciones.
                    </p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-muted-bg border border-border rounded-xl p-4 flex items-start gap-3">
              <Shield size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted leading-relaxed">
                Al firmar, el contrato queda registrado en Nidoo con timestamp certificado. Ambas partes reciben una copia al correo electronico. Nidoo actua como custodio neutral del contrato.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground border border-border px-4 py-3 rounded-full transition-colors">
                <ArrowLeft size={15} /> Atras
              </button>
              <button
                onClick={() => allTermsChecked && setStep(4)}
                disabled={!allTermsChecked}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-full transition-colors"
              >
                Ir a firma <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 4: Firma ────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5 animate-slide-in-right">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-foreground mb-2">Firma digital</h2>
              <p className="text-xs text-muted mb-6">
                Escribe tu nombre completo como firma. El timestamp y hash del documento quedan registrados automaticamente.
              </p>

              {/* El arrendador ya firmo */}
              <div className="mb-6 p-4 bg-green-50/60 border border-green-200 rounded-xl flex items-center gap-3">
                <BadgeCheck size={20} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">{listing.host} ha firmado</p>
                  <p className="text-xs text-green-600">Arrendador · Firma registrada</p>
                </div>
              </div>

              {/* Firma inquilino 1 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Tu firma (Inquilino 1)
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Escribe tu nombre completo"
                  className="w-full border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 font-serif text-lg italic"
                />
                {signature.length > 0 && signature.length < 3 && (
                  <p className="text-xs text-red-500 mt-1">Escribe al menos 3 caracteres</p>
                )}
              </div>

              {/* Firma inquilino 2 */}
              {roommate && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Firma de {roommate.name} (Inquilino 2)
                  </label>
                  <input
                    type="text"
                    value={coSignature}
                    onChange={(e) => setCoSignature(e.target.value)}
                    placeholder={`Nombre completo de ${roommate.name}`}
                    className="w-full border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 font-serif text-lg italic"
                  />
                </div>
              )}

              <div className="border-t border-border pt-4 mt-4 text-xs text-muted space-y-1">
                <p>Fecha: {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p>ID de documento: NDO-{listingId}-{Date.now().toString().slice(-8)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground border border-border px-4 py-3 rounded-full transition-colors">
                <ArrowLeft size={15} /> Atras
              </button>
              <button
                onClick={handleSign}
                disabled={!canSign}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-full transition-colors"
              >
                <PenLine size={18} />
                Firmar contrato
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 5: Confirmacion ─────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-6 animate-slide-in-right">
            {/* Celebracion */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                Contrato firmado
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                El contrato ha sido registrado y todas las partes recibiaran una copia por correo electronico.
              </p>
              {signedAt && (
                <p className="text-xs text-muted bg-muted-bg border border-border rounded-lg px-3 py-2 inline-block">
                  Firmado el {signedAt}
                </p>
              )}
            </div>

            {/* Resumen del acuerdo */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-serif text-base font-bold text-foreground mb-4">Resumen del acuerdo</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Inmueble</span>
                  <span className="font-medium text-foreground text-right">{listing.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Arrendador</span>
                  <span className="font-medium text-foreground">{listing.host}</span>
                </div>
                {roommate && (
                  <div className="flex justify-between">
                    <span className="text-muted">Roommate</span>
                    <span className="font-medium text-foreground">{roommate.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Renta por persona</span>
                  <span className="font-bold text-primary">${roommate ? perPerson : listing.price}/mes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Inicio</span>
                  <span className="font-medium text-foreground">{formatDate(startDate)}</span>
                </div>
              </div>
            </div>

            {/* Proximos pasos */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Proximos pasos</h3>
              <ul className="space-y-2.5">
                {[
                  "El arrendador te contactara para coordinar la entrega de llaves",
                  `Prepara el deposito de $${deposit} para el dia de entrada`,
                  "Revisa tu correo: recibiras el contrato en PDF en los proximos minutos",
                  "Descarga la app de Nidoo para gestionar pagos mensuales",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-muted-bg text-foreground border border-border font-semibold px-5 py-3 rounded-full transition-colors">
                <Download size={16} />
                Descargar PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-muted-bg text-foreground border border-border font-semibold px-5 py-3 rounded-full transition-colors">
                <Share2 size={16} />
                Compartir contrato
              </button>
            </div>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-3.5 rounded-full transition-colors"
            >
              Volver al inicio
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
