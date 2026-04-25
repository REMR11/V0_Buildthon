"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import {
  Eye,
  EyeOff,
  Lock,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Home,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import LocationPicker, { type LocationData } from "@/components/LocationPicker";

// ─── Design tokens (mirror globals.css) ───────────────────────────────────────
const TOKEN = {
  primary: "#D85A30",
  primaryHover: "#c04f28",
  bg: "#fdf8f4",
  card: "#ffffff",
  border: "#e2cbb5",
  muted: "#9e7a5a",
  mutedBg: "#f0e4d7",
  foreground: "#2c1a0e",
  secondary: "#f5ede3",
};

// ─── LATAM countries ──────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "+503", flag: "🇸🇻", label: "SV" },
  { code: "+52",  flag: "🇲🇽", label: "MX" },
  { code: "+57",  flag: "🇨🇴", label: "CO" },
  { code: "+54",  flag: "🇦🇷", label: "AR" },
  { code: "+51",  flag: "🇵🇪", label: "PE" },
  { code: "+56",  flag: "🇨🇱", label: "CL" },
  { code: "+502", flag: "🇬🇹", label: "GT" },
  { code: "+504", flag: "🇭🇳", label: "HN" },
  { code: "+505", flag: "🇳🇮", label: "NI" },
];

const CITIES = [
  "San Salvador", "Santa Ana", "San Miguel",
  "Ciudad de México", "Guadalajara", "Monterrey",
  "Bogotá", "Medellín", "Cali",
  "Buenos Aires", "Córdoba", "Rosario",
  "Lima", "Arequipa",
  "Santiago", "Valparaíso",
  "Ciudad de Guatemala",
  "Tegucigalpa",
  "Managua",
];

const ENVIRONMENTS = [
  { value: "family", label: "Familia con hijos", icon: "👨‍👩‍👧‍👦" },
  { value: "couple", label: "Pareja", icon: "👫" },
  { value: "single", label: "Persona sola", icon: "🧑" },
  { value: "alone",  label: "Vivo solo/a", icon: "🏠" },
];

// ─── Zod schemas per step ─────────────────────────────────────────────────────
const step1Schema = z.object({
  fullName:    z.string().min(3, "Ingresa tu nombre completo"),
  countryCode: z.string().min(1, "Selecciona un país"),
  phone:       z.string().min(7, "Número de teléfono inválido").max(15),
  email:       z.string().email("Correo electrónico inválido"),
  password:    z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  city:        z.string().min(1, "Selecciona una ciudad"),
});

const step3Schema = z.object({
  address:      z.string().min(5, "Ingresa la dirección"),
  neighborhood: z.string().min(2, "Ingresa el barrio o colonia"),
  city:         z.string().min(1, "Selecciona una ciudad"),
  environment:  z.string().min(1, "Selecciona el ambiente del hogar"),
});

type Step1Data  = z.infer<typeof step1Schema>;
type Step3Data  = z.infer<typeof step3Schema>;
type FileUpload = { front: File | null; back: File | null; selfie: File | null };
interface Step3Result { formData: Step3Data; location: LocationData | null; }

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold mb-1" style={{ color: TOKEN.foreground }}>
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

function Microcopy({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs" style={{ color: TOKEN.muted }}>{children}</p>;
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
        background: TOKEN.bg,
        border: `1.5px solid ${error ? "#dc2626" : TOKEN.border}`,
        color: TOKEN.foreground,
        fontFamily: "inherit",
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = TOKEN.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${TOKEN.primary}22`;
        externalFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? "#dc2626" : TOKEN.border;
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
        background: TOKEN.bg,
        border: `1.5px solid ${error ? "#dc2626" : TOKEN.border}`,
        color: TOKEN.foreground,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = TOKEN.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${TOKEN.primary}22`;
        externalFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? "#dc2626" : TOKEN.border;
        e.currentTarget.style.boxShadow = "none";
        externalBlur?.(e);
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
const STEP_LABELS = ["Tu info", "Identidad", "Tu hogar", "Confirmación"];

function ProgressBar({ step }: { step: number }) {
  const pct = Math.round(((step + 1) / 4) * 100);
  return (
    <div className="w-full mb-8">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: i <= step ? TOKEN.primary : TOKEN.mutedBg,
                color: i <= step ? "#fff" : TOKEN.muted,
              }}
            >
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span
              className="text-[10px] font-medium text-center leading-tight hidden sm:block"
              style={{ color: i <= step ? TOKEN.primary : TOKEN.muted }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      {/* Track */}
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: TOKEN.mutedBg }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: TOKEN.primary }}
        />
      </div>
      <p className="mt-2 text-xs text-right font-medium" style={{ color: TOKEN.muted }}>
        Paso {step + 1} de 4
      </p>
    </div>
  );
}

