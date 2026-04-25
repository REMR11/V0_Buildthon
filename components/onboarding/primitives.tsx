"use client";

import React from "react";
import { ChevronLeft, Eye, EyeOff, Upload, CheckCircle2, AlertCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Progress Bar
// ---------------------------------------------------------------------------
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isActive
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-muted-bg text-muted"
                }`}
              >
                {isCompleted ? <CheckCircle2 size={14} /> : stepNum}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block text-center leading-tight ${
                  isActive ? "text-primary" : isCompleted ? "text-foreground/70" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Track */}
      <div className="relative h-1.5 bg-muted-bg rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      <p className="text-xs text-muted mt-2 text-right">
        Paso {currentStep} de {totalSteps}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step Shell (centered card wrapper)
// ---------------------------------------------------------------------------
interface StepShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StepShell({ title, subtitle, children }: StepShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="px-5 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
        <a href="/" className="flex items-center gap-2 w-fit">
          <span className="text-xl font-bold font-serif text-primary tracking-tight">nidoo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
        </a>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground leading-snug text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted leading-relaxed">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------
interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground/80">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted flex items-start gap-1 leading-relaxed">
          <span className="mt-0.5 shrink-0 text-primary/60">&#x2022;</span>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text input
// ---------------------------------------------------------------------------
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-background placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
        error
          ? "border-red-400 focus:ring-red-300"
          : "border-border focus:border-primary"
      } ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ---------------------------------------------------------------------------
// Password input
// ---------------------------------------------------------------------------
export function PasswordInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} error={error} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer ${
        error
          ? "border-red-400 focus:ring-red-300"
          : "border-border focus:border-primary"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-background placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none ${
        error
          ? "border-red-400 focus:ring-red-300"
          : "border-border focus:border-primary"
      } ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// ---------------------------------------------------------------------------
// Upload zone
// ---------------------------------------------------------------------------
interface UploadZoneProps {
  label: string;
  accept?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  icon?: React.ReactNode;
}

export function UploadZone({ label, accept = "image/*", value, onChange, error, icon }: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFile = (file: File | null) => {
    if (file && file.type.startsWith("image/")) onChange(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`w-full rounded-xl border-2 border-dashed px-4 py-6 flex flex-col items-center gap-2 transition-all cursor-pointer text-center ${
          dragging
            ? "border-primary bg-primary/5"
            : value
            ? "border-primary/50 bg-primary/5"
            : error
            ? "border-red-400 bg-red-50"
            : "border-border hover:border-primary/50 hover:bg-muted-bg/50"
        }`}
      >
        {value ? (
          <>
            {/* Preview */}
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(value)}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-primary">{value.name}</span>
            <span className="text-xs text-muted">Toca para cambiar</span>
          </>
        ) : (
          <>
            <div className="text-muted">{icon ?? <Upload size={24} />}</div>
            <span className="text-sm font-semibold text-foreground/80">{label}</span>
            <span className="text-xs text-muted">JPG, PNG — máx. 10 MB</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Nav buttons (Back / Next)
// ---------------------------------------------------------------------------
interface StepNavProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isLastStep?: boolean;
  disabled?: boolean;
}

export function StepNav({ onBack, onNext, nextLabel, isLastStep, disabled }: StepNavProps) {
  return (
    <div className={`flex gap-3 mt-6 ${onBack ? "justify-between" : "justify-end"}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border text-sm font-semibold text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all"
        >
          <ChevronLeft size={16} />
          Atrás
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="flex-1 sm:flex-none sm:min-w-[160px] px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {nextLabel ?? (isLastStep ? "Activar mi perfil" : "Continuar")}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phone input with LATAM country code selector
// ---------------------------------------------------------------------------
const LATAM_CODES = [
  { code: "+503", country: "SV", flag: "🇸🇻", name: "El Salvador" },
  { code: "+52",  country: "MX", flag: "🇲🇽", name: "México" },
  { code: "+57",  country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+56",  country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+54",  country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+51",  country: "PE", flag: "🇵🇪", name: "Perú" },
  { code: "+58",  country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
  { code: "+504", country: "HN", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", country: "NI", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+506", country: "CR", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+507", country: "PA", flag: "🇵🇦", name: "Panamá" },
  { code: "+53",  country: "CU", flag: "🇨🇺", name: "Cuba" },
  { code: "+1787", country: "PR", flag: "🇵🇷", name: "Puerto Rico" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+591", country: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "+595", country: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "+598", country: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "+1809", country: "DO", flag: "🇩🇴", name: "Rep. Dominicana" },
];

interface PhoneInputProps {
  dialCode: string;
  phone: string;
  onDialChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  error?: boolean;
}

export function PhoneInput({ dialCode, phone, onDialChange, onPhoneChange, error }: PhoneInputProps) {
  return (
    <div className={`flex rounded-xl border overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/30 ${error ? "border-red-400" : "border-border focus-within:border-primary"}`}>
      <select
        value={dialCode}
        onChange={(e) => onDialChange(e.target.value)}
        className="shrink-0 bg-muted-bg border-r border-border px-3 py-3 text-sm font-semibold focus:outline-none cursor-pointer appearance-none"
        aria-label="Código de país"
      >
        {LATAM_CODES.map((c) => (
          <option key={c.country} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
        placeholder="7890 1234"
        className="flex-1 px-4 py-3 text-sm font-medium bg-background placeholder:text-muted/60 focus:outline-none"
        inputMode="numeric"
        maxLength={12}
      />
    </div>
  );
}
