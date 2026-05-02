"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  Sofa, Laptop, MapPin, Zap, PartyPopper,
} from "lucide-react";

// ── Question model ───────────────────────────────────────────────────────────
type QuestionDef = {
  key: string;
  title: string;
  subtitle: string;
  category: string;
  categoryIcon: React.ElementType;
  options: { id: string; Icon: React.ElementType; label: string; emoji: string; desc: string }[];
};

const questions: QuestionDef[] = [
  // --- Ritmo de vida ---
  {
    key: "schedule", category: "Tu ritmo", categoryIcon: Sun,
    title: "A que hora arranca tu dia?",
    subtitle: "Esto define si vas a cruzarte con tu roomie en el bano a las 6am o a las 2pm",
    options: [
      { id: "manana",      Icon: Sun,    emoji: "\u2600\ufe0f", label: "Madrugador/a",  desc: "Activo/a antes de las 7am, en cama antes de las 11pm" },
      { id: "noche",       Icon: Moon,   emoji: "\ud83c\udf19", label: "Nocturno/a",    desc: "Me activo a partir del mediodia, duermo tarde" },
      { id: "flexible",    Icon: Wind,   emoji: "\ud83c\udf00", label: "Flexible",      desc: "Mi horario cambia segun el dia" },
      { id: "home-office", Icon: Laptop, emoji: "\ud83d\udcbb", label: "Home office",   desc: "Trabajo desde casa, estoy en el depa todo el dia" },
    ],
  },
  {
    key: "daysHome", category: "Tu ritmo", categoryIcon: Sun,
    title: "Cuanto tiempo pasas en el depa?",
    subtitle: "Para saber si se van a ver mucho o si cada quien anda en lo suyo",
    options: [
      { id: "pocos",        Icon: MapPin, emoji: "\u2708\ufe0f", label: "Poco",          desc: "Solo vengo a dormir, casi siempre estoy fuera" },
      { id: "mitad",        Icon: Home,   emoji: "\u2696\ufe0f", label: "Mitad y mitad", desc: "A veces en casa, a veces afuera" },
      { id: "casi-siempre", Icon: Sofa,   emoji: "\ud83c\udfe0", label: "Casi siempre",  desc: "El depa es mi base de operaciones" },
    ],
  },
  // --- Convivencia diaria ---
  {
    key: "noise", category: "Convivencia", categoryIcon: Home,
    title: "Que nivel de ruido aguantas?",
    subtitle: "La diferencia entre vivir en un templo zen o en un after interminable",
    options: [
      { id: "muy-tranquilo", Icon: VolumeX, emoji: "\ud83e\uddd8", label: "Silencio total",   desc: "Audifonos siempre, nada de bocinas" },
      { id: "normal",        Icon: Volume2, emoji: "\ud83c\udfa7", label: "Ambiente normal",   desc: "Algo de ruido no molesta, pero no extremos" },
      { id: "social",        Icon: Music,   emoji: "\ud83c\udf89", label: "Casa animada",      desc: "Musica, ambiente y buena vibra" },
    ],
  },
  {
    key: "kitchenUse", category: "Convivencia", categoryIcon: Home,
    title: "Tu relacion con la cocina",
    subtitle: "Desde 'no se ni hervir agua' hasta 'meal prep de 3 horas'",
    options: [
      { id: "raramente",      Icon: Ban,              emoji: "\ud83d\udc68\u200d\ud83c\udf73", label: "Casi no cocino",  desc: "Pido comida o como fuera, la cocina es solo decoracion" },
      { id: "cocino-seguido", Icon: UtensilsCrossed,  emoji: "\ud83c\udf73",                   label: "Cocino seguido",  desc: "Preparo mis comidas casi todos los dias" },
      { id: "meal-prep",      Icon: UtensilsCrossed,  emoji: "\ud83e\udd57",                   label: "Meal prep",       desc: "Cocino en cantidad los domingos para toda la semana" },
    ],
  },
  {
    key: "commonTemp", category: "Convivencia", categoryIcon: Home,
    title: "AC a todo o ventanas abiertas?",
    subtitle: "La guerra del termostato ha destruido amistades. Mejor prevenir",
    options: [
      { id: "frio",     Icon: Thermometer, emoji: "\u2744\ufe0f", label: "Fresco / AC fuerte", desc: "Prefiero el ambiente frio, AC o ventilador siempre" },
      { id: "templado", Icon: Wind,        emoji: "\ud83c\udf24\ufe0f", label: "Templado",     desc: "Ni muy frio ni muy caliente, equilibrio" },
      { id: "calido",   Icon: Sun,         emoji: "\u2600\ufe0f", label: "Calidito",            desc: "Nada de AC directo, me gusta el calorcito" },
    ],
  },
  {
    key: "bathroomTime", category: "Convivencia", categoryIcon: Home,
    title: "Cuanto tardas en el bano?",
    subtitle: "Si comparten bano, esto es crucial",
    options: [
      { id: "rapido",  Icon: Clock, emoji: "\u26a1", label: "Rapido (5-10 min)", desc: "Me ducho y salgo, sin rodeos" },
      { id: "normal",  Icon: Clock, emoji: "\u23f0", label: "Normal (15-20 min)", desc: "Me tomo mi tiempo sin exagerar" },
      { id: "largo",   Icon: Clock, emoji: "\ud83d\udec1", label: "Spa personal",     desc: "El bano es mi santuario de relajacion" },
    ],
  },
  // --- Habitos ---
  {
    key: "pets", category: "Habitos", categoryIcon: Dog,
    title: "Animales en casa?",
    subtitle: "Desde 'soy alergico' hasta 'quiero adoptar 3 gatos'",
    options: [
      { id: "no",          Icon: Ban, emoji: "\ud83d\udeab", label: "Sin mascotas",        desc: "Prefiero un hogar sin animales" },
      { id: "si-pequena",  Icon: Dog, emoji: "\ud83d\udc31", label: "Mascota chica",       desc: "Gato o perro pequeno" },
      { id: "si-grande",   Icon: Dog, emoji: "\ud83d\udc36", label: "Mascota grande",      desc: "Perro mediano o grande" },
      { id: "acepta",      Icon: Dog, emoji: "\u2764\ufe0f", label: "Amo los animales",    desc: "Acepto cualquier mascota con gusto" },
    ],
  },
  {
    key: "smoking", category: "Habitos", categoryIcon: Dog,
    title: "Fumas?",
    subtitle: "Dealbreaker para muchos, mejor ser honestos desde ya",
    options: [
      { id: "no",     Icon: Ban,       emoji: "\ud83d\udeab", label: "No fumo",          desc: "Ambiente 100% libre de humo" },
      { id: "afuera", Icon: Wind,      emoji: "\ud83c\udf2c\ufe0f", label: "Solo afuera",     desc: "Fumo pero siempre en el balcon o exterior" },
      { id: "si",     Icon: Cigarette, emoji: "\ud83d\udea8", label: "Fumo en casa",     desc: "Necesito poder fumar en interiores" },
    ],
  },
  {
    key: "alcohol", category: "Habitos", categoryIcon: Dog,
    title: "Alcohol en casa?",
    subtitle: "De 'nunca' a 'unas chelas despues del trabajo es lo normal'",
    options: [
      { id: "no",        Icon: Ban,  emoji: "\ud83e\uddd8", label: "No tomo",        desc: "Nunca o casi nunca alcohol" },
      { id: "social",    Icon: Wine, emoji: "\ud83c\udf7b", label: "Socialmente",    desc: "Solo en salidas o reuniones, no entre semana" },
      { id: "frecuente", Icon: Wine, emoji: "\ud83c\udf7a", label: "Con frecuencia", desc: "Un par de cervezas en la noche es normal" },
    ],
  },
  {
    key: "cleanliness", category: "Habitos", categoryIcon: Dog,
    title: "Que tan ordenado/a eres?",
    subtitle: "El tema #1 de conflicto entre roommates. Se honesto/a",
    options: [
      { id: "muy-ordenado", Icon: Sparkles,     emoji: "\u2728", label: "Muy ordenado/a",  desc: "Cada cosa en su lugar, espero lo mismo" },
      { id: "normal",       Icon: CheckCircle2, emoji: "\ud83d\udc4d", label: "Normal",           desc: "Limpio cuando hace falta, no soy obsesivo" },
      { id: "relajado",     Icon: Wind,         emoji: "\ud83e\uddd8", label: "Relajado/a",       desc: "El desorden ocasional no me quita el sueno" },
    ],
  },
  {
    key: "visits", category: "Habitos", categoryIcon: Dog,
    title: "Traes gente a la casa?",
    subtitle: "Desde 'mi casa es mi templo privado' hasta 'open house permanente'",
    options: [
      { id: "casi-nunca", Icon: Home,  emoji: "\ud83d\udd10", label: "Casi nunca",    desc: "El depa es un espacio privado" },
      { id: "a-veces",    Icon: Users, emoji: "\ud83d\udc65", label: "A veces",       desc: "Visitas ocasionales, nada excesivo" },
      { id: "seguido",    Icon: Users, emoji: "\ud83c\udf89", label: "Seguido",       desc: "Mis amigos vienen con frecuencia" },
    ],
  },
  {
    key: "overnightGuests", category: "Habitos", categoryIcon: Dog,
    title: "Invitados a dormir?",
    subtitle: "Pareja, amigos de fuera... que tan seguido se queda alguien",
    options: [
      { id: "no",      Icon: Ban,   emoji: "\ud83d\udeab", label: "Prefiero no",      desc: "Los invitados se van ese mismo dia" },
      { id: "a-veces", Icon: Heart, emoji: "\ud83d\udca4", label: "A veces, con aviso", desc: "Puede pasar ocasionalmente" },
      { id: "si",      Icon: Heart, emoji: "\ud83d\udc95", label: "Sin problema",      desc: "Es algo que pasa regularmente" },
    ],
  },
  // --- Perfil social ---
  {
    key: "personality", category: "Social", categoryIcon: Users,
    title: "Introvertido o extrovertido?",
    subtitle: "No hay respuesta correcta, solo hay compatibilidad",
    options: [
      { id: "introvertido",  Icon: Home,  emoji: "\ud83d\udcda", label: "Introvertido/a",  desc: "Recargo energia en soledad, necesito mi espacio" },
      { id: "ambivertido",   Icon: Wind,  emoji: "\ud83c\udf00", label: "Ambivertido/a",   desc: "Depende del dia y mi humor" },
      { id: "extrovertido",  Icon: Users, emoji: "\ud83c\udf89", label: "Extrovertido/a",  desc: "Me energizo con la gente, me gusta convivir" },
    ],
  },
  {
    key: "conflictStyle", category: "Social", categoryIcon: Users,
    title: "Como manejas los conflictos?",
    subtitle: "Si tu roomie dejo los platos sucios otra vez, tu que haces?",
    options: [
      { id: "hablar-directo", Icon: MessageSquare, emoji: "\ud83d\udde3\ufe0f", label: "Hablo directo",   desc: "Lo digo de frente, en el momento" },
      { id: "escrito",        Icon: MessageSquare, emoji: "\ud83d\udcf1", label: "Mando mensaje",   desc: "Prefiero escribirlo para pensarlo mejor" },
      { id: "evitar",         Icon: ShieldAlert,   emoji: "\ud83e\udee3", label: "Dejo pasar",      desc: "Si no es grave, prefiero no hacer lio" },
    ],
  },
  {
    key: "cohabitation", category: "Social", categoryIcon: Users,
    title: "Que tipo de convivencia buscas?",
    subtitle: "El vibe que quieres en tu depa",
    options: [
      { id: "independencia-total", Icon: Home,  emoji: "\ud83c\udfd7\ufe0f",  label: "Cada quien su vida",    desc: "Somos vecinos, minima interaccion" },
      { id: "cordial",             Icon: Wind,  emoji: "\ud83e\udd1d", label: "Cordial y respetuoso", desc: "Buenos dias, buen trato, sin ser mejores amigos" },
      { id: "convivir",            Icon: Users, emoji: "\ud83c\udf55", label: "Convivir y conectar",  desc: "Salir juntos, ver pelis, compartir" },
    ],
  },
  // --- Logistica ---
  {
    key: "roommateGender", category: "Logistica", categoryIcon: MapPin,
    title: "Prefieres genero especifico?",
    subtitle: "Sin juicios, lo que te haga sentir mas comodo/a",
    options: [
      { id: "sin-preferencia", Icon: Users,     emoji: "\ud83c\udf0d", label: "Sin preferencia",    desc: "El genero no importa para mi" },
      { id: "mismo-genero",    Icon: UserCheck, emoji: "\ud83d\ude4b", label: "Mismo genero",       desc: "Prefiero alguien de mi mismo genero" },
      { id: "cualquiera",      Icon: Heart,     emoji: "\u2764\ufe0f", label: "Cualquiera",         desc: "Cero restriccion de genero" },
    ],
  },
  {
    key: "occupation", category: "Logistica", categoryIcon: MapPin,
    title: "Con quien conectas mas?",
    subtitle: "El perfil que probablemente encaje mejor con tu rutina",
    options: [
      { id: "sin-preferencia", Icon: Users,         emoji: "\ud83e\udd37", label: "Sin preferencia",  desc: "No importa la ocupacion" },
      { id: "estudiante",      Icon: GraduationCap, emoji: "\ud83c\udf93", label: "Estudiante",       desc: "Prefiero vivir con alguien que estudie" },
      { id: "profesional",     Icon: Briefcase,     emoji: "\ud83d\udcbc", label: "Profesional",      desc: "Prefiero alguien que trabaje" },
    ],
  },
];

