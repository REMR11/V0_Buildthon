import type { Metadata } from "next";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Registro de propietario — Nidoo",
  description:
    "Registra tu cuarto en Nidoo. Alquila de forma segura con contratos digitales y verificación de identidad.",
};

export default function RegistroPage() {
  return <OnboardingFlow />;
}
