"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import {
  Eye, EyeOff, Lock, Upload, CheckCircle2,
  ChevronLeft, ChevronRight, AlertCircle,
  Loader2, User, BookOpen, Heart, ShieldCheck, ClipboardList,
  Info,
} from "lucide-react";
import Link from "next/link";

// ─── Design tokens (teal variant) ────────────────────────────────────────────
const T = {
  primary:      "#1D9E75",
  primaryHover: "#178060",
  bg:           "#f4fdf9",
  card:         "#ffffff",
  border:       "#b5e2cf",
  muted:        "#5a9e7a",
  mutedBg:      "#d7f0e4",
  foreground:   "#0e2c1a",
  secondary:    "#e3f5ee",
  danger:       "#dc2626",
};

// ─── LATAM countries ──────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "+503", flag: "SV" },
  { code: "+52",  flag: "MX" },
  { code: "+57",  flag: "CO" },
  { code: "+54",  flag: "AR" },
  { code: "+51",  flag: "PE" },
  { code: "+56",  flag: "CL" },
  { code: "+502", flag: "GT" },
  { code: "+504", flag: "HN" },
  { code: "+505", flag: "NI" },
];

// ─── Step labels ──────────────────────────────────────────────────────────────
const STEP_LABELS = ["Datos básicos", "Sobre ti", "Convivencia", "Verificación", "Confirmar"];

// ─── Zod schemas ──────────────────────────────────────────────────────────────
const step1Schema = z.object({
  fullName:    z.string().min(3, "Ingresa tu nombre completo"),
  birthDate:   z.string()
    .min(1, "Ingresa tu fecha de nacimiento")
    .refine(v => {
      const age = (Date.now() - new Date(v).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18;
    }, "Debes tener al menos 18 años"),
  gender:      z.string().min(1, "Selecciona una opción"),
  countryCode: z.string().min(1),
  phone:       z.string().min(7, "Número inválido").max(15),
  email:       z.string().email("Correo electrónico inválido"),
  password:    z.string().min(8, "Mínimo 8 caracteres"),
});

const step2Schema = z.object({
  occupation:   z.string().min(1, "Selecciona una ocupación"),
  workplace:    z.string().min(2, "Ingresa dónde estudias o trabajas"),
  incomeRange:  z.string().min(1, "Selecciona un rango"),
  bio:          z.string().min(10, "Escribe al menos 10 caracteres").max(300, "Máximo 300 caracteres"),
});

const step3Schema = z.object({
  pets:         z.string().min(1, "Selecciona una opción"),
  smoking:      z.string().min(1, "Selecciona una opción"),
  schedule:     z.string().min(1, "Selecciona una opción"),
  visits:       z.string().min(1, "Selecciona una opción"),
  environment:  z.array(z.string()).min(1, "Selecciona al menos una opción"),
  maxBudget:    z.number().min(100).max(600),
});

const step5Schema = z.object({
  acceptedTerms: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar los términos para continuar",
  }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step5Data = z.infer<typeof step5Schema>;
type FileBundle = { front: File | null; back: File | null; selfie: File | null };
type RefData    = { name: string; phone: string };

// ─── Shared primitives ────────────────────────────────────────────────────────
function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold mb-1" style={{ color: T.foreground }}>
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-600">
      <AlertCircle size={12} /> {message}
    </p>
  );
}

function Microcopy({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <p
      className="mt-1 text-xs leading-relaxed"
      style={{ color: green ? T.primary : T.muted }}
    >
      {children}
    </p>
  );
}

