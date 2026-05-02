"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft, MapPin, Star, BadgeCheck, Wifi, Thermometer,
  Users, DollarSign, Calendar, CheckCircle2, ChevronRight,
  Home, User, UserPlus, FileText, Shield, Zap,
} from "lucide-react";
import { mockListings } from "@/lib/listings";

const amenityIcons: Record<string, string> = {
  "WiFi": "📶",
  "Agua caliente": "🚿",
  "Cocina compartida": "🍳",
  "Estacionamiento": "🚗",
  "Aire acondicionado": "❄️",
  "Lavandería": "👕",
  "Jardín": "🌿",
  "Comidas incluidas": "🍽️",
  "Baño privado": "🚿",
  "Piscina": "🏊",
  "Gimnasio": "💪",
};

const habitLabels: Record<string, Record<string, string>> = {
  hostSchedule: { manana: "Madrugador/a", noche: "Nocturno/a", flexible: "Horario flexible", "home-office": "Home office" },
  hostNoise: { "muy-tranquilo": "Silencio total", normal: "Ambiente normal", social: "Casa animada" },
  hostCleanliness: { "muy-ordenado": "Muy ordenado/a", normal: "Orden normal", relajado: "Relajado/a" },
  hostPersonality: { introvertido: "Introvertido/a", ambivertido: "Ambivertido/a", extrovertido: "Extrovertido/a" },
  hostCohabitation: { "independencia-total": "Independencia total", cordial: "Trato cordial", convivir: "Le gusta convivir" },
  hostSmoking: { no: "No fuma", afuera: "Solo afuera", si: "Fuma" },
  hostPets: { no: "Sin mascotas", "si-pequena": "Mascota pequeña", "si-grande": "Mascota grande", acepta: "Acepta mascotas" },
  hostKitchenUse: { raramente: "Cocina poco", "cocino-seguido": "Cocina seguido", "meal-prep": "Meal prep" },
  hostAlcohol: { no: "No toma", social: "Social", frecuente: "Frecuente" },
};

/* ── Flujo selector ────────────────────────────────────────────────── */
type FlowMode = "idle" | "tenant-only" | "with-roommate";