const TOTAL = questions.length; // 17 questions

const cities = [
  "Guadalajara", "CDMX", "Monterrey",
  "Bogota", "Medellin",
  "Lima",
  "San Salvador",
];

const categoryColors: Record<string, string> = {
  "Tu ritmo":     "bg-amber-100 text-amber-700 border-amber-200",
  "Convivencia":  "bg-blue-100 text-blue-700 border-blue-200",
  "Habitos":      "bg-rose-100 text-rose-700 border-rose-200",
  "Social":       "bg-violet-100 text-violet-700 border-violet-200",
  "Logistica":    "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// ── Components ─────────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 400;
    const start = performance.now();
    const from = display;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className="tabular-nums">{display}{suffix}</span>;
}

function ProfilePill({ label, emoji, delay }: { label: string; emoji: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border bg-card text-foreground/80 border-border transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"
      }`}
    >
      <span className="text-sm">{emoji}</span>
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MatchQuizPage() {
  const router = useRouter();
  const [qi, setQi] = useState(0); // question index
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [budget, setBudget] = useState(300);
  const [city, setCity] = useState("");
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = questions[qi];
  const answered = Object.keys(answers).length;
  const progress = ((answered + (city ? 1 : 0)) / (TOTAL + 1)) * 100; // +1 for city/budget

  // Category progress
  const categories = [...new Set(questions.map((q) => q.category))];
  const catProgress = categories.map((cat) => {
    const catQs = questions.filter((q) => q.category === cat);
    const catAnswered = catQs.filter((q) => answers[q.key]).length;
    return { cat, answered: catAnswered, total: catQs.length, done: catAnswered === catQs.length };
  });

  // Build profile pills from answers
  const profilePills = questions
    .filter((q) => answers[q.key])
    .map((q) => {
      const option = q.options.find((o) => o.id === answers[q.key]);
      return option ? { label: option.label, emoji: option.emoji, key: q.key } : null;
    })
    .filter(Boolean) as { label: string; emoji: string; key: string }[];

  // Celebration on category complete
  const checkCategoryCelebration = useCallback((key: string, value: string) => {
    const updatedAnswers = { ...answers, [key]: value };
    const q = questions.find((q) => q.key === key);
    if (!q) return;
    const catQs = questions.filter((cq) => cq.category === q.category);
    const allDone = catQs.every((cq) => updatedAnswers[cq.key]);
    if (allDone) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1200);
    }
  }, [answers]);

  function selectOption(optionId: string) {
    if (animating) return;
    const key = q.key;
    setAnswers((prev) => ({ ...prev, [key]: optionId }));
    checkCategoryCelebration(key, optionId);

    // Auto-advance after short delay
    setAnimating(true);
    setTimeout(() => {
      if (qi < TOTAL - 1) {
        setDirection("next");
        setQi((i) => i + 1);
      }
      setAnimating(false);
    }, 400);
  }

  function goBack() {
    if (qi > 0 && !animating) {
      setDirection("prev");
      setQi((i) => i - 1);
    }
  }

  function goNext() {
    if (qi < TOTAL - 1 && answers[q.key] && !animating) {
      setDirection("next");
      setQi((i) => i + 1);
    }
  }

  const isLastQuestion = qi === TOTAL - 1;
  const allQuestionsAnswered = questions.every((q) => answers[q.key]);
  const showFinal = isLastQuestion && answers[q.key] && allQuestionsAnswered;

  function goToResults() {
    const params = new URLSearchParams({
      ...answers,
      budget: String(budget),
      city,
    });
    router.push(`/match/resultados?${params.toString()}`);
  }

  // Keyboard nav
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "ArrowRight") goNext();
      const num = parseInt(e.key);
      if (num >= 1 && num <= q.options.length) {
        selectOption(q.options[num - 1].id);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, animating, answers]);

  const slideClass = direction === "next"
    ? "animate-slide-in-right"
    : "animate-slide-in-left-reverse";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold text-primary tracking-tight shrink-0">
            nidoo
          </Link>

          {/* Global progress bar */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-primary shrink-0">
                <AnimatedNumber value={Math.round(progress)} />
              </span>
            </div>
          </div>

          <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors shrink-0">
            Salir
          </Link>
        </div>
      </header>

      {/* ── Main layout ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* LEFT — Question area */}
        <main className="flex-1 flex flex-col" ref={containerRef}>

          {/* Category pills */}
          <div className="max-w-2xl mx-auto w-full px-5 pt-6 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {catProgress.map((cp) => (
                <span
                  key={cp.cat}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-300 ${
                    cp.done
                      ? "bg-green-100 text-green-700 border-green-200"
                      : q?.category === cp.cat
                      ? categoryColors[cp.cat] ?? "bg-secondary text-foreground/70 border-border"
                      : "bg-secondary/50 text-muted border-border/50"
                  }`}
                >
                  {cp.done && <CheckCircle2 size={11} strokeWidth={3} />}
                  {cp.cat}
                  <span className="opacity-60">{cp.answered}/{cp.total}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Question card */}
          <div className="flex-1 flex items-center justify-center px-5 py-6">
            <div className={`w-full max-w-2xl ${slideClass}`} key={qi}>

              {/* Question number + category */}
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                  {qi + 1}
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[q.category] ?? "bg-secondary text-foreground/70 border-border"}`}>
                  {q.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance mb-2 leading-tight">
                {q.title}
              </h1>
              <p className="text-muted leading-relaxed mb-8 text-sm sm:text-base">
                {q.subtitle}
              </p>

              {/* Options */}
              <div className={`grid gap-3 ${q.options.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                {q.options.map((opt, oi) => {
                  const selected = answers[q.key] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => selectOption(opt.id)}
                      className={`group relative flex flex-col items-center text-center gap-3 p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selected
                          ? "border-primary bg-primary/8 shadow-primary-md scale-[1.02]"
                          : "border-border bg-card hover:border-primary/40 hover:bg-secondary hover:scale-[1.01] hover:shadow-primary-sm"
                      }`}
                      style={{ animationDelay: `${oi * 60}ms` }}
                    >
                      {/* Emoji */}
                      <span className={`text-3xl sm:text-4xl transition-transform duration-300 ${selected ? "scale-110" : "group-hover:scale-105"}`}>
                        {opt.emoji}
                      </span>

                      {/* Label */}
                      <p className={`font-bold text-sm sm:text-base leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </p>

                      {/* Desc */}
                      <p className="text-xs text-muted leading-relaxed">
                        {opt.desc}
                      </p>

                      {/* Check */}
                      {selected && (
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                          <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                        </span>
                      )}

                      {/* Keyboard hint */}
                      <span className="absolute bottom-2 right-3 text-[10px] text-muted/40 font-mono hidden sm:block">
                        {oi + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Final screen: budget + city ──────────────────────── */}
              {showFinal && (
                <div className="mt-10 pt-8 border-t border-border animate-scale-in">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                      <Zap size={16} strokeWidth={3} />
                    </span>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-foreground">
                        {"Ultimo paso: donde y cuanto?"}
                      </h2>
                      <p className="text-sm text-muted">
                        Para filtrar los resultados a tu realidad
                      </p>
                    </div>
                  </div>

                  {/* Budget slider */}
                  <div className="mb-8 bg-card rounded-2xl border border-border p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground text-sm">Presupuesto maximo/mes</span>
                      <span className="text-2xl font-black text-primary">${budget}</span>
                    </div>
                    <p className="text-xs text-muted mb-4">Tu parte de la renta (ya dividida)</p>
                    <input
                      type="range"
                      min={80}
                      max={600}
                      step={10}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="custom-slider w-full"
                    />
                    <div className="flex justify-between text-xs text-muted mt-2">
                      <span>$80</span>
                      <span>$600</span>
                    </div>
                  </div>

                  {/* City selector */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-foreground text-sm mb-1">Ciudad</h3>
                    <p className="text-xs text-muted mb-3">Donde quieres vivir</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {cities.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCity(c)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                            city === c
                              ? "border-primary bg-primary/8 text-primary shadow-primary-sm"
                              : "border-border bg-card hover:border-primary/40 text-foreground/70 hover:text-foreground"
                          }`}
                        >
                          <MapPin size={14} />
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Go to results */}
                  <button
                    type="button"
                    onClick={goToResults}
                    disabled={!city}
                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                      city
                        ? "bg-primary hover:bg-primary-hover text-white shadow-primary-lg animate-glow"
                        : "bg-muted-bg text-muted cursor-not-allowed"
                    }`}
                  >
                    <PartyPopper size={20} />
                    Ver mis matches
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {/* ── Navigation ─────────────────────────────────────── */}
              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={qi === 0}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    qi > 0
                      ? "border border-border bg-card hover:bg-secondary text-foreground/70"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <ArrowLeft size={15} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === qi
                          ? "w-6 bg-primary"
                          : answers[questions[i].key]
                          ? "w-2 bg-primary/40"
                          : "w-2 bg-border"
                      }`}
                    />
                  ))}
                </div>

                {answers[q.key] && !isLastQuestion ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <div className="w-24" />
                )}
              </div>

              {/* Keyboard hints */}
              <p className="text-center text-[11px] text-muted/40 mt-4 hidden sm:block">
                {"Usa las flechas del teclado o los numeros 1-"}{q.options.length}{" para responder"}
              </p>
            </div>
          </div>
        </main>

        {/* RIGHT — Live profile sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-80 border-l border-border bg-secondary/30 p-5 gap-4 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Tu perfil de roomie</p>
              <p className="text-xs text-muted">Se construye mientras respondes</p>
            </div>
          </div>

          {/* Progress ring */}
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-primary">
                <AnimatedNumber value={Math.round(progress)} />
              </span>
            </div>
            <div>
              <p className="text-xs text-muted">Preguntas respondidas</p>
              <p className="text-lg font-bold text-foreground">{answered} / {TOTAL}</p>
            </div>
          </div>

          {/* Category checklist */}
          <div className="space-y-2">
            {catProgress.map((cp) => (
              <div
                key={cp.cat}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  cp.done
                    ? "bg-green-50 border-green-200 text-green-700"
                    : q?.category === cp.cat
                    ? "bg-card border-primary/30 text-foreground"
                    : "bg-card border-border text-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  {cp.done ? <CheckCircle2 size={13} strokeWidth={3} /> : <span className="w-3 h-3 rounded-full bg-border" />}
                  {cp.cat}
                </span>
                <span>{cp.answered}/{cp.total}</span>
              </div>
            ))}
          </div>

          {/* Profile pills */}
          {profilePills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Asi eres tu
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profilePills.map((pill, i) => (
                  <ProfilePill key={pill.key} label={pill.label} emoji={pill.emoji} delay={i * 40} />
                ))}
              </div>
            </div>
          )}

          {/* Fun fact based on answers */}
          {answered >= 5 && (
            <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/15">
              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                <Sparkles size={12} />
                Dato sobre ti
              </p>
              <p className="text-xs text-foreground/70 leading-relaxed">
                {answers.schedule === "noche" && answers.noise === "social"
                  ? "Eres del tipo que convierte la sala en after despues de las 11pm. Tu roomie ideal probablemente tambien."
                  : answers.schedule === "manana" && answers.cleanliness === "muy-ordenado"
                  ? "Madrugador/a y ordenado/a: el roomie que todos quieren pero pocos merecen."
                  : answers.personality === "introvertido" && answers.cohabitation === "independencia-total"
                  ? "Tu depa ideal tiene puertas gruesas y WiFi de 500 Mbps. Minima interaccion, maximo respeto."
                  : answers.personality === "extrovertido" && answers.visits === "seguido"
                  ? "Tu casa es el punto de reunion del grupo. Tu roomie tiene que estar preparado para eso."
                  : answers.smoking === "no" && answers.cleanliness === "muy-ordenado"
                  ? "Cero humo y todo en su lugar. Buscas alguien que respete tu espacio como un templo."
                  : "Vas bien, sigue respondiendo para un perfil mas completo."
                }
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* ── Category celebration overlay ────────────────────────── */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-card border border-green-200 shadow-primary-lg rounded-2xl px-8 py-5 flex items-center gap-3 animate-scale-in">
            <CheckCircle2 size={28} className="text-green-500" strokeWidth={3} />
            <div>
              <p className="font-bold text-foreground text-sm">Seccion completada</p>
              <p className="text-xs text-muted">{q.category} listo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
