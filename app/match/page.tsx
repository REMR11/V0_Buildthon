"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sun, Moon, Coffee, Briefcase,
  Volume2, VolumeX, Music,
  Dog, Ban, Cigarette, Wine,
  Sparkles, Wind, CheckCircle2,
  ArrowRight, ArrowLeft, ChevronRight,
  GraduationCap, UserCheck, Heart,
  Home, Users, Thermometer, Clock,
  UtensilsCrossed, MessageSquare, ShieldAlert,
  Sofa, Laptop, MapPin,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Prefs = {
  // Paso 1 — Ritmo de vida
  schedule: string;
  daysHome: string;
  // Paso 2 — Convivencia diaria
  noise: string;
  kitchenUse: string;
  commonTemp: string;
  bathroomTime: string;
  // Paso 3 — Habitos
  pets: string;
  smoking: string;
  alcohol: string;
  cleanliness: string;
  visits: string;
  overnightGuests: string;
  // Paso 4 — Perfil social
  personality: string;
  conflictStyle: string;
  cohabitation: string;
  // Paso 5 — Busqueda
  budget: number;
  city: string;
  roommateGender: string;
  occupation: string;
};

const INITIAL_PREFS: Prefs = {
  schedule: "", daysHome: "",
  noise: "", kitchenUse: "", commonTemp: "", bathroomTime: "",
  pets: "", smoking: "", alcohol: "", cleanliness: "", visits: "", overnightGuests: "",
  personality: "", conflictStyle: "", cohabitation: "",
  budget: 300, city: "", roommateGender: "", occupation: "",
};

// ── Option data ───────────────────────────────────────────────────────────────
const scheduleOptions = [
  { id: "manana",      Icon: Sun,     label: "Madrugador/a",   desc: "Activo/a antes de las 7am, en cama antes de las 11pm" },
  { id: "noche",       Icon: Moon,    label: "Nocturno/a",     desc: "Me activo a partir del mediodia, duermo tarde" },
  { id: "flexible",    Icon: Wind,    label: "Flexible",       desc: "Mi horario cambia segun el dia" },
  { id: "home-office", Icon: Laptop,  label: "Home office",    desc: "Trabajo desde casa, estoy en el depa la mayor parte del dia" },
];

const daysHomeOptions = [
  { id: "pocos",        Icon: MapPin,  label: "Pocos dias",     desc: "Solo vengo a dormir, casi siempre estoy fuera" },
  { id: "mitad",        Icon: Home,    label: "La mitad",       desc: "Mitad del tiempo en casa, mitad afuera" },
  { id: "casi-siempre", Icon: Sofa,   label: "Casi siempre",   desc: "El depa es mi base de operaciones" },
];

const noiseOptions = [
  { id: "muy-tranquilo", Icon: VolumeX,  label: "Silencio total",   desc: "Musica y TV a volumen bajo o con audifonos siempre" },
  { id: "normal",        Icon: Volume2,  label: "Ambiente normal",   desc: "Algo de ruido no molesta, pero no extremos" },
  { id: "social",        Icon: Music,    label: "Casa animada",      desc: "Me gusta tener ambiente, musica, gente" },
];

const kitchenOptions = [
  { id: "raramente",     Icon: Ban,              label: "Casi no cocino",   desc: "Pido o como fuera, la cocina es solo para calentar cosas" },
  { id: "cocino-seguido", Icon: UtensilsCrossed, label: "Cocino seguido",   desc: "Preparo mis comidas casi todos los dias" },
  { id: "meal-prep",     Icon: UtensilsCrossed,  label: "Meal prep",        desc: "Cocino en cantidad los fines de semana para toda la semana" },
];

const tempOptions = [
  { id: "frio",     Icon: Thermometer, label: "Fresco / AC fuerte", desc: "Prefiero el ambiente frio, AC o ventilador siempre" },
  { id: "templado", Icon: Wind,        label: "Templado",            desc: "Ni muy frio ni muy caliente" },
  { id: "calido",   Icon: Sun,         label: "Calidito",            desc: "Prefiero el calor, nada de AC directo" },
];