export default function CuartoDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const listing = mockListings.find((l) => l.id === id);
  const [flowMode, setFlowMode] = useState<FlowMode>("idle");

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <Home size={48} className="text-muted mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Cuarto no encontrado</h1>
          <Link href="/match/resultados" className="text-primary hover:text-primary-hover font-medium">
            Ver resultados
          </Link>
        </div>
      </div>
    );
  }

  const perPersonPrice = Math.round(listing.price / 2);
  const savings = listing.price - perPersonPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-4">
          <Link
            href="/match/resultados"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Resultados
          </Link>
          <div className="flex-1" />
          <Link href="/" className="font-serif text-lg font-bold text-primary tracking-tight">
            nidoo
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-6">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Image placeholder */}
          <div
            className="h-52 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${listing.hostColor}22, ${listing.hostColor}44)` }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-primary-md"
              style={{ backgroundColor: listing.hostColor }}
            >
              {listing.hostInitials}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-1">{listing.title}</h1>
                <p className="flex items-center gap-1.5 text-muted text-sm">
                  <MapPin size={13} />
                  {listing.neighborhood}, {listing.city}
                </p>
              </div>
              {listing.verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full shrink-0">
                  <BadgeCheck size={13} />
                  Verificado
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="flex items-center gap-1 text-foreground/70">
                <Star size={13} className="text-yellow-500 fill-yellow-500" />
                {listing.rating} ({listing.reviews} reseñas)
              </span>
              <span className="flex items-center gap-1 text-foreground/70">
                <Users size={13} />
                {listing.environment}
              </span>
              {!listing.available && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  No disponible
                </span>
              )}
            </div>

            <p className="text-foreground/80 leading-relaxed text-sm mb-5">{listing.description}</p>

            {/* Precio */}
            <div className="bg-muted-bg rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted mb-1">Renta mensual completa</p>
                  <p className="text-2xl font-black text-foreground">${listing.price}<span className="text-base font-normal text-muted">/mes</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted mb-1">Con roommate pagas</p>
                  <p className="text-2xl font-black text-primary">${perPersonPrice}<span className="text-base font-normal text-muted">/mes</span></p>
                  <p className="text-xs text-green-600 font-semibold">Ahorras ${savings}/mes</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-5">
              {listing.amenities.map((a) => (
                <span key={a} className="flex items-center gap-1 text-xs font-medium text-foreground/70 bg-secondary border border-border px-2.5 py-1.5 rounded-full">
                  <span>{amenityIcons[a] ?? "•"}</span>
                  {a}
                </span>
              ))}
            </div>

            {/* Perfil del arrendador */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">Arrendador</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: listing.hostColor }}
                >
                  {listing.hostInitials}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{listing.host}</p>
                  <p className="text-xs text-muted">{listing.neighborhood} · {habitLabels.hostSchedule[listing.hostSchedule]}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Habitos del arrendador ───────────────────────────────── */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4">Como es vivir aqui</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { field: "hostSchedule", val: listing.hostSchedule, icon: "🕐" },
              { field: "hostNoise", val: listing.hostNoise, icon: "🔊" },
              { field: "hostCleanliness", val: listing.hostCleanliness, icon: "🧹" },
              { field: "hostSmoking", val: listing.hostSmoking, icon: "🚬" },
              { field: "hostPets", val: listing.hostPets, icon: "🐾" },
              { field: "hostKitchenUse", val: listing.hostKitchenUse, icon: "🍳" },
              { field: "hostAlcohol", val: listing.hostAlcohol, icon: "🍺" },
              { field: "hostPersonality", val: listing.hostPersonality, icon: "🧠" },
              { field: "hostCohabitation", val: listing.hostCohabitation, icon: "🏠" },
            ].map(({ field, val, icon }) => (
              <div key={field} className="bg-secondary rounded-xl px-3 py-2.5 flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-medium text-foreground/80">
                  {habitLabels[field]?.[val] ?? val}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Flujo selector ──────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-lg font-bold text-foreground mb-1">
              {"Como quieres rentar este cuarto?"}
            </h2>
            <p className="text-sm text-muted">
              {"Elige tu flujo segun tu situacion actual."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* Opcion 1: Inquilino solo */}
            <button
              onClick={() => setFlowMode(flowMode === "tenant-only" ? "idle" : "tenant-only")}
              className={`text-left p-6 transition-colors ${flowMode === "tenant-only" ? "bg-primary/5" : "hover:bg-muted-bg"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${flowMode === "tenant-only" ? "bg-primary text-white" : "bg-secondary text-foreground/70"}`}>
                <User size={20} />
              </div>
              <p className="font-bold text-foreground mb-1">Ya tengo roommate</p>
              <p className="text-sm text-muted leading-relaxed">
                {"Mi roommate ya esta definido. Quiero rentar este cuarto juntos y firmar el contrato."}
              </p>
              {flowMode === "tenant-only" && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Seleccionado <CheckCircle2 size={12} />
                </span>
              )}
            </button>

            {/* Opcion 2: Buscar roommate */}
            <button
              onClick={() => setFlowMode(flowMode === "with-roommate" ? "idle" : "with-roommate")}
              className={`text-left p-6 transition-colors ${flowMode === "with-roommate" ? "bg-primary/5" : "hover:bg-muted-bg"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${flowMode === "with-roommate" ? "bg-primary text-white" : "bg-secondary text-foreground/70"}`}>
                <UserPlus size={20} />
              </div>
              <p className="font-bold text-foreground mb-1">Necesito roommate</p>
              <p className="text-sm text-muted leading-relaxed">
                {"Me gusta el cuarto pero necesito encontrar un roommate compatible para poder rentarlo."}
              </p>
              {flowMode === "with-roommate" && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Seleccionado <CheckCircle2 size={12} />
                </span>
              )}
            </button>
          </div>

          {/* CTAs segun flujo */}
          {flowMode !== "idle" && (
            <div className="p-6 border-t border-border bg-muted-bg/50">
              {flowMode === "tenant-only" && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground/80 flex items-center gap-2">
                    <Shield size={15} className="text-primary shrink-0" />
                    {"Firmaras un contrato digital con el arrendador. Ambas partes reciben una copia."}
                  </p>
                  <Link
                    href={`/cuarto/${id}/contrato`}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-3.5 rounded-full transition-colors"
                  >
                    <FileText size={18} />
                    Iniciar firma de contrato
                  </Link>
                </div>
              )}
              {flowMode === "with-roommate" && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground/80 flex items-center gap-2">
                    <Zap size={15} className="text-primary shrink-0" />
                    {"Te mostramos roommates compatibles con este cuarto y contigo."}
                  </p>
                  <Link
                    href={`/cuarto/${id}/buscar-roommate`}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-3.5 rounded-full transition-colors"
                  >
                    <UserPlus size={18} />
                    Buscar roommate compatible
                    <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Garantias ────────────────────────────────────────────── */}
        <section className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Contrato digital", desc: "Valido legalmente en toda LATAM" },
            { icon: CheckCircle2, title: "Arrendador verificado", desc: "Identidad y propiedad validadas" },
            { icon: Calendar, title: "Proceso en horas", desc: "Sin papeleo fisico ni filas" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}