function InputBase({
  id, type = "text", placeholder, error,
  onFocus: externalFocus, onBlur: externalBlur,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
      style={{
        background: T.bg,
        border: `1.5px solid ${error ? T.danger : T.border}`,
        color: T.foreground,
        fontFamily: "inherit",
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = T.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${T.primary}22`;
        externalFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? T.danger : T.border;
        e.currentTarget.style.boxShadow = "none";
        externalBlur?.(e);
      }}
      {...rest}
    />
  );
}

function SelectBase({
  id, children, error,
  onFocus: externalFocus, onBlur: externalBlur,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      id={id}
      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none"
      style={{
        background: T.bg,
        border: `1.5px solid ${error ? T.danger : T.border}`,
        color: T.foreground,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = T.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${T.primary}22`;
        externalFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? T.danger : T.border;
        e.currentTarget.style.boxShadow = "none";
        externalBlur?.(e);
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

// A single-select radio card (used for pets, smoking, etc.)
function RadioCard({
  value, selected, label, onSelect,
}: { value: string; selected: boolean; label: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-xl px-3 py-3 text-xs font-semibold text-center transition-all border-2"
      style={{
        borderColor:  selected ? T.primary : T.border,
        background:   selected ? `${T.primary}18` : T.card,
        color:        selected ? T.primary : T.foreground,
        boxShadow:    selected ? `0 0 0 2px ${T.primary}22` : "none",
      }}
    >
      {label}
    </button>
  );
}

// A multi-select chip (used for environment)
function Chip({
  label, selected, onToggle,
}: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all border-2"
      style={{
        borderColor: selected ? T.primary : T.border,
        background:  selected ? `${T.primary}18` : T.card,
        color:       selected ? T.primary : T.foreground,
      }}
    >
      {label}
    </button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const pct = Math.round(((step + 1) / 5) * 100);
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-3">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: i <= step ? T.primary : T.mutedBg,
                color:      i <= step ? "#fff" : T.muted,
              }}
            >
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span
              className="text-[10px] font-medium text-center leading-tight hidden sm:block"
              style={{ color: i <= step ? T.primary : T.muted }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: T.mutedBg }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: T.primary }}
        />
      </div>
      <p className="mt-2 text-xs text-right font-medium" style={{ color: T.muted }}>
        Paso {step + 1} de 5
      </p>
    </div>
  );
}

// ─── Step navigation ──────────────────────────────────────────────────────────
function StepNav({
  step, onBack, onNext, nextLabel = "Continuar", loading = false,
}: {
  step: number; onBack: () => void; onNext: () => void;
  nextLabel?: string; loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-8 gap-3">
      {step > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
          style={{ background: T.mutedBg, color: T.muted }}
        >
          <ChevronLeft size={16} /> Volver
        </button>
      ) : <div />}
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all"
        style={{ background: loading ? T.muted : T.primary, minWidth: 140 }}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = T.primaryHover)}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = T.primary)}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {nextLabel} {!loading && <ChevronRight size={16} />}
      </button>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({
  label, hint, file, onFile,
}: { label: string; hint?: string; file: File | null; onFile: (f: File) => void }) {
  const onDrop = useCallback((accepted: File[]) => { if (accepted[0]) onFile(accepted[0]); }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div
      {...getRootProps()}
      className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-4 min-h-[110px]"
      style={{
        borderColor: isDragActive ? T.primary : T.border,
        background:  isDragActive ? `${T.primary}11` : T.bg,
      }}
    >
      <input {...getInputProps()} />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="max-h-20 rounded-lg object-cover" />
      ) : (
        <>
          <Upload size={20} style={{ color: T.primary }} />
          <span className="text-xs font-semibold text-center" style={{ color: T.foreground }}>{label}</span>
          {hint && <span className="text-[11px] text-center" style={{ color: T.muted }}>{hint}</span>}
          <span className="text-[11px]" style={{ color: T.muted }}>
            {isDragActive ? "Suelta aqui" : "Arrastra o toca para subir · JPG, PNG · max 10 MB"}
          </span>
        </>
      )}
      {file && (
        <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 rounded-full px-2 py-0.5">
          <CheckCircle2 size={10} /> Listo
        </span>
      )}
    </div>
  );
}

// ─── Summary row ──────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b" style={{ borderColor: T.border }}>
      <span className="text-xs font-semibold shrink-0" style={{ color: T.muted }}>{label}</span>
      <span className="text-xs text-right font-medium" style={{ color: T.foreground }}>{value}</span>
    </div>
  );
}