const bathroomOptions = [
  { id: "rapido",  Icon: Clock, label: "Rapido (5-10 min)", desc: "Me ducho y salgo, sin rodeos" },
  { id: "normal",  Icon: Clock, label: "Normal (15-20 min)", desc: "Me tomo mi tiempo sin exagerar" },
  { id: "largo",   Icon: Clock, label: "Me tomo mi tiempo",  desc: "El bano es mi tiempo de relajacion" },
];

const petsOptions = [
  { id: "no",          Icon: Ban,  label: "Sin mascotas",       desc: "Prefiero un hogar sin animales" },
  { id: "si-pequena",  Icon: Dog,  label: "Tengo mascota chica", desc: "Gato o perro pequeno" },
  { id: "si-grande",   Icon: Dog,  label: "Tengo mascota grande", desc: "Perro mediano o grande" },
  { id: "acepta",      Icon: Dog,  label: "Me encantan los animales", desc: "Acepto cualquier mascota con gusto" },
];

const smokingOptions = [
  { id: "no",     Icon: Ban,       label: "No fumo",         desc: "Ambiente 100% libre de humo" },
  { id: "afuera", Icon: Wind,      label: "Solo afuera",     desc: "Fumo pero siempre en exterior" },
  { id: "si",     Icon: Cigarette, label: "Fumo en casa",    desc: "Necesito poder fumar en interiores" },
];

const alcoholOptions = [
  { id: "no",       Icon: Ban,   label: "No tomo",          desc: "Nunca o casi nunca alcohol" },
  { id: "social",   Icon: Wine,  label: "Socialmente",      desc: "Solo en salidas o reuniones, no en casa entre semana" },
  { id: "frecuente", Icon: Wine, label: "Con frecuencia",   desc: "Un par de cervezas en la noche es normal para mi" },
];

const cleanlinessOptions = [
  { id: "muy-ordenado", Icon: Sparkles,     label: "Muy ordenado/a",  desc: "Cada cosa en su lugar, limpio activamente y espero lo mismo" },
  { id: "normal",       Icon: CheckCircle2, label: "Normal",           desc: "Limpio cuando hace falta, no soy perfeccionista" },
  { id: "relajado",     Icon: Wind,         label: "Relajado/a",      desc: "Me tomo el orden con calma, no me estresa el desorden ocasional" },
];

const visitsOptions = [
  { id: "casi-nunca", Icon: Home,  label: "Casi nunca",    desc: "El depa es un espacio privado, rara vez traigo gente" },
  { id: "a-veces",    Icon: Users, label: "A veces",        desc: "Visitas ocasionales estan bien" },
  { id: "seguido",    Icon: Users, label: "Seguido",        desc: "Mis amigos vienen con frecuencia, es parte de mi vida social" },
];

const overnightOptions = [
  { id: "no",      Icon: Ban,     label: "No, prefiero no", desc: "Los invitados se van ese mismo dia" },
  { id: "a-veces", Icon: Heart,   label: "A veces si",      desc: "Puede pasar ocasionalmente, con aviso" },
  { id: "si",      Icon: Heart,   label: "Si, sin problema", desc: "Es algo que puede pasar regularmente" },
];

const personalityOptions = [
  { id: "introvertido",  Icon: Home,  label: "Introvertido/a",  desc: "Recargo energia en soledad, necesito mi espacio y silencio" },
  { id: "ambivertido",   Icon: Wind,  label: "Ambivertido/a",   desc: "Depende del dia: a veces quiero socializar, a veces no" },
  { id: "extrovertido",  Icon: Users, label: "Extrovertido/a",  desc: "Me energizo con la gente, me gusta convivir y platicar" },
];

const conflictOptions = [
  { id: "hablar-directo", Icon: MessageSquare, label: "Hablo directo",   desc: "Si hay problema, lo digo de frente y en el momento" },
  { id: "escrito",        Icon: MessageSquare, label: "Prefiero texto",   desc: "Me cuesta hablarlo en persona, prefiero mandar un mensaje" },
  { id: "evitar",         Icon: ShieldAlert,   label: "Evito conflictos", desc: "Prefiero dejar pasar las cosas si no son graves" },
];

