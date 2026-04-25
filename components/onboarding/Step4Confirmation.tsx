"use client";

import { useState } from "react";
import { CheckCircle2, User, Phone, Mail, MapPin, Home, ShieldCheck, FileText } from "lucide-react";
import { Card } from "./primitives";
import type { Step1Data } from "./Step1BasicInfo";
import type { Step2Data } from "./Step2Identity";
import type { Step3Data } from "./Step3HouseProfile";

const ID_TYPE_LABELS: Record<string, string> = {
  dui: "DUI (El Salvador)",
  dni: "DNI (Perú / Argentina)",
  ine: "INE / IFE (México)",
  cedula: "Cédula de Ciudadanía (Colombia)",
  cedula_identidad: "Cédula de Identidad",
  pasaporte: "Pasaporte",
};

const ENV_LABELS: Record<string, string> = {
  familia: "Familia con hijos",
  pareja: "Pareja",
  soltero: "Persona sola",
  solo: "Solo en casa",
};

interface Step4Props {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step4Confirmation({ step1, step2, step3, onBack, onSubmit }: Step4Props) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const handleSubmit = () => {
    if (!termsAccepted || !contractAccepted) {
      setTermsError(true);
      return;
    }
    setSubmitted(true);
    onSubmit();
  };

  if (submitted) {
    return <SuccessScreen name={step1.fullName} city={step1.city} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary card */}
      <Card>
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          Resumen de tu registro
        </h2>

        <div className="flex flex-col gap-4">
          {/* Personal info */}
          <SummarySection title="Información personal">
            <SummaryRow icon={<User size={14} />} label="Nombre" value={step1.fullName} />
            <SummaryRow icon={<Phone size={14} />} label="Teléfono" value={`${step1.dialCode} ${step1.phone}`} />
            <SummaryRow icon={<Mail size={14} />} label="Correo" value={step1.email} />
            <SummaryRow icon={<MapPin size={14} />} label="Ciudad" value={step1.city} />
          </SummarySection>

          <div className="border-t border-border" />

          {/* Identity */}
          <SummarySection title="Verificación de identidad">
            <SummaryRow icon={<ShieldCheck size={14} />} label="Documento" value={ID_TYPE_LABELS[step2.idType] ?? step2.idType} />
            <SummaryRow
              icon={<CheckCircle2 size={14} />}
              label="Fotos del documento"
              value={
                step2.idFront && step2.idBack
                  ? "Frontal y trasera subidas"
                  : step2.idFront
                  ? "Solo frontal subida"
                  : "Pendiente"
              }
              ok={!!(step2.idFront && step2.idBack)}
            />
            <SummaryRow
              icon={<CheckCircle2 size={14} />}
              label="Selfie"
              value={step2.selfie ? "Selfie subida" : "Pendiente"}
              ok={!!step2.selfie}
            />
          </SummarySection>

          <div className="border-t border-border" />

          {/* House profile */}
          <SummarySection title="Perfil del hogar">
            <SummaryRow icon={<MapPin size={14} />} label="Colonia / Barrio" value={step3.neighborhood} />
            <SummaryRow icon={<MapPin size={14} />} label="Ciudad" value={step3.city} />
            <SummaryRow icon={<Home size={14} />} label="Ambiente" value={ENV_LABELS[step3.environment] ?? step3.environment} />
            {step3.description && (
              <div className="mt-1 bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted font-medium mb-1">Descripción:</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{step3.description}</p>
              </div>
            )}
          </SummarySection>
        </div>
      </Card>

      {/* Terms */}
      <Card>
        <div className="flex flex-col gap-3">
          <CheckboxField
            id="terms"
            checked={termsAccepted}
            onChange={setTermsAccepted}
            error={termsError && !termsAccepted}
          >
            Acepto los{" "}
            <a href="#" className="text-primary underline hover:text-primary-hover">
              Términos y Condiciones
            </a>{" "}
            y la{" "}
            <a href="#" className="text-primary underline hover:text-primary-hover">
              Política de Privacidad
            </a>{" "}
            de Nidoo.
          </CheckboxField>

          <CheckboxField
            id="contract"
            checked={contractAccepted}
            onChange={setContractAccepted}
            error={termsError && !contractAccepted}
          >
            Entiendo que Nidoo facilita contratos de arrendamiento digitales con validez legal en mi país.
          </CheckboxField>

          {termsError && (!termsAccepted || !contractAccepted) && (
            <p className="text-xs text-red-500">
              Debes aceptar ambas condiciones para continuar.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border text-sm font-semibold text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Atrás
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all"
          >
            Activar mi perfil
          </button>
        </div>

        <p className="text-xs text-muted text-center mt-3 leading-relaxed">
          Tu cuenta será revisada en un plazo de 24 horas. Te notificaremos por correo cuando esté activa.
        </p>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2.5">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted mt-0.5 shrink-0">{icon}</span>
      <span className="text-xs text-muted font-medium w-28 shrink-0">{label}</span>
      <span className={`text-sm font-medium leading-snug ${ok === false ? "text-red-500" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function CheckboxField({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
        checked
          ? "border-primary/40 bg-primary/5"
          : error
          ? "border-red-400 bg-red-50/50"
          : "border-border hover:border-primary/30"
      }`}
    >
      <div className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            checked ? "bg-primary border-primary" : error ? "border-red-400" : "border-border"
          }`}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-foreground/80 leading-relaxed">{children}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Success screen
// ---------------------------------------------------------------------------
function SuccessScreen({ name, city }: { name: string; city: string }) {
  const firstName = name.split(" ")[0];
  return (
    <Card className="text-center py-10">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-serif text-foreground">
            ¡Listo, {firstName}!
          </h2>
          <p className="text-muted mt-2 text-sm leading-relaxed max-w-xs mx-auto">
            Tu perfil ha sido enviado para revisión. En las próximas 24 horas recibirás un correo confirmando que tu cuenta en{" "}
            <span className="text-primary font-semibold">nidoo</span> está activa y lista para recibir inquilinos en {city}.
          </p>
        </div>

        <div className="w-full bg-secondary rounded-xl p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-muted mb-3">Próximos pasos</p>
          <ol className="flex flex-col gap-2.5">
            {[
              "Revisamos tu identidad y documento (24 h)",
              "Activamos tu perfil y cuarto",
              "Empieza a recibir solicitudes de inquilinos",
              "Firma contratos digitales desde la app",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <a
          href="/"
          className="w-full py-3 rounded-xl border border-border text-sm font-semibold text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all text-center"
        >
          Volver al inicio
        </a>
      </div>
    </Card>
  );
}