// ─── STEP 1 — Información básica ─────────────────────────────────────────────
function Step1({ onNext }: { onNext: (d: Step1Data) => void }) {
  const [showPwd, setShowPwd] = useState(false);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { countryCode: "+503" },
  });
  const pwd = watch("password", "");
  const strength = pwd.length === 0 ? 0 : pwd.length < 6 ? 1 : pwd.length < 8 ? 2 : /[A-Z]/.test(pwd) && /\d/.test(pwd) ? 4 : 3;
  const strColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strLabels = ["", "Muy debil", "Debil", "Buena", "Fuerte"];

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${T.primary}22` }}>
          <User size={18} style={{ color: T.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: T.foreground }}>Informacion basica</h2>
          <p className="text-sm" style={{ color: T.muted }}>Solo te pedimos lo esencial para comenzar.</p>
        </div>
      </div>

      {/* Full name */}
      <div className="mb-4">
        <Label htmlFor="fullName">Nombre completo</Label>
        <InputBase id="fullName" placeholder="Ej. Valentina Reyes" error={!!errors.fullName} {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>

      {/* Date of birth */}
      <div className="mb-4">
        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
        <InputBase id="birthDate" type="date" error={!!errors.birthDate} {...register("birthDate")} />
        <FieldError message={errors.birthDate?.message} />
      </div>

      {/* Gender */}
      <div className="mb-4">
        <Label htmlFor="gender">Genero</Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SelectBase id="gender" error={!!errors.gender} {...field}>
              <option value="">Selecciona una opcion</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="no-decir">Prefiero no decir</option>
            </SelectBase>
          )}
        />
        <FieldError message={errors.gender?.message} />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <Label htmlFor="phone">Telefono</Label>
        <div className="flex gap-2">
          <Controller
            name="countryCode"
            control={control}
            render={({ field }) => (
              <div style={{ width: 110, flexShrink: 0 }}>
                <SelectBase id="countryCode" {...field}>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </SelectBase>
              </div>
            )}
          />
          <div className="flex-1">
            <InputBase id="phone" type="tel" placeholder="7000 0000" error={!!errors.phone} {...register("phone")} />
          </div>
        </div>
        <Microcopy>Solo te contactaremos en casos importantes.</Microcopy>
        <FieldError message={errors.phone?.message} />
      </div>

      {/* Email */}
      <div className="mb-4">
        <Label htmlFor="email">Correo electronico</Label>
        <InputBase id="email" type="email" placeholder="tucorreo@ejemplo.com" error={!!errors.email} {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Password */}
      <div className="mb-6">
        <Label htmlFor="password">Contrasena</Label>
        <div className="relative">
          <InputBase
            id="password"
            type={showPwd ? "text" : "password"}
            placeholder="Min. 8 caracteres"
            error={!!errors.password}
            style={{ paddingRight: 44 }}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: T.muted }}
            aria-label={showPwd ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {pwd.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: i <= strength ? strColors[strength] : T.mutedBg }} />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: strColors[strength] }}>{strLabels[strength]}</span>
          </div>
        )}
        <FieldError message={errors.password?.message} />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all"
        style={{ background: T.primary }}
        onMouseEnter={e => (e.currentTarget.style.background = T.primaryHover)}
        onMouseLeave={e => (e.currentTarget.style.background = T.primary)}
      >
        Continuar <span aria-hidden>→</span>
      </button>
    </form>
  );
}

// ─── STEP 2 — Sobre ti ────────────────────────────────────────────────────────
function Step2({ onBack, onNext }: { onBack: () => void; onNext: (d: Step2Data) => void }) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { bio: "" },
  });
  const bio = watch("bio", "");

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${T.primary}22` }}>
          <BookOpen size={18} style={{ color: T.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: T.foreground }}>Sobre ti</h2>
          <p className="text-sm" style={{ color: T.muted }}>Ayudanos a conocerte un poco mejor.</p>
        </div>
      </div>

      {/* Occupation */}
      <div className="mb-4">
        <Label htmlFor="occupation">Ocupacion</Label>
        <Controller
          name="occupation"
          control={control}
          render={({ field }) => (
            <SelectBase id="occupation" error={!!errors.occupation} {...field}>
              <option value="">Selecciona una opcion</option>
              <option value="estudiante">Estudiante universitario/a</option>
              <option value="trabajador-dependiente">Trabajador/a dependiente</option>
              <option value="trabajador-independiente">Trabajador/a independiente</option>
              <option value="practica">Profesional en practica</option>
              <option value="otro">Otro</option>
            </SelectBase>
          )}
        />
        <FieldError message={errors.occupation?.message} />
      </div>

      {/* Workplace */}
      <div className="mb-4">
        <Label htmlFor="workplace">Donde estudias o trabajas</Label>
        <InputBase id="workplace" placeholder="Ej. Universidad de El Salvador" error={!!errors.workplace} {...register("workplace")} />
        <Microcopy>Solo se comparte con el propietario que tu aceptes.</Microcopy>
        <FieldError message={errors.workplace?.message} />
      </div>

      {/* Income range */}
      <div className="mb-4">
        <Label htmlFor="incomeRange">Ingreso mensual aproximado</Label>
        <Controller
          name="incomeRange"
          control={control}
          render={({ field }) => (
            <SelectBase id="incomeRange" error={!!errors.incomeRange} {...field}>
              <option value="">Selecciona un rango</option>
              <option value="<300">Menos de $300</option>
              <option value="300-500">$300 – $500</option>
              <option value="500-800">$500 – $800</option>
              <option value="800-2000">$800 – $2,000</option>
              <option value=">2000">Mas de $2,000</option>
            </SelectBase>
          )}
        />
        <Microcopy>Esta info solo se comparte al momento de firmar el contrato.</Microcopy>
        <FieldError message={errors.incomeRange?.message} />
      </div>

      {/* Bio */}
      <div className="mb-6">
        <Label htmlFor="bio">Presentacion personal</Label>
        <textarea
          id="bio"
          maxLength={300}
          rows={4}
          placeholder="Cuentanos un poco sobre ti, tus habitos y lo que buscas en un hogar..."
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
          style={{
            background: T.bg,
            border: `1.5px solid ${errors.bio ? T.danger : T.border}`,
            color: T.foreground,
            fontFamily: "inherit",
          }}
          {...(() => {
            const { onBlur: rhfBlur, ...regRest } = register("bio");
            return {
              ...regRest,
              onFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => {
                e.currentTarget.style.borderColor = T.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${T.primary}22`;
              },
              onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
                e.currentTarget.style.borderColor = errors.bio ? T.danger : T.border;
                e.currentTarget.style.boxShadow = "none";
                rhfBlur(e);
              },
            };
          })()}
        />
        <div className="flex justify-between items-center mt-1">
          <Microcopy>Cuanto mas honesta sea tu presentacion, mas probable que te acepten.</Microcopy>
          <span className="text-[11px] font-medium shrink-0 ml-2" style={{ color: bio.length >= 280 ? T.danger : T.muted }}>
            {bio.length}/300
          </span>
        </div>
        <FieldError message={errors.bio?.message} />
      </div>

      <StepNav step={1} onBack={onBack} onNext={() => handleSubmit(onNext)()} />
    </form>
  );
}

// ─── STEP 3 — Preferencias de convivencia ────────────────────────────────────
function Step3({ onBack, onNext }: { onBack: () => void; onNext: (d: Step3Data) => void }) {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { environment: [], maxBudget: 300 },
  });

  const budget = watch("maxBudget", 300);

  function RadioGroup({ name, options }: { name: keyof Step3Data; options: { value: string; label: string }[] }) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2">
            {options.map(o => (
              <RadioCard
                key={o.value}
                value={o.value}
                label={o.label}
                selected={field.value === o.value}
                onSelect={() => field.onChange(o.value)}
              />
            ))}
          </div>
        )}
      />
    );
  }

  const envOptions = ["Familiar", "Tranquilo", "Social", "Solo/a", "Con pareja", "Flexible"];
  const envField = watch("environment", []);

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${T.primary}22` }}>
          <Heart size={18} style={{ color: T.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: T.foreground }}>Preferencias de convivencia</h2>
          <p className="text-sm" style={{ color: T.muted }}>Te ayuda a encontrar el hogar ideal.</p>
        </div>
      </div>

      {/* Pets */}
      <div className="mb-5">
        <Label>Mascotas</Label>
        <RadioGroup name="pets" options={[
          { value: "no", label: "No tengo" },
          { value: "pequena", label: "Si, pequena" },
          { value: "mediana", label: "Si, mediana" },
          { value: "no-decir", label: "Prefiero no decir" },
        ]} />
        <FieldError message={errors.pets?.message} />
      </div>

      {/* Smoking */}
      <div className="mb-5">
        <Label>Tabaco</Label>
        <RadioGroup name="smoking" options={[
          { value: "no", label: "No fumo" },
          { value: "afuera", label: "Solo afuera" },
          { value: "si", label: "Si fumo" },
          { value: "no-decir", label: "Prefiero no decir" },
        ]} />
        <FieldError message={errors.smoking?.message} />
      </div>

      {/* Schedule */}
      <div className="mb-5">
        <Label>Horario tipico en casa</Label>
        <RadioGroup name="schedule" options={[
          { value: "manana-noche", label: "Manana y noche" },
          { value: "noches", label: "Solo noches" },
          { value: "todo-dia", label: "Todo el dia" },
          { value: "variable", label: "Variable" },
        ]} />
        <FieldError message={errors.schedule?.message} />
      </div>

      {/* Visits */}
      <div className="mb-5">
        <Label>Visitas en casa</Label>
        <RadioGroup name="visits" options={[
          { value: "rara-vez", label: "Rara vez" },
          { value: "a-veces", label: "A veces" },
          { value: "seguido", label: "Seguido" },
          { value: "pareja", label: "Pareja estable" },
        ]} />
        <FieldError message={errors.visits?.message} />
      </div>

      {/* Environment (multi-select chips) */}
      <div className="mb-5">
        <Label>Ambiente deseado del hogar</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {envOptions.map(opt => (
            <Chip
              key={opt}
              label={opt}
              selected={envField.includes(opt)}
              onToggle={() => {
                const next = envField.includes(opt)
                  ? envField.filter(v => v !== opt)
                  : [...envField, opt];
                setValue("environment", next, { shouldValidate: true });
              }}
            />
          ))}
        </div>
        <FieldError message={errors.environment?.message} />
      </div>

      {/* Budget slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <Label>Presupuesto mensual maximo</Label>
          <span className="text-sm font-bold" style={{ color: T.primary }}>${budget}</span>
        </div>
        <Controller
          name="maxBudget"
          control={control}
          render={({ field }) => (
            <input
              type="range"
              min={100}
              max={600}
              step={10}
              value={field.value}
              onChange={e => field.onChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                accentColor: T.primary,
                background: `linear-gradient(to right, ${T.primary} 0%, ${T.primary} ${((budget - 100) / 500) * 100}%, ${T.mutedBg} ${((budget - 100) / 500) * 100}%, ${T.mutedBg} 100%)`,
              }}
            />
          )}
        />
        <div className="flex justify-between text-[11px] mt-1" style={{ color: T.muted }}>
          <span>$100</span><span>$600</span>
        </div>
        <Microcopy>Incluye servicios si el propietario los cubre.</Microcopy>
      </div>

      <StepNav step={2} onBack={onBack} onNext={() => handleSubmit(onNext)()} />
    </form>
  );
}

// ─── STEP 4 — Verificacion de identidad ─────────────────────────────────────
function Step4({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (files: FileBundle, ref: RefData) => void;
}) {
  const [files, setFiles] = useState<FileBundle>({ front: null, back: null, selfie: null });
  const [ref, setRef]     = useState<RefData>({ name: "", phone: "" });
  const [error, setError] = useState("");

  function handleNext() {
    if (!files.front || !files.back || !files.selfie) {
      setError("Sube los tres documentos para continuar.");
      return;
    }
    setError("");
    onNext(files, ref);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${T.primary}22` }}>
          <ShieldCheck size={18} style={{ color: T.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: T.foreground }}>Verificacion de identidad</h2>
          <p className="text-sm" style={{ color: T.muted }}>Nos ayuda a crear una comunidad segura para todos.</p>
        </div>
      </div>

      {/* ID front + back */}
      <div className="mb-4">
        <Label>Documento de identidad (DUI / DNI / INE)</Label>
        <div className="grid grid-cols-2 gap-3">
          <UploadZone label="Frente" file={files.front} onFile={f => setFiles(v => ({ ...v, front: f }))} />
          <UploadZone label="Reverso" file={files.back}  onFile={f => setFiles(v => ({ ...v, back: f }))} />
        </div>
      </div>

      {/* Selfie */}
      <div className="mb-5">
        <Label>Selfie</Label>
        <UploadZone
          label="Foto de tu rostro"
          hint="Sin filtros ni lentes de sol."
          file={files.selfie}
          onFile={f => setFiles(v => ({ ...v, selfie: f }))}
        />
      </div>

      {/* Optional reference */}
      <div className="mb-5 rounded-2xl p-4" style={{ background: T.secondary, border: `1.5px solid ${T.border}` }}>
        <div className="flex items-start gap-2 mb-3">
          <Info size={15} style={{ color: T.primary, flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs font-semibold" style={{ color: T.primary }}>
            Una referencia aumenta hasta 3x tus posibilidades de ser aceptado/a.
          </p>
        </div>
        <p className="text-xs mb-3" style={{ color: T.muted }}>Referencia personal (opcional)</p>
        <div className="flex flex-col gap-2">
          <InputBase
            placeholder="Nombre completo de tu referencia"
            value={ref.name}
            onChange={e => setRef(v => ({ ...v, name: e.target.value }))}
          />
          <InputBase
            type="tel"
            placeholder="Telefono de contacto"
            value={ref.phone}
            onChange={e => setRef(v => ({ ...v, phone: e.target.value }))}
          />
        </div>
      </div>

      {/* Encryption disclaimer */}
      <div
        className="flex items-start gap-3 rounded-2xl p-4 mb-2"
        style={{ background: T.mutedBg, border: `1.5px solid ${T.border}` }}
      >
        <Lock size={16} style={{ color: T.muted, flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: T.muted }}>
          Tus documentos estan cifrados y solo se comparten con el propietario que tu aceptes.
        </p>
      </div>

      {error && <FieldError message={error} />}

      <StepNav step={3} onBack={onBack} onNext={handleNext} nextLabel="Continuar" />
    </div>
  );
}

// ─── STEP 5 — Confirmacion ────────────────────────────────────────────────────
function Step5({
  step1, step2, step3, files, ref: refData, onBack,
}: {
  step1: Step1Data; step2: Step2Data; step3: Step3Data;
  files: FileBundle; ref: RefData; onBack: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  const OCCUPATIONS: Record<string, string> = {
    estudiante: "Estudiante universitario/a",
    "trabajador-dependiente": "Trabajador/a dependiente",
    "trabajador-independiente": "Trabajador/a independiente",
    practica: "Profesional en practica",
    otro: "Otro",
  };
  const INCOME: Record<string, string> = {
    "<300": "Menos de $300",
    "300-500": "$300 – $500",
    "500-800": "$500 – $800",
    "800-2000": "$800 – $2,000",
    ">2000": "Mas de $2,000",
  };
  const GENDERS: Record<string, string> = {
    mujer: "Mujer",
    hombre: "Hombre",
    "no-decir": "Prefiero no decir",
  };

  async function submit() {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/onboarding/inquilino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "inquilino",
          personal: {
            fullName: step1.fullName,
            birthDate: step1.birthDate,
            gender: step1.gender,
            phone: `${step1.countryCode}${step1.phone}`,
            email: step1.email,
          },
          profile: {
            occupation: step2.occupation,
            workplace: step2.workplace,
            incomeRange: step2.incomeRange,
            bio: step2.bio,
          },
          preferences: {
            pets: step3.pets,
            smoking: step3.smoking,
            schedule: step3.schedule,
            visits: step3.visits,
            environment: step3.environment,
            maxBudget: step3.maxBudget,
          },
          verification: {
            idFront: files.front?.name ?? null,
            idBack: files.back?.name ?? null,
            selfie: files.selfie?.name ?? null,
            reference: refData.name ? refData : null,
          },
          acceptedTerms: true,
        }),
      });
      if (!res.ok) throw new Error("Error del servidor");
      setSubmitted(true);
    } catch {
      setApiError("Ocurrio un problema. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: `${T.primary}22` }}
        >
          <CheckCircle2 size={40} style={{ color: T.primary }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-serif mb-2" style={{ color: T.foreground }}>
            Perfil activado
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: T.muted }}>
            Tu perfil de inquilino esta listo. Ya puedes explorar habitaciones disponibles y conectar con propietarios verificados.
          </p>
        </div>
        <div
          className="w-full rounded-2xl p-4 text-left"
          style={{ background: T.secondary, border: `1.5px solid ${T.border}` }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: T.foreground }}>Proximos pasos</p>
          {[
            "Revisaremos tu identidad en menos de 24 horas.",
            "Recibiras un correo cuando tu cuenta este verificada.",
            "Una vez activo, apareceran habitaciones compatibles contigo.",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: T.primary, color: "#fff" }}
              >
                {i + 1}
              </span>
              <p className="text-xs" style={{ color: T.muted }}>{item}</p>
            </div>
          ))}
        </div>
        <Link
          href="/"
          className="text-sm font-semibold underline underline-offset-2"
          style={{ color: T.primary }}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${T.primary}22` }}>
          <ClipboardList size={18} style={{ color: T.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: T.foreground }}>Confirmacion</h2>
          <p className="text-sm" style={{ color: T.muted }}>Revisa tu informacion antes de activar tu perfil.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ border: `1.5px solid ${T.border}` }}>
        {/* Personal */}
        <div className="px-4 pt-3 pb-1" style={{ background: T.secondary }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.primary }}>Datos personales</p>
        </div>
        <div className="px-4 py-1">
          <Row label="Nombre"        value={step1.fullName} />
          <Row label="Nacimiento"    value={step1.birthDate} />
          <Row label="Genero"        value={GENDERS[step1.gender] ?? step1.gender} />
          <Row label="Telefono"      value={`${step1.countryCode} ${step1.phone}`} />
          <Row label="Correo"        value={step1.email} />
        </div>

        {/* Profile */}
        <div className="px-4 pt-3 pb-1" style={{ background: T.secondary }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.primary }}>Perfil</p>
        </div>
        <div className="px-4 py-1">
          <Row label="Ocupacion"     value={OCCUPATIONS[step2.occupation] ?? step2.occupation} />
          <Row label="Lugar"         value={step2.workplace} />
          <Row label="Ingresos"      value={INCOME[step2.incomeRange] ?? step2.incomeRange} />
          <Row label="Bio"           value={step2.bio.length > 60 ? step2.bio.slice(0, 60) + "..." : step2.bio} />
        </div>

        {/* Preferences */}
        <div className="px-4 pt-3 pb-1" style={{ background: T.secondary }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.primary }}>Convivencia</p>
        </div>
        <div className="px-4 py-1">
          <Row label="Mascotas"      value={step3.pets} />
          <Row label="Tabaco"        value={step3.smoking} />
          <Row label="Horario"       value={step3.schedule} />
          <Row label="Visitas"       value={step3.visits} />
          <Row label="Ambiente"      value={step3.environment.join(", ")} />
          <Row label="Presupuesto"   value={`$${step3.maxBudget}/mes`} />
        </div>

        {/* Verification */}
        <div className="px-4 pt-3 pb-1" style={{ background: T.secondary }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.primary }}>Verificacion</p>
        </div>
        <div className="px-4 py-2 pb-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-semibold" style={{ color: T.muted }}>Estado</span>
            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 rounded-full px-3 py-0.5">
              <CheckCircle2 size={11} /> Verificada
            </span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mb-5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-0.5 rounded accent-teal-600"
            style={{ accentColor: T.primary }}
            {...register("acceptedTerms")}
          />
          <span className="text-xs leading-relaxed" style={{ color: T.foreground }}>
            Acepto los{" "}
            <Link href="#" className="underline underline-offset-2 font-semibold" style={{ color: T.primary }}>Terminos de uso</Link>,
            la{" "}
            <Link href="#" className="underline underline-offset-2 font-semibold" style={{ color: T.primary }}>Politica de privacidad</Link>{" "}
            y entiendo que el contrato de arrendamiento es legalmente vinculante.
          </span>
        </label>
        <FieldError message={errors.acceptedTerms?.message} />
      </div>

      {apiError && <FieldError message={apiError} />}

      {/* Primary CTA */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-4 text-sm font-bold text-white transition-all"
        style={{ background: loading ? T.muted : T.primary }}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = T.primaryHover)}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = T.primary)}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Activando perfil...
          </span>
        ) : "Activar mi perfil de inquilino"}
      </button>

      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="w-full mt-3 text-sm font-semibold text-center"
        style={{ color: T.muted }}
      >
        Editar informacion
      </button>
    </form>
  );
}

// ─── ROOT CONTROLLER ──────────────────────────────────────────────────────────
export default function InquilinoPage() {
  const [step, setStep]       = useState(0);
  const [step1, setStep1]     = useState<Step1Data | null>(null);
  const [step2, setStep2]     = useState<Step2Data | null>(null);
  const [step3, setStep3]     = useState<Step3Data | null>(null);
  const [files, setFiles]     = useState<FileBundle>({ front: null, back: null, selfie: null });
  const [ref, setRef]         = useState<RefData>({ name: "", phone: "" });

  function next() { setStep(s => Math.min(s + 1, 4)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-10"
      style={{ background: T.bg }}
    >
      {/* Logo */}
      <Link href="/" className="mb-6 self-start sm:self-center">
        <span className="text-xl font-bold font-serif" style={{ color: T.primary }}>Nidoo</span>
        <span className="text-xs ml-2 font-medium" style={{ color: T.muted }}>Inquilino</span>
      </Link>

      <div className="w-full max-w-lg">
        {/* Progress bar (hidden on success screen) */}
        <ProgressBar step={step} />

        {/* Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 w-full"
          style={{
            background: T.card,
            border: `1.5px solid ${T.border}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {step === 0 && (
            <Step1
              onNext={d => { setStep1(d); next(); }}
            />
          )}
          {step === 1 && (
            <Step2
              onBack={back}
              onNext={d => { setStep2(d); next(); }}
            />
          )}
          {step === 2 && (
            <Step3
              onBack={back}
              onNext={d => { setStep3(d); next(); }}
            />
          )}
          {step === 3 && (
            <Step4
              onBack={back}
              onNext={(f, r) => { setFiles(f); setRef(r); next(); }}
            />
          )}
          {step === 4 && step1 && step2 && step3 && (
            <Step5
              step1={step1}
              step2={step2}
              step3={step3}
              files={files}
              ref={ref}
              onBack={back}
            />
          )}
        </div>
      </div>
    </div>
  );
}