const cohabitationOptions = [
  { id: "independencia-total", Icon: Home,  label: "Independencia total", desc: "Somos vecinos, cada quien vive su vida, minima interaccion" },
  { id: "cordial",             Icon: Wind,  label: "Cordial y respetuoso", desc: "Buenos dias, buen trato, sin necesidad de ser mejores amigos" },
  { id: "convivir",            Icon: Users, label: "Convivir y conectar",  desc: "Me gustaria hacer actividades juntos, salir, platicar" },
];

const genderOptions = [
  { id: "sin-preferencia", Icon: Users,     label: "Sin preferencia",    desc: "El genero no importa" },
  { id: "mismo-genero",    Icon: UserCheck, label: "Mismo genero",       desc: "Prefiero vivir con alguien de mi mismo genero" },
  { id: "cualquiera",      Icon: Heart,     label: "Cualquiera esta bien", desc: "Sin restriccion de genero" },
];

const occupationOptions = [
  { id: "sin-preferencia", Icon: Users,         label: "Sin preferencia", desc: "No importa la ocupacion" },
  { id: "estudiante",      Icon: GraduationCap, label: "Estudiante",      desc: "Prefiero vivir con alguien que estudie" },
  { id: "profesional",     Icon: Briefcase,     label: "Profesional",     desc: "Prefiero alguien que trabaje" },
];

const cities = [
  "Guadalajara", "CDMX", "Monterrey",
  "Bogota", "Medellin",
  "Lima",
  "San Salvador",
];

