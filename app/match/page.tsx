"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sun, Moon, Coffee, Briefcase,
  Volume2, VolumeX, Users, Music,
  Dog, Ban, Cigarette,
  Sparkles, Wind, CheckCircle2,
  ArrowRight, ArrowLeft, ChevronRight,
  GraduationCap, UserCheck, Heart,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Step1 = {
  schedule: string;
  noise: string;
  visits: string;
};

type Step2 = {
  pets: string;
  smoking: string;
  cleanliness: string;
};

type Step3 = {
  budget: number;
  city: string;
  roommateGender: string;
  occupation: string;
};

type Prefs = Step1 & Step2 & Step3;

// ── Option definitions ────────────────────────────────────────────────────────
const scheduleOptions = [
  { id: "manana",      Icon: Sun,       label: "Madrugador/a",  desc: "Antes de las 7am ya estoy activo/a" },
  { id: "noche",       Icon: Moon,      label: "Nocturno/a",    desc: "Soy mas productivo/a de noche" },
  { id: "flexible",    Icon: Wind,      label: "Flexible",      desc: "Vivo sin horario fijo" },
  { id: "home-office", Icon: Coffee,    label: "Home office",   desc: "Trabajo desde casa todo el dia" },
];

const noiseOptions = [
  { id: "muy-tranquilo", Icon: VolumeX,  label: "Muy tranquilo/a", desc: "Silencio total, por favor" },
  { id: "normal",        Icon: Volume2,  label: "Normal",           desc: "Algo de ruido no molesta" },
  { id: "social",        Icon: Music,    label: "Social",            desc: "Me gusta el ambiente animado" },
];

const visitsOptions = [
  { id: "casi-nunca",     Icon: CheckCircle2, label: "Casi nunca",     desc: "Prefiero mucha privacidad" },
  { id: "a-veces",        Icon: Users,        label: "A veces",         desc: "Visitas ocasionales ok" },
  { id: "seguido",        Icon: Users,        label: "Seguido",          desc: "Mis amigos son de la casa" },
  { id: "pareja-estable", Icon: Heart,        label: "Pareja estable",  desc: "Mi pareja visita regularmente" },
];

const petsOptions = [
  { id: "no",         Icon: Ban,  label: "Sin mascotas",      desc: "Prefiero un hogar sin animales" },
  { id: "si-pequena", Icon: Dog,  label: "Tengo una pequeña", desc: "Gato o perro chico" },
  { id: "si-grande",  Icon: Dog,  label: "Tengo una grande",  desc: "Perro mediano o grande" },
  { id: "acepta",     Icon: Dog,  label: "Acepto mascotas",   desc: "Me encantan los animales" },
];

const smokingOptions = [
  { id: "no",     Icon: Ban,       label: "No fumo",        desc: "Ambiente libre de tabaco" },
  { id: "afuera", Icon: Wind,      label: "Solo afuera",    desc: "Fumo pero no en espacios comunes" },
  { id: "si",     Icon: Cigarette, label: "Fumo en casa",   desc: "Necesito poder fumar adentro" },
];

const cleanlinessOptions = [
  { id: "muy-ordenado", Icon: Sparkles,    label: "Muy ordenado/a", desc: "Un lugar para cada cosa" },
  { id: "normal",       Icon: CheckCircle2, label: "Normal",          desc: "Limpio pero no perfeccionista" },
  { id: "relajado",     Icon: Wind,        label: "Relajado/a",     desc: "Me tomo el orden con calma" },
];

const genderOptions = [
  { id: "sin-preferencia", Icon: Users,     label: "Sin preferencia" },
  { id: "mismo-genero",    Icon: UserCheck, label: "Mismo genero"    },
  { id: "cualquiera",      Icon: Heart,     label: "Cualquiera"      },
];

const occupationOptions = [
  { id: "sin-preferencia", Icon: Users,         label: "Sin preferencia" },
  { id: "estudiante",      Icon: GraduationCap, label: "Estudiante"      },
  { id: "profesional",     Icon: Briefcase,     label: "Profesional"     },
];

const cities = [
  "Guadalajara", "CDMX", "Monterrey",
  "Bogota", "Medellin",
  "Lima",
  "San Salvador",
];

