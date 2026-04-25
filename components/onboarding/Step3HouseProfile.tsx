"use client";

import { useState } from "react";
import { EyeOff, Users, Heart, User, Home } from "lucide-react";
import { Card, Field, Input, Select, Textarea, StepNav } from "./primitives";

const LATAM_CITIES = [
  "San Salvador", "Santa Ana", "San Miguel",
  "Ciudad de México", "Guadalajara", "Monterrey",
  "Bogotá", "Medellín", "Cali",
  "Santiago", "Lima", "Buenos Aires",
  "Caracas", "Ciudad de Guatemala", "Tegucigalpa",
  "Managua", "San José", "Ciudad de Panamá",
  "Quito", "La Paz", "Asunción", "Montevideo", "Santo Domingo",
];

const HOME_ENVIRONMENTS = [
  {
    value: "familia",
    label: "Familia con hijos",
    description: "Hogar familiar, ambiente tranquilo",
    Icon: Users,
  },
  {
    value: "pareja",
    label: "Pareja",
    description: "Vivimos en pareja, sin hijos",
    Icon: Heart,
  },
  {
    value: "soltero",
    label: "Persona sola",
    description: "Vivo con más personas pero sin familia",
    Icon: User,
  },
  {
    value: "solo",
    label: "Solo en casa",
    description: "Eres el único habitante permanente",
    Icon: Home,
  },
];

export interface Step3Data {
  address: string;
  neighborhood: string;
  city: string;
  environment: string;
  description: string;
}

interface Step3Props {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
}

function validate(data: Step3Data) {
  const errors: Partial<Record<keyof Step3Data, string>> = {};
  if (!data.address.trim() || data.address.trim().length < 5)
    errors.address = "Ingresa la calle o referencia de tu propiedad";
  if (!data.neighborhood.trim())
    errors.neighborhood = "Ingresa el nombre de tu colonia o barrio";
  if (!data.city)
    errors.city = "Selecciona la ciudad";
  if (!data.environment)
    errors.environment = "Selecciona el ambiente del hogar";
  if (!data.description.trim() || data.description.trim().length < 20)
    errors.description = "Describe tu hogar con al menos 20 caracteres";
  return errors;
}

export default function Step3HouseProfile({ data, onChange, onNext, onBack }: Step3Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof Step3Data, boolean>>>({});

  const set = <K extends keyof Step3Data>(key: K, value: Step3Data[K]) => {
    onChange({ ...data, [key]: value });
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleNext = () => {
    setTouched({ address: true, neighborhood: true, city: true, environment: true, description: true });
    const errors = validate(data);
    if (Object.keys(errors).length === 0) onNext();
  };

  const errors = validate(data);
  const showError = (k: keyof Step3Data) => (touched[k] ? errors[k] : undefined);

  return (
    <Card>
      <div className="flex flex-col gap-5">
        {/* Address */}
        <Field
          label="Calle o referencia"
          htmlFor="address"
          required
          error={showError("address")}
          hint="Tu dirección exacta nunca se muestra públicamente. Los inquilinos solo ven la colonia y ciudad."
        >
          <div className="relative">
            <Input
              id="address"
              placeholder="Ej. Calle Principal, cerca del parque central"
              value={data.address}
              onChange={(e) => set("address", e.target.value)}
              error={!!showError("address")}
            />
            <EyeOff
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              aria-hidden
            />
          </div>
          {/* Privacy badge */}
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-2 mt-1">
            <EyeOff size={13} className="text-primary shrink-0" />
            <p className="text-xs text-foreground/70 font-medium">
              Tu dirección exacta nunca se muestra públicamente.
            </p>
          </div>
        </Field>

        {/* Neighborhood */}
        <Field
          label="Colonia / Barrio"
          htmlFor="neighborhood"
          required
          error={showError("neighborhood")}
          hint="Esta información sí se mostrará a posibles inquilinos para orientarse."
        >
          <Input
            id="neighborhood"
            placeholder="Ej. Colonia Escalón, Barrio San Jacinto"
            value={data.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
            error={!!showError("neighborhood")}
          />
        </Field>

        {/* City */}
        <Field
          label="Ciudad"
          htmlFor="houseCity"
          required
          error={showError("city")}
        >
          <div className="relative">
            <Select
              id="houseCity"
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

        {/* Home environment — visual selector */}
        <fieldset>
          <legend className="text-sm font-semibold text-foreground/80 mb-2">
            Ambiente del hogar <span className="text-primary">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2.5">
            {HOME_ENVIRONMENTS.map(({ value, label, description, Icon }) => {
              const isSelected = data.environment === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("environment", value)}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-muted-bg/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted-bg"}`}>
                    <Icon size={16} className={isSelected ? "text-primary" : "text-muted"} />
                  </div>
                  <span className={`text-sm font-semibold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {label}
                  </span>
                  <span className="text-xs text-muted leading-snug">{description}</span>
                </button>
              );
            })}
          </div>
          {showError("environment") && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span>&#9888;</span> {showError("environment")}
            </p>
          )}
        </fieldset>

        {/* Description */}
        <Field
          label="Descripción del ambiente"
          htmlFor="description"
          required
          error={showError("description")}
          hint="Describe el ambiente, reglas generales y qué tipo de persona encaja bien. Sé auténtico."
        >
          <Textarea
            id="description"
            placeholder="Ej. Somos una familia tranquila. Tenemos normas de silencio después de las 10 pm. Buscamos a alguien responsable y respetuoso..."
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            error={!!showError("description")}
            maxLength={400}
          />
          <p className="text-xs text-muted text-right">
            {data.description.length}/400
          </p>
        </Field>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} />
    </Card>
  );
}