// ── Sub-components ────────────────────────────────────────────────────────────
function OptionCard({
  Icon, label, desc, selected, onClick,
}: {
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
      className={`relative flex flex-col items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 w-full
        ${selected
          ? "border-primary bg-primary/8 shadow-primary-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
        }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0
        ${selected ? "bg-primary text-white" : "bg-muted-bg text-muted"}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className={`font-semibold text-sm leading-tight ${selected ? "text-foreground" : "text-foreground/80"}`}>
          {label}
        </p>
        {desc && (
          <p className="text-xs text-muted mt-1 leading-relaxed">{desc}</p>
        )}
      </div>
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <CheckCircle2 size={11} className="text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function SmallCard({
  Icon, label, desc, selected, onClick,
}: {
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-left w-full
        ${selected
          ? "border-primary bg-primary/8 text-primary shadow-primary-sm"
          : "border-border bg-card hover:border-primary/40 text-foreground/70 hover:text-foreground"
        }`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {selected && <CheckCircle2 size={14} className="text-primary shrink-0" strokeWidth={3} />}
    </button>
  );
}

function Question({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-semibold text-foreground text-base mb-0.5">{title}</h2>
      <p className="text-sm text-muted mb-4 leading-relaxed">{subtitle}</p>
      {children}
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
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
const TOTAL_STEPS = 5;

const stepMeta = [
  { label: "Tu ritmo de vida",    hint: "Cuando y cuanto tiempo estas en casa" },
  { label: "Convivencia diaria",  hint: "Ruido, cocina, temperatura y bano" },
  { label: "Tus habitos",         hint: "Mascotas, tabaco, alcohol y orden" },
  { label: "Tu perfil social",    hint: "Como convives y manejas los conflictos" },
  { label: "Tu busqueda",         hint: "Presupuesto, ciudad y preferencias" },
];

export default function MatchQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<Prefs>(INITIAL_PREFS);

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const stepValid: Record<number, boolean> = {
    1: !!prefs.schedule && !!prefs.daysHome,
    2: !!prefs.noise && !!prefs.kitchenUse && !!prefs.commonTemp && !!prefs.bathroomTime,
    3: !!prefs.pets && !!prefs.smoking && !!prefs.alcohol && !!prefs.cleanliness && !!prefs.visits && !!prefs.overnightGuests,
    4: !!prefs.personality && !!prefs.conflictStyle && !!prefs.cohabitation,
    5: !!prefs.city && !!prefs.roommateGender && !!prefs.occupation,
  };

  const canNext = stepValid[step] ?? false;

  // Count answered questions per step for progress inside step
  const stepAnswered: Record<number, number> = {
    1: [prefs.schedule, prefs.daysHome].filter(Boolean).length,
    2: [prefs.noise, prefs.kitchenUse, prefs.commonTemp, prefs.bathroomTime].filter(Boolean).length,
    3: [prefs.pets, prefs.smoking, prefs.alcohol, prefs.cleanliness, prefs.visits, prefs.overnightGuests].filter(Boolean).length,
    4: [prefs.personality, prefs.conflictStyle, prefs.cohabitation].filter(Boolean).length,
    5: [prefs.city, prefs.roommateGender, prefs.occupation].filter(Boolean).length,
  };
  const stepTotal: Record<number, number> = { 1: 2, 2: 4, 3: 6, 4: 3, 5: 3 };

  function goNext() {
    if (!canNext) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const params = new URLSearchParams({
        schedule: prefs.schedule,
        daysHome: prefs.daysHome,
        noise: prefs.noise,
        kitchenUse: prefs.kitchenUse,
        commonTemp: prefs.commonTemp,
        bathroomTime: prefs.bathroomTime,
        pets: prefs.pets,
        smoking: prefs.smoking,
        alcohol: prefs.alcohol,
        cleanliness: prefs.cleanliness,
        visits: prefs.visits,
        overnightGuests: prefs.overnightGuests,
        personality: prefs.personality,
        conflictStyle: prefs.conflictStyle,
        cohabitation: prefs.cohabitation,
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
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const meta = stepMeta[step - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-primary tracking-tight">
            nidoo
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted hidden sm:block">
              Paso {step}/{TOTAL_STEPS} — {meta.label}
            </span>
            <span className="text-xs text-muted/60 hidden sm:block">
              {stepAnswered[step]}/{stepTotal[step]} preguntas
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

        {/* Step header */}
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary block mb-2">
            Paso {step} de {TOTAL_STEPS}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-2">
            {meta.label}
          </h1>
          <p className="text-muted leading-relaxed">{meta.hint}</p>
        </div>

        {/* ── Paso 1: Ritmo de vida ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-scale-in">
            <Question
              title="Tu horario en casa"
              subtitle="Cuando sueles estar mas activo/a durante el dia"
            >
              <div className="grid grid-cols-2 gap-3">
                {scheduleOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.schedule === o.id} onClick={() => set("schedule", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Cuanto tiempo pasas en casa"
              subtitle="Considerando dias laborales y fines de semana en promedio"
            >
              <div className="grid grid-cols-3 gap-3">
                {daysHomeOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.daysHome === o.id} onClick={() => set("daysHome", o.id)} />
                ))}
              </div>
            </Question>
          </div>
        )}

        {/* ── Paso 2: Convivencia diaria ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="animate-scale-in">
            <Question
              title="Nivel de ruido en casa"
              subtitle="El ambiente que necesitas para sentirte comodo/a"
            >
              <div className="grid grid-cols-3 gap-3">
                {noiseOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.noise === o.id} onClick={() => set("noise", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Tu relacion con la cocina"
              subtitle="Con que frecuencia y de que forma usas la cocina compartida"
            >
              <div className="grid grid-cols-3 gap-3">
                {kitchenOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.kitchenUse === o.id} onClick={() => set("kitchenUse", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Temperatura ideal en casa"
              subtitle="Tu preferencia de clima en los espacios comunes"
            >
              <div className="grid grid-cols-3 gap-3">
                {tempOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.commonTemp === o.id} onClick={() => set("commonTemp", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Tiempo en el bano"
              subtitle="Tu rutina de bano en un dia normal"
            >
              <div className="grid grid-cols-3 gap-3">
                {bathroomOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.bathroomTime === o.id} onClick={() => set("bathroomTime", o.id)} />
                ))}
              </div>
            </Question>
          </div>
        )}

        {/* ── Paso 3: Habitos ───────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="animate-scale-in">
            <Question
              title="Mascotas"
              subtitle="Tu relacion actual con los animales en casa"
            >
              <div className="grid grid-cols-2 gap-3">
                {petsOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.pets === o.id} onClick={() => set("pets", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Tabaco"
              subtitle="Tu habito con el cigarro o vaper"
            >
              <div className="grid grid-cols-3 gap-3">
                {smokingOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.smoking === o.id} onClick={() => set("smoking", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Alcohol"
              subtitle="Con que frecuencia consumes alcohol en casa"
            >
              <div className="grid grid-cols-3 gap-3">
                {alcoholOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.alcohol === o.id} onClick={() => set("alcohol", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Orden y limpieza"
              subtitle="Tu nivel de orden en los espacios compartidos de la casa"
            >
              <div className="grid grid-cols-3 gap-3">
                {cleanlinessOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.cleanliness === o.id} onClick={() => set("cleanliness", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Visitas en casa"
              subtitle="Con que frecuencia recibes amigos u otras personas"
            >
              <div className="grid grid-cols-3 gap-3">
                {visitsOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.visits === o.id} onClick={() => set("visits", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Invitados a dormir"
              subtitle="Que tan seguido se queda alguien a pasar la noche"
            >
              <div className="grid grid-cols-3 gap-3">
                {overnightOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.overnightGuests === o.id} onClick={() => set("overnightGuests", o.id)} />
                ))}
              </div>
            </Question>
          </div>
        )}

        {/* ── Paso 4: Perfil social ─────────────────────────────────────────── */}
        {step === 4 && (
          <div className="animate-scale-in">
            <Question
              title="Como eres socialmente"
              subtitle="Tu forma natural de relacionarte con las personas con quienes vives"
            >
              <div className="grid grid-cols-3 gap-3">
                {personalityOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.personality === o.id} onClick={() => set("personality", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Como manejas los conflictos"
              subtitle="Si hay algo que te molesta de tu roommate, como prefieres abordarlo"
            >
              <div className="grid grid-cols-3 gap-3">
                {conflictOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.conflictStyle === o.id} onClick={() => set("conflictStyle", o.id)} />
                ))}
              </div>
            </Question>

            <Question
              title="Que tipo de convivencia buscas"
              subtitle="El nivel de relacion que quieres tener con tu roommate en el dia a dia"
            >
              <div className="grid grid-cols-3 gap-3">
                {cohabitationOptions.map((o) => (
                  <OptionCard key={o.id} {...o} selected={prefs.cohabitation === o.id} onClick={() => set("cohabitation", o.id)} />
                ))}
              </div>
            </Question>
          </div>
        )}

        {/* ── Paso 5: Busqueda ─────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="animate-scale-in">
            {/* Budget */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-foreground text-base">Presupuesto maximo por mes</h2>
                <span className="text-lg font-bold text-primary">${prefs.budget} USD</span>
              </div>
              <p className="text-sm text-muted mb-5 leading-relaxed">
                El costo de renta total que puedes pagar (ya dividido entre roommates)
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
            <Question
              title="Ciudad"
              subtitle="Donde quieres vivir"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cities.map((city) => (
                  <SmallCard
                    key={city}
                    Icon={ChevronRight}
                    label={city}
                    selected={prefs.city === city}
                    onClick={() => set("city", city)}
                  />
                ))}
              </div>
            </Question>

            {/* Gender */}
            <Question
              title="Genero del roommate"
              subtitle="Tu preferencia de genero (respuesta honesta, sin juicios)"
            >
              <div className="flex flex-col gap-2">
                {genderOptions.map((o) => (
                  <SmallCard key={o.id} {...o} selected={prefs.roommateGender === o.id} onClick={() => set("roommateGender", o.id)} />
                ))}
              </div>
            </Question>

            {/* Occupation */}
            <Question
              title="Ocupacion del roommate"
              subtitle="El perfil de vida que encajaria mejor contigo"
            >
              <div className="flex flex-col gap-2">
                {occupationOptions.map((o) => (
                  <SmallCard key={o.id} {...o} selected={prefs.occupation === o.id} onClick={() => set("occupation", o.id)} />
                ))}
              </div>
            </Question>
          </div>
        )}

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-4">
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

          <div className="flex items-center gap-3">
            {/* Mini progress inside step */}
            <span className="text-xs text-muted hidden sm:block">
              {stepAnswered[step]}/{stepTotal[step]} respondidas
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              className={`flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200
                ${canNext
                  ? "bg-primary hover:bg-primary-hover text-white shadow-primary-md"
                  : "bg-muted-bg text-muted cursor-not-allowed"
                }`}
            >
              {step === TOTAL_STEPS ? "Ver mis matches" : "Siguiente"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
