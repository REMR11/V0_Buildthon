"use client";

import { useState } from "react";
import { ProgressBar, StepShell } from "./primitives";
import Step1BasicInfo, { type Step1Data } from "./Step1BasicInfo";
import Step2Identity, { type Step2Data } from "./Step2Identity";
import Step3HouseProfile, { type Step3Data } from "./Step3HouseProfile";
import Step4Confirmation from "./Step4Confirmation";

const STEP_LABELS = ["Tu cuenta", "Identidad", "Tu hogar", "Confirmar"];

const STEP_TITLES: Record<number, { title: string; subtitle?: string }> = {
  1: {
    title: "Crea tu cuenta de propietario",
    subtitle: "Empieza a alquilar tu cuarto de forma segura y con contrato digital.",
  },
  2: {
    title: "Verifica tu identidad",
    subtitle: "Este paso protege tanto a inquilinos como a ti. Solo lo hacemos una vez.",
  },
  3: {
    title: "Cuéntanos sobre tu hogar",
    subtitle: "Ayuda a los inquilinos a entender cómo es vivir contigo.",
  },
  4: {
    title: "Revisa y confirma",
    subtitle: "Verifica que todo esté correcto antes de activar tu perfil.",
  },
};

const defaultStep1: Step1Data = {
  fullName: "",
  dialCode: "+503",
  phone: "",
  email: "",
  password: "",
  city: "",
};

const defaultStep2: Step2Data = {
  idType: "",
  idFront: null,
  idBack: null,
  selfie: null,
};

const defaultStep3: Step3Data = {
  address: "",
  neighborhood: "",
  city: "",
  environment: "",
  description: "",
};

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<Step1Data>(defaultStep1);
  const [step2, setStep2] = useState<Step2Data>(defaultStep2);
  const [step3, setStep3] = useState<Step3Data>(defaultStep3);

  const { title, subtitle } = STEP_TITLES[step] ?? STEP_TITLES[1];

  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <StepShell title={title} subtitle={subtitle}>
      <ProgressBar currentStep={step} totalSteps={4} labels={STEP_LABELS} />

      {step === 1 && (
        <Step1BasicInfo data={step1} onChange={setStep1} onNext={goNext} />
      )}
      {step === 2 && (
        <Step2Identity data={step2} onChange={setStep2} onNext={goNext} onBack={goBack} />
      )}
      {step === 3 && (
        <Step3HouseProfile data={step3} onChange={setStep3} onNext={goNext} onBack={goBack} />
      )}
      {step === 4 && (
        <Step4Confirmation
          step1={step1}
          step2={step2}
          step3={step3}
          onBack={goBack}
          onSubmit={() => {
            // In production: POST to /api/registro
            console.log("[v0] Onboarding submitted", { step1, step3 });
          }}
        />
      )}
    </StepShell>
  );
}