// ─── Navigation buttons ───────────────────────────────────────────────────────
function StepNav({
  step,
  onBack,
  onNext,
  nextLabel = "Continuar",
  loading = false,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-8 gap-3">
      {step > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
          style={{ background: TOKEN.mutedBg, color: TOKEN.muted }}
        >
          <ChevronLeft size={16} /> Volver
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all"
        style={{ background: loading ? TOKEN.muted : TOKEN.primary, minWidth: 140 }}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = TOKEN.primaryHover)}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = TOKEN.primary)}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {nextLabel} {!loading && <ChevronRight size={16} />}
      </button>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({
  label,
  file,
  onFile,
  accept = { "image/*": [] },
}: {
  label: string;
  file: File | null;
  onFile: (f: File) => void;
  accept?: Record<string, string[]>;
}) {
  const onDrop = useCallback((accepted: File[]) => { if (accepted[0]) onFile(accepted[0]); }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxFiles: 1 });
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div
      {...getRootProps()}
      className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-5 min-h-[120px]"
      style={{
        borderColor: isDragActive ? TOKEN.primary : TOKEN.border,
        background: isDragActive ? `${TOKEN.primary}11` : TOKEN.bg,
      }}
    >
      <input {...getInputProps()} />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="max-h-24 rounded-lg object-cover" />
      ) : (
        <>
          <Upload size={22} style={{ color: TOKEN.primary }} />
          <span className="text-xs font-semibold text-center" style={{ color: TOKEN.foreground }}>{label}</span>
          <span className="text-[11px]" style={{ color: TOKEN.muted }}>
            {isDragActive ? "Suelta aquí" : "Arrastra o toca para subir"}
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



// ─── STEP 1 ───────────────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: (data: Step1Data) => void }) {
  const [showPwd, setShowPwd] = useState(false);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { countryCode: "+503" },
  });

  const pwd = watch("password", "");
  const pwdStrength = pwd.length === 0 ? 0 : pwd.length < 6 ? 1 : pwd.length < 8 ? 2 : /[A-Z]/.test(pwd) && /\d/.test(pwd) ? 4 : 3;
  const pwdColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const pwdLabels = ["", "Muy débil", "Débil", "Buena", "Fuerte"];

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${TOKEN.primary}22` }}>
          <User size={18} style={{ color: TOKEN.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: TOKEN.foreground }}>Información básica</h2>
          <p className="text-sm" style={{ color: TOKEN.muted }}>Cuéntanos un poco sobre ti</p>
        </div>
      </div>

      {/* Full name */}
      <div className="mb-4">
        <Label htmlFor="fullName">Nombre completo</Label>
        <InputBase id="fullName" placeholder="Ej. María González" error={!!errors.fullName} {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <Label htmlFor="phone">Teléfono</Label>
        <div className="flex gap-2">
          <Controller
            name="countryCode"
            control={control}
            render={({ field }) => (
              <div style={{ width: 110, flexShrink: 0 }}>
                <SelectBase id="countryCode" error={!!errors.countryCode} {...field}>
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
        <Label htmlFor="email">Correo electrónico</Label>
        <InputBase id="email" type="email" placeholder="tucorreo@ejemplo.com" error={!!errors.email} {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Password */}
      <div className="mb-4">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <InputBase
            id="password"
            type={showPwd ? "text" : "password"}
            placeholder="Mín. 8 caracteres"
            error={!!errors.password}
            style={{ paddingRight: 44 }}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: TOKEN.muted }}
            aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {/* Strength meter */}
        {pwd.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {[1,2,3,4].map(i => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: i <= pwdStrength ? pwdColors[pwdStrength] : TOKEN.mutedBg }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: pwdColors[pwdStrength] }}>{pwdLabels[pwdStrength]}</span>
          </div>
        )}
        <FieldError message={errors.password?.message} />
      </div>

      {/* City */}
      <div className="mb-6">
        <Label htmlFor="city">Ciudad</Label>
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <SelectBase id="city" error={!!errors.city} {...field}>
              <option value="">Selecciona tu ciudad</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </SelectBase>
          )}
        />
        <FieldError message={errors.city?.message} />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all"
        style={{ background: TOKEN.primary }}
        onMouseEnter={e => e.currentTarget.style.background = TOKEN.primaryHover}
        onMouseLeave={e => e.currentTarget.style.background = TOKEN.primary}
      >
        Continuar <ChevronRight size={16} className="inline" />
      </button>
    </form>
  );
}

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
function Step2({
  files,
  setFiles,
  onBack,
  onNext,
}: {
  files: FileUpload;
  setFiles: React.Dispatch<React.SetStateAction<FileUpload>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!files.front || !files.back || !files.selfie) {
      setError("Por favor sube los tres documentos requeridos.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${TOKEN.primary}22` }}>
          <ShieldCheck size={18} style={{ color: TOKEN.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: TOKEN.foreground }}>Verificación de identidad</h2>
          <p className="text-sm" style={{ color: TOKEN.muted }}>Requerida para garantizar la seguridad de todos</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl p-4 mb-6" style={{ background: TOKEN.mutedBg }}>
        <Lock size={18} style={{ color: TOKEN.primary, flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm leading-relaxed" style={{ color: TOKEN.foreground }}>
          <span className="font-semibold">Tus datos están cifrados</span> y solo se usan para verificar tu identidad. Nunca los compartimos con terceros.
        </p>
      </div>

      {/* Upload zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>DUI / DNI / INE — Frente</Label>
          <UploadZone
            label="Parte frontal del documento"
            file={files.front}
            onFile={f => setFiles(prev => ({ ...prev, front: f }))}
          />
        </div>
        <div>
          <Label>DUI / DNI / INE — Reverso</Label>
          <UploadZone
            label="Parte trasera del documento"
            file={files.back}
            onFile={f => setFiles(prev => ({ ...prev, back: f }))}
          />
        </div>
      </div>

      <div className="mb-2">
        <Label>Selfie de verificación</Label>
        <UploadZone
          label="Tómate una foto con tu documento en mano"
          file={files.selfie}
          onFile={f => setFiles(prev => ({ ...prev, selfie: f }))}
        />
        <Microcopy>Asegúrate de que tu cara y el documento sean claramente visibles.</Microcopy>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 mt-3 text-sm font-medium text-red-600">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <StepNav step={1} onBack={onBack} onNext={handleNext} />
    </div>
  );
}

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
function Step3({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (result: Step3Result) => void;
}) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const city = watch("city", "");

  return (
    <form onSubmit={handleSubmit(data => onNext({ formData: data, location: locationData }))} noValidate>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${TOKEN.primary}22` }}>
          <Home size={18} style={{ color: TOKEN.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: TOKEN.foreground }}>Perfil del hogar</h2>
          <p className="text-sm" style={{ color: TOKEN.muted }}>Información sobre el espacio que compartirás</p>
        </div>
      </div>

      {/* Address */}
      <div className="mb-4">
        <Label htmlFor="address">Dirección</Label>
        <InputBase id="address" placeholder="Ej. Calle Los Pinos, Col. San Benito" error={!!errors.address} {...register("address")} />
        <Microcopy>Tu dirección exacta nunca se muestra públicamente.</Microcopy>
        <FieldError message={errors.address?.message} />
      </div>

      {/* Neighborhood */}
      <div className="mb-4">
        <Label htmlFor="neighborhood">Barrio / Colonia</Label>
        <InputBase id="neighborhood" placeholder="Ej. Escalón, Miraflores" error={!!errors.neighborhood} {...register("neighborhood")} />
        <FieldError message={errors.neighborhood?.message} />
      </div>

      {/* City */}
      <div className="mb-4">
        <Label htmlFor="cityStep3">Ciudad</Label>
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <SelectBase id="cityStep3" error={!!errors.city} {...field}>
              <option value="">Selecciona tu ciudad</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </SelectBase>
          )}
        />
        <FieldError message={errors.city?.message} />
      </div>

      {/* Environment radio cards */}
      <div className="mb-4">
        <Label>Ambiente del hogar</Label>
        <Controller
          name="environment"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3 mt-1">
              {ENVIRONMENTS.map(e => {
                const selected = field.value === e.value;
                return (
                  <button
                    type="button"
                    key={e.value}
                    onClick={() => field.onChange(e.value)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-4 border-2 transition-all text-center"
                    style={{
                      borderColor: selected ? TOKEN.primary : TOKEN.border,
                      background: selected ? `${TOKEN.primary}12` : TOKEN.bg,
                    }}
                    aria-pressed={selected}
                  >
                    <span className="text-2xl" role="img" aria-label={e.label}>{e.icon}</span>
                    <span className="text-xs font-semibold leading-tight" style={{ color: selected ? TOKEN.primary : TOKEN.foreground }}>
                      {e.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        <FieldError message={errors.environment?.message} />
      </div>

      {/* Map */}
      <div className="mb-2">
        <Label>Fija tu ubicación en el mapa</Label>
        <p className="text-xs mb-2" style={{ color: TOKEN.muted }}>
          Arrastra el marcador o busca tu dirección. Solo se muestra un radio aproximado a los inquilinos.
        </p>
        <LocationPicker
          initialCity={city}
          onLocationChange={setLocationData}
        />
      </div>

      <div className="flex items-center justify-between mt-8 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
          style={{ background: TOKEN.mutedBg, color: TOKEN.muted }}
        >
          <ChevronLeft size={16} /> Volver
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: TOKEN.primary, minWidth: 140 }}
          onMouseEnter={e => e.currentTarget.style.background = TOKEN.primaryHover}
          onMouseLeave={e => e.currentTarget.style.background = TOKEN.primary}
        >
          Continuar <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
}

// ─── STEP 4 ───────────────────────────────────────────────────────────────────
function Step4({
  step1,
  step3,
  location,
  onBack,
}: {
  step1: Step1Data;
  step3: Step3Data;
  location: LocationData | null;
  onBack: () => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const [termError, setTermError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async () => {
    if (!accepted) { setTermError(true); return; }
    setTermError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...step1, ...step3, location }),
      });
      const json = await res.json();
      if (json.success) setDone(true);
      else setServerError(json.message || "Error desconocido.");
    } catch {
      setServerError("No pudimos conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: `${TOKEN.primary}20` }}
        >
          <CheckCircle2 size={40} style={{ color: TOKEN.primary }} />
        </div>
        <h2 className="text-2xl font-bold font-serif" style={{ color: TOKEN.foreground }}>¡Perfil activado!</h2>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: TOKEN.muted }}>
          Tu cuenta está en revisión. Te notificaremos en menos de 24 horas para que puedas comenzar a publicar tu habitación.
        </p>
        <a
          href="/"
          className="mt-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: TOKEN.primary }}
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-3 py-2.5" style={{ borderBottom: `1px solid ${TOKEN.border}` }}>
      <span className="text-xs font-semibold" style={{ color: TOKEN.muted }}>{label}</span>
      <span className="text-xs font-medium text-right" style={{ color: TOKEN.foreground }}>{value || "—"}</span>
    </div>
  );

  const env = ENVIRONMENTS.find(e => e.value === step3.environment);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${TOKEN.primary}22` }}>
          <CheckCircle2 size={18} style={{ color: TOKEN.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: TOKEN.foreground }}>Confirmación</h2>
          <p className="text-sm" style={{ color: TOKEN.muted }}>Revisa tu información antes de activar tu perfil</p>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: TOKEN.secondary, border: `1.5px solid ${TOKEN.border}` }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: TOKEN.muted }}>Datos personales</p>
        <Row label="Nombre" value={step1.fullName} />
        <Row label="Teléfono" value={`${step1.countryCode} ${step1.phone}`} />
        <Row label="Correo" value={step1.email} />
        <Row label="Ciudad" value={step1.city} />
        <p className="text-xs font-bold uppercase tracking-wider mt-4 mb-3" style={{ color: TOKEN.muted }}>Perfil del hogar</p>
        <Row label="Dirección" value={step3.address} />
        <Row label="Barrio / Colonia" value={step3.neighborhood} />
        <Row label="Ciudad" value={step3.city} />
        <Row label="Ambiente" value={env ? `${env.icon} ${env.label}` : step3.environment} />
        {location && (
          <Row
            label="Ubicación (privada)"
            value={`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}${location.neighborhood ? ` · ${location.neighborhood}` : ""}`}
          />
        )}
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer mb-1">
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => { setAccepted(e.target.checked); if (e.target.checked) setTermError(false); }}
          className="mt-0.5 w-4 h-4 rounded accent-primary flex-shrink-0"
          style={{ accentColor: TOKEN.primary }}
        />
        <span className="text-sm leading-relaxed" style={{ color: TOKEN.foreground }}>
          Acepto los{" "}
          <a href="#" className="underline font-semibold" style={{ color: TOKEN.primary }}>
            Términos y Condiciones
          </a>{" "}
          y la{" "}
          <a href="#" className="underline font-semibold" style={{ color: TOKEN.primary }}>
            Política de Privacidad
          </a>{" "}
          de Nidoo.
        </span>
      </label>
      {termError && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-red-600 mb-2 mt-1">
          <AlertCircle size={14} /> Debes aceptar los términos para continuar.
        </p>
      )}
      {serverError && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-red-600 mb-2 mt-1">
          <AlertCircle size={14} /> {serverError}
        </p>
      )}

      <StepNav
        step={3}
        onBack={onBack}
        onNext={handleSubmit}
        nextLabel={loading ? "Activando…" : "Activar mi perfil"}
        loading={loading}
      />
    </div>
  );
}

// ─── ROOT CONTROLLER ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep]         = useState(0);
  const [step1Data, setStep1Data]   = useState<Step1Data | null>(null);
  const [step3Data, setStep3Data]   = useState<Step3Data | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [files, setFiles]       = useState<FileUpload>({ front: null, back: null, selfie: null });
  const cardRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const next = () => { setStep(s => s + 1); scrollTop(); };
  const back = () => { setStep(s => s - 1); scrollTop(); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: TOKEN.bg }}>
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: TOKEN.border, background: TOKEN.card }}>
        <a href="/" className="font-serif font-bold text-xl tracking-tight" style={{ color: TOKEN.primary }}>
          Nidoo
        </a>
        <span className="text-xs font-medium rounded-full px-3 py-1" style={{ background: TOKEN.mutedBg, color: TOKEN.muted }}>
          Registro propietario
        </span>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div
          ref={cardRef}
          className="w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-lg"
          style={{ background: TOKEN.card, border: `1.5px solid ${TOKEN.border}` }}
        >
          <ProgressBar step={step} />

          {step === 0 && (
            <Step1
              onNext={data => { setStep1Data(data); next(); }}
            />
          )}
          {step === 1 && (
            <Step2
              files={files}
              setFiles={setFiles}
              onBack={back}
              onNext={next}
            />
          )}
          {step === 2 && (
            <Step3
              onBack={back}
              onNext={({ formData, location }) => {
                setStep3Data(formData);
                setLocationData(location);
                next();
              }}
            />
          )}
          {step === 3 && step1Data && step3Data && (
            <Step4
              step1={step1Data}
              step3={step3Data}
              location={locationData}
              onBack={back}
            />
          )}
        </div>
      </div>
    </div>
  );
}
