// ---------------------------------------------------------------------------
// lib/id-validation.ts
//
// Client-side orchestrator for identity verification.
// Calls the unified /api/verify/identity endpoint which runs:
//   1. Eden AI OCR (document readability, expiry, age)
//   2. Levenshtein name match (returns nameWarning, non-blocking)
//   3. AWS Rekognition face comparison (similarity >= 85)
//   4. AWS Rekognition liveness detection
//
// Raw images are never processed here — only FormData upload to the server.
// ---------------------------------------------------------------------------

export interface VerificationResult {
  idFrontFile: File;
  idBackFile: File;
  selfieFile: File;
  extractedData: {
    documentNumber: string;
    fullName: string;
    expiryDate: string;
    birthDate: string;
  };
  faceMatchScore: number;
  livenessDetected: boolean;
  overallApproved: boolean;
  nameWarning?: boolean;
  failureReason?: string;
  manualReview?: boolean;
}

// ---------------------------------------------------------------------------
// Main exported function — matches spec signature
// ---------------------------------------------------------------------------
export async function validateIdentity(
  idFront: File,
  idBack: File,
  selfie: File,
  registeredName: string,
): Promise<VerificationResult> {
  const body = new FormData();
  body.append("front", idFront);
  body.append("back", idBack);
  body.append("selfie", selfie);
  body.append("registeredName", registeredName);

  let res: Response;
  try {
    res = await fetch("/api/verify/identity", { method: "POST", body });
  } catch {
    return makeFailure(idFront, idBack, selfie, "Error de conexion. Verifica tu internet e intenta de nuevo.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      idFrontFile:    idFront,
      idBackFile:     idBack,
      selfieFile:     selfie,
      extractedData:  data.extractedData ?? emptyExtracted(),
      faceMatchScore: data.faceMatchScore ?? 0,
      livenessDetected: data.livenessDetected ?? false,
      overallApproved:  false,
      nameWarning:      data.nameWarning ?? false,
      failureReason:    data.failureReason ?? data.error ?? "La verificacion fallo. Intenta de nuevo.",
    };
  }

  return {
    idFrontFile:      idFront,
    idBackFile:       idBack,
    selfieFile:       selfie,
    extractedData:    data.extractedData ?? emptyExtracted(),
    faceMatchScore:   data.faceMatchScore ?? 0,
    livenessDetected: data.livenessDetected ?? false,
    overallApproved:  data.approved ?? false,
    nameWarning:      data.nameWarning ?? false,
  };
}

// ---------------------------------------------------------------------------
// Backwards-compatible alias (used by existing IdentityVerificationStep calls
// that don't yet pass registeredName — will be updated in the next step).
// ---------------------------------------------------------------------------
export async function validateIdDocument(
  idFront: File,
  idBack: File,
  selfie: File,
): Promise<VerificationResult> {
  return validateIdentity(idFront, idBack, selfie, "");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function emptyExtracted() {
  return { documentNumber: "", fullName: "", expiryDate: "", birthDate: "" };
}

function makeFailure(
  idFront: File,
  idBack: File,
  selfie: File,
  failureReason: string,
): VerificationResult {
  return {
    idFrontFile:      idFront,
    idBackFile:       idBack,
    selfieFile:       selfie,
    extractedData:    emptyExtracted(),
    faceMatchScore:   0,
    livenessDetected: false,
    overallApproved:  false,
    failureReason,
  };
}
