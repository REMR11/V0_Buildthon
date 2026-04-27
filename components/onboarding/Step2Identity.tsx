"use client";

// ---------------------------------------------------------------------------
// Step 2 — Verificacion de identidad (propietario flow)
//
// Delegates entirely to IdentityVerificationStep, which handles the 4
// sub-steps (front, back, selfie, result) and calls onNext when approved.
// ---------------------------------------------------------------------------

import IdentityVerificationStep, {
  type VerificationResult,
} from "./IdentityVerificationStep";

// Re-export Step2Data so OnboardingFlow still compiles without changes.
export interface Step2Data {
  idType: string;
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
  verificationResult?: VerificationResult | null;
}

interface Step2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
  registeredName?: string;
}

export default function Step2Identity({
  data,
  onChange,
  onNext,
  onBack,
  registeredName,
}: Step2Props) {
  const handleComplete = (result: VerificationResult) => {
    onChange({
      ...data,
      idFront: result.idFrontFile,
      idBack: result.idBackFile,
      selfie: result.selfieFile,
      verificationResult: result,
    });
    onNext();
  };

  return (
    <IdentityVerificationStep
      role="propietario"
      registeredName={registeredName}
      onComplete={handleComplete}
      onBack={onBack}
    />
  );
}
