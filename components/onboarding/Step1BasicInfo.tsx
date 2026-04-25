"use client";

import { useState } from "react";
import { Card, Field, Input, PasswordInput, Select, PhoneInput, StepNav } from "./primitives";

const LATAM_CITIES = [
  "San Salvador",
  "Santa Ana",
  "San Miguel",
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Bogotá",
  "Medellín",
  "Cali",
  "Santiago",
  "Lima",
  "Buenos Aires",
  "Caracas",
  "Ciudad de Guatemala",
  "Tegucigalpa",
  "Managua",
  "San José",
  "Ciudad de Panamá",
  "Quito",
  "La Paz",
  "Asunción",
  "Montevideo",
  "Santo Domingo",
];

export interface Step1Data {
  fullName: string;
  dialCode: string;
  phone: string;
  email: string;
  password: string;
  city: string;
}

interface Step1Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  onNext: () => void;
}

function validate(data: Step1Data) {
  const errors: Partial<Record<keyof Step1Data, string>> = {};
  if (!data.fullName.trim() || data.fullName.trim().split(" ").length < 2)
    errors.fullName = "Ingresa tu nombre completo (nombre y apellido)";
  if (!data.phone || data.phone.length < 7)
    errors.phone = "Ingresa un número de teléfono válido";
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Ingresa un correo electrónico válido";
  if (!data.password || data.password.length < 8)
    errors.password = "La contraseña debe tener al menos 8 caracteres";
  if (!data.city)
    errors.city = "Selecciona tu ciudad";
  return errors;
}

export default function Step1BasicInfo({ data, onChange, onNext }: Step1Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof Step1Data, boolean>>>({});

  const set = <K extends keyof Step1Data>(key: K, value: Step1Data[K]) => {
    onChange({ ...data, [key]: value });
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleNext = () => {
    const allTouched = Object.fromEntries(
      (Object.keys(data) as (keyof Step1Data)[]).map((k) => [k, true])
    ) as Partial<Record<keyof Step1Data, boolean>>;
    setTouched(allTouched);
    const errors = validate(data);
    if (Object.keys(errors).length === 0) onNext();
  };

  const errors = validate(data);
  const showError = (k: keyof Step1Data) => (touched[k] ? errors[k] : undefined);

  return (
    <Card>
      <div className="flex flex-col gap-5">
        {/* Full name */}
        <Field
          label="Nombre completo"
          htmlFor="fullName"
          required
          error={showError("fullName")}
        >
          <Input
            id="fullName"
            placeholder="Ej. María González Ramos"
            value={data.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            error={!!showError("fullName")}
            autoComplete="name"
          />
        </Field>

        {/* Phone */}
        <Field
          label="Teléfono"
          htmlFor="phone"
          required
          error={showError("phone")}
          hint="Solo para notificaciones urgentes. No se comparte con inquilinos."
        >
          <PhoneInput
            dialCode={data.dialCode}
            phone={data.phone}
            onDialChange={(code) => set("dialCode", code)}
            onPhoneChange={(phone) => set("phone", phone)}
            error={!!showError("phone")}
          />
        </Field>

        {/* Email */}
        <Field
          label="Correo electrónico"
          htmlFor="email"
          required
          error={showError("email")}
        >
          <Input
            id="email"
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            error={!!showError("email")}
            autoComplete="email"
          />
        </Field>

        {/* Password */}
        <Field
          label="Contraseña"
          htmlFor="password"
          required
          error={showError("password")}
          hint="Mínimo 8 caracteres. Usa letras y números para mayor seguridad."
        >
          <PasswordInput
            id="password"
            placeholder="Crea una contraseña segura"
            value={data.password}
            onChange={(e) => set("password", e.target.value)}
            error={!!showError("password")}
            autoComplete="new-password"
          />
          {/* Strength meter */}
          {data.password.length > 0 && (
            <PasswordStrength password={data.password} />
          )}
        </Field>

        {/* City */}
        <Field
          label="Ciudad donde está tu cuarto"
          htmlFor="city"
          required
          error={showError("city")}
        >
          <div className="relative">
            <Select
              id="city"
              value={data.city}
              onChange={(e) => set("city", e.target.value)}
              error={!!showError("city")}
            >
              <option value="">Selecciona tu ciudad</option>
              {LATAM_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </Field>
      </div>

      <StepNav onNext={handleNext} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Password strength indicator
// ---------------------------------------------------------------------------
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Muy débil", color: "bg-red-400" };
  if (score === 2) return { score, label: "Débil", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Regular", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Buena", color: "bg-lime-500" };
  return { score, label: "Excelente", color: "bg-green-500" };
}

function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  const bars = 5;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < score ? color : "bg-muted-bg"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted font-medium w-16 text-right">{label}</span>
    </div>
  );
}
