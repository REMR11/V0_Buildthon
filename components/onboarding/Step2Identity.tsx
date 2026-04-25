"use client";

import { useState } from "react";
import { ShieldCheck, CreditCard, Camera } from "lucide-react";
import { Card, Field, Select, UploadZone, StepNav } from "./primitives";

const ID_TYPES = [
  { value: "dui", label: "DUI (El Salvador)" },
  { value: "dni", label: "DNI (Perú / Argentina)" },
  { value: "ine", label: "INE / IFE (México)" },
  { value: "cedula", label: "Cédula de Ciudadanía (Colombia)" },
  { value: "cedula_identidad", label: "Cédula de Identidad (Chile / Bolivia / Uruguay)" },
  { value: "pasaporte", label: "Pasaporte" },
];

export interface Step2Data {
  idType: string;
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
}

interface Step2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

function validate(data: Step2Data) {
  const errors: Partial<Record<keyof Step2Data, string>> = {};
  if (!data.idType) errors.idType = "Selecciona el tipo de documento";
  if (!data.idFront) errors.idFront = "Sube la parte frontal de tu documento";
  if (!data.idBack) errors.idBack = "Sube la parte trasera de tu documento";
  if (!data.selfie) errors.selfie = "Sube una selfie para verificar tu identidad";
  return errors;
}

export default function Step2Identity({ data, onChange, onNext, onBack }: Step2Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof Step2Data, boolean>>>({});

  const set = <K extends keyof Step2Data>(key: K, value: Step2Data[K]) => {
    onChange({ ...data, [key]: value });
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleNext = () => {
    setTouched({ idType: true, idFront: true, idBack: true, selfie: true });
    const errors = validate(data);
    if (Object.keys(errors).length === 0) onNext();
  };

  const errors = validate(data);
  const showError = (k: keyof Step2Data) => (touched[k] ? errors[k] : undefined);

  return (
    <Card>
      <div className="flex flex-col gap-6">
        {/* Encryption notice */}
        <div className="flex items-start gap-3 bg-secondary rounded-xl p-4">
          <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            Tus datos están cifrados y solo se usan para verificar tu identidad. Nunca se comparten con terceros.
          </p>
        </div>

        {/* Document type */}
        <Field
          label="Tipo de documento"
          htmlFor="idType"
          required
          error={showError("idType")}
        >
          <div className="relative">
            <Select
              id="idType"
              value={data.idType}
              onChange={(e) => set("idType", e.target.value)}
              error={!!showError("idType")}
            >
              <option value="">Selecciona tu documento</option>
              {ID_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </Field>

        {/* ID front & back */}
        <div>
          <p className="text-sm font-semibold text-foreground/80 mb-3">
            Foto del documento <span className="text-primary">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <UploadZone
              label="Parte frontal"
              value={data.idFront}
              onChange={(f) => set("idFront", f)}
              error={showError("idFront")}
              icon={<CreditCard size={24} />}
            />
            <UploadZone
              label="Parte trasera"
              value={data.idBack}
              onChange={(f) => set("idBack", f)}
              error={showError("idBack")}
              icon={<CreditCard size={24} />}
            />
          </div>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            Asegúrate de que el texto sea legible y la foto tenga buena iluminación.
          </p>
        </div>

        {/* Selfie */}
        <Field
          label="Selfie de verificación"
          required
          error={showError("selfie")}
          hint="Tómate una foto sosteniendo tu documento junto a tu cara, con buena luz."
        >
          <UploadZone
            label="Subir selfie con documento"
            value={data.selfie}
            onChange={(f) => set("selfie", f)}
            error={showError("selfie")}
            icon={<Camera size={24} />}
          />
        </Field>

        {/* Tips */}
        <div className="bg-muted-bg rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground/70 mb-2">Consejos para una buena verificación:</p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Usa buena iluminación, evita sombras sobre el documento.",
              "El texto del documento debe ser completamente legible.",
              "En la selfie, mantén el documento al nivel del rostro.",
              "No uses filtros ni edites las fotos.",
            ].map((tip) => (
              <li key={tip} className="text-xs text-muted flex items-start gap-1.5">
                <span className="text-primary mt-0.5 shrink-0">&#x2022;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} />
    </Card>
  );
}