// ── Sub-components ────────────────────────────────────────────────────────────
function OptionCard({
  id, Icon, label, desc, selected, onClick,
}: {
  id: string;
  Icon: React.ElementType;
  label: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-200 w-full
        ${selected
          ? "border-primary bg-primary/8 shadow-primary-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
        }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors
        ${selected ? "bg-primary text-white" : "bg-muted-bg text-muted"}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className={`font-semibold text-sm leading-tight ${selected ? "text-foreground" : "text-foreground/80"}`}>
          {label}
        </p>
        {desc && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
        )}
      </div>
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function SmallOptionCard({
  id, Icon, label, selected, onClick,
}: {
  id: string;
  Icon: React.ElementType;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
        ${selected
          ? "border-primary bg-primary/8 text-primary shadow-primary-sm"
          : "border-border bg-card hover:border-primary/40 text-foreground/70 hover:text-foreground"
        }`}
    >
      <Icon size={16} />
      {label}
      {selected && <CheckCircle2 size={14} className="ml-auto text-primary" strokeWidth={3} />}
    </button>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i < step ? "bg-primary" : "bg-border"
          } ${i === step - 1 ? "flex-[2]" : "flex-1"}`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const TOTAL_STEPS = 3;

const INITIAL_PREFS: Prefs = {
  schedule: "",
  noise: "",
  visits: "",
  pets: "",
  smoking: "",
  cleanliness: "",
  budget: 300,
  city: "",
  roommateGender: "",
  occupation: "",
};

export default function MatchQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<Prefs>(INITIAL_PREFS);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const step1Valid = !!prefs.schedule && !!prefs.noise && !!prefs.visits;
  const step2Valid = !!prefs.pets && !!prefs.smoking && !!prefs.cleanliness;
  const step3Valid = !!prefs.city && !!prefs.roommateGender && !!prefs.occupation;

  const canNext = step === 1 ? step1Valid : step === 2 ? step2Valid : step3Valid;

  function goNext() {
    if (!canNext) return;
    if (step < TOTAL_STEPS) {
      setDirection("forward");
      setStep((s) => s + 1);
    } else {
      const params = new URLSearchParams({
        schedule: prefs.schedule,
        noise: prefs.noise,
        visits: prefs.visits,
        pets: prefs.pets,
        smoking: prefs.smoking,
        cleanliness: prefs.cleanliness,
        budget: String(prefs.budget),
        city: prefs.city,
        roommateGender: prefs.roommateGender,
        occupation: prefs.occupation,
      });
      router.push(`/match/resultados?${params.toString()}`);
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection("back");
      setStep((s) => s - 1);
    }
  }

  const stepLabels = ["Tu ritmo de vida", "Tus habitos", "Tu roommate ideal"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-primary tracking-tight">
            nidoo
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted font-medium hidden sm:block">
              Paso {step} de {TOTAL_STEPS} — {stepLabels[step - 1]}
            </span>
            <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
              Salir
            </Link>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-3">
          <ProgressBar step={step} total={TOTAL_STEPS} />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-10">

        {/* ── Step 1: Ritmo de vida ─────────────────────────────────────────── */}
        {step === 1 && (
          <div key="step1" className="animate-scale-in">
            <div className="mb-8">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary block mb-2">
                Paso 1 de 3
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-3">
                {"Cuentanos tu ritmo de vida"}
              </h1>
              <p className="text-muted leading-relaxed">
                {"Estas respuestas nos ayudan a encontrar personas con las que realmente puedas convivir."}
              </p>
            </div>

            {/* Schedule */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">
                Tu horario en casa
              </h2>
              <p className="text-sm text-muted mb-4">{"Cuando sueles estar mas activo/a"}</p>
              <div className="grid grid-cols-2 gap-3">
                {scheduleOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.schedule === o.id}
                    onClick={() => set("schedule", o.id)}
                  />
                ))}
              </div>
            </div>

            {/* Noise */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Ruido y ambiente</h2>
              <p className="text-sm text-muted mb-4">{"Que tan activo prefieres el ambiente en casa"}</p>
              <div className="grid grid-cols-3 gap-3">
                {noiseOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.noise === o.id}
                    onClick={() => set("noise", o.id)}
                  />
                ))}
              </div>
            </div>

            {/* Visits */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Visitas en casa</h2>
              <p className="text-sm text-muted mb-4">{"Con que frecuencia recibes visitas"}</p>
              <div className="grid grid-cols-2 gap-3">
                {visitsOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.visits === o.id}
                    onClick={() => set("visits", o.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Habitos ───────────────────────────────────────────────── */}
        {step === 2 && (
          <div key="step2" className="animate-scale-in">
            <div className="mb-8">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary block mb-2">
                Paso 2 de 3
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-3">
                {"Tus habitos del dia a dia"}
              </h1>
              <p className="text-muted leading-relaxed">
                {"Sin juicios. Solo queremos asegurarnos de que los habitos de tu roommate sean compatibles con los tuyos."}
              </p>
            </div>

            {/* Pets */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Mascotas</h2>
              <p className="text-sm text-muted mb-4">{"Tu relacion con los animales"}</p>
              <div className="grid grid-cols-2 gap-3">
                {petsOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.pets === o.id}
                    onClick={() => set("pets", o.id)}
                  />
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Tabaco</h2>
              <p className="text-sm text-muted mb-4">{"Tu relacion con el cigarro"}</p>
              <div className="grid grid-cols-3 gap-3">
                {smokingOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.smoking === o.id}
                    onClick={() => set("smoking", o.id)}
                  />
                ))}
              </div>
            </div>

            {/* Cleanliness */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Orden y limpieza</h2>
              <p className="text-sm text-muted mb-4">{"Tu nivel de orden en espacios compartidos"}</p>
              <div className="grid grid-cols-3 gap-3">
                {cleanlinessOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.cleanliness === o.id}
                    onClick={() => set("cleanliness", o.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Roommate ideal ────────────────────────────────────────── */}
        {step === 3 && (
          <div key="step3" className="animate-scale-in">
            <div className="mb-8">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary block mb-2">
                Paso 3 de 3
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-3">
                {"Cuantame de tu roommate ideal"}
              </h1>
              <p className="text-muted leading-relaxed">
                {"Un poco mas de contexto para afinar los resultados."}
              </p>
            </div>

            {/* Budget */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-foreground">Presupuesto maximo / mes</h2>
                <span className="text-lg font-bold text-primary">${prefs.budget} USD</span>
              </div>
              <p className="text-sm text-muted mb-5">
                {"El costo TOTAL de la renta que puedes pagar (ya dividida entre roommates)"}
              </p>
              <input
                type="range"
                min={80}
                max={600}
                step={10}
                value={prefs.budget}
                onChange={(e) => set("budget", Number(e.target.value))}
                className="custom-slider w-full"
              />
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>$80 USD</span>
                <span>$600 USD</span>
              </div>
            </div>

            {/* City */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Ciudad</h2>
              <p className="text-sm text-muted mb-4">{"Donde quieres vivir"}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cities.map((city) => (
                  <SmallOptionCard
                    key={city}
                    id={city}
                    Icon={ChevronRight}
                    label={city}
                    selected={prefs.city === city}
                    onClick={() => set("city", city)}
                  />
                ))}
              </div>
            </div>

            {/* Roommate gender */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Genero del roommate</h2>
              <p className="text-sm text-muted mb-4">{"Tu preferencia (puedes no tener ninguna)"}</p>
              <div className="flex flex-wrap gap-2">
                {genderOptions.map((o) => (
                  <SmallOptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.roommateGender === o.id}
                    onClick={() => set("roommateGender", o.id)}
                  />
                ))}
              </div>
            </div>

            {/* Occupation */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-1">Ocupacion preferida</h2>
              <p className="text-sm text-muted mb-4">{"El perfil de tu roommate ideal"}</p>
              <div className="flex flex-wrap gap-2">
                {occupationOptions.map((o) => (
                  <SmallOptionCard
                    key={o.id}
                    {...o}
                    selected={prefs.occupation === o.id}
                    onClick={() => set("occupation", o.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-card hover:bg-secondary transition-colors text-foreground/70 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Atras
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200
              ${canNext
                ? "bg-primary hover:bg-primary-hover text-white shadow-primary-md animate-glow"
                : "bg-muted-bg text-muted cursor-not-allowed"
              }`}
          >
            {step === TOTAL_STEPS ? "Ver mis matches" : "Siguiente"}
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
