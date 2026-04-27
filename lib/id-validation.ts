// ---------------------------------------------------------------------------
// lib/id-validation.ts
//
// Client-side orchestrator for identity verification.
// All heavy lifting (OCR, face-match, liveness) is done server-side.
// This module never processes identity documents in the browser.
//
// OCR provider:  Eden AI (amazon backend) — https://www.edenai.co/
// Face provider: AWS Rekognition CompareFaces + DetectFaces
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
  failureReason?: string;
  manualReview?: boolean;
}

// ---------------------------------------------------------------------------
// Step 1 — OCR
// ---------------------------------------------------------------------------
async function runOcr(
  frontFile: File,
  backFile: File,
): Promise<{
  documentNumber: string;
  fullName: string;
  expiryDate: string;
  birthDate: string;
}> {
  const body = new FormData();
  body.append("front", frontFile);
  body.append("back", backFile);

  const res = await fetch("/api/verify/ocr", { method: "POST", body });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error de OCR" }));
    throw new OcrError(err.error ?? "No pudimos leer el documento.");
  }

  const data = await res.json();
  return {
    documentNumber: data.documentNumber ?? "",
    fullName:       data.fullName ?? "",
    expiryDate:     data.expiryDate ?? "",
    birthDate:      data.birthDate ?? "",
  };
}

// ---------------------------------------------------------------------------
// Steps 2 & 3 — Face match + liveness
// ---------------------------------------------------------------------------
async function runFaceMatch(
  docFront: File,
  selfie: File,
): Promise<{ similarity: number; livenessDetected: boolean }> {
  const body = new FormData();
  body.append("document", docFront);
  body.append("selfie", selfie);

  const res = await fetch("/api/verify/face-match", { method: "POST", body });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ reason: "Error de verificacion facial" }));
    throw new FaceMatchError(
      err.reason ?? "La selfie no coincide con la foto del documento.",
      err.similarity ?? 0,
      err.livenessDetected ?? false,
    );
  }

  const data = await res.json();
  return {
    similarity:      data.similarity ?? 0,
    livenessDetected: data.livenessDetected ?? false,
  };
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------
export async function validateIdDocument(
  frontFile: File,
  backFile: File,
  selfieFile: File,
): Promise<VerificationResult> {
  // ── Step 1: OCR ────────────────────────────────────────────────────────────
  let extractedData: VerificationResult["extractedData"];
  try {
    extractedData = await runOcr(frontFile, backFile);
  } catch (err) {
    const msg = err instanceof OcrError
      ? err.message
      : "No pudimos leer el documento. Asegurate de que este bien iluminado y sin obstrucciones.";
    return {
      idFrontFile: frontFile,
      idBackFile: backFile,
      selfieFile,
      extractedData: { documentNumber: "", fullName: "", expiryDate: "", birthDate: "" },
      faceMatchScore: 0,
      livenessDetected: false,
      overallApproved: false,
      failureReason: msg,
    };
  }

  // ── Step 2 + 3: Face match & liveness ─────────────────────────────────────
  let faceMatchScore = 0;
  let livenessDetected = false;
  try {
    const fm = await runFaceMatch(frontFile, selfieFile);
    faceMatchScore = fm.similarity;
    livenessDetected = fm.livenessDetected;
  } catch (err) {
    const reason = err instanceof FaceMatchError ? err.message : "Error en verificacion facial.";
    const score  = err instanceof FaceMatchError ? err.similarity : 0;
    const live   = err instanceof FaceMatchError ? err.livenessDetected : false;
    return {
      idFrontFile: frontFile,
      idBackFile: backFile,
      selfieFile,
      extractedData,
      faceMatchScore: score,
      livenessDetected: live,
      overallApproved: false,
      failureReason: reason,
    };
  }

  // ── Overall decision ───────────────────────────────────────────────────────
  const overallApproved = faceMatchScore >= 85 && livenessDetected;

  let failureReason: string | undefined;
  if (!overallApproved) {
    if (!livenessDetected) {
      failureReason =
        "No pudimos confirmar que eres una persona real. Intenta con mejor iluminacion.";
    } else if (faceMatchScore < 85) {
      failureReason = "La selfie no coincide con la foto del documento.";
    }
  }

  return {
    idFrontFile: frontFile,
    idBackFile: backFile,
    selfieFile,
    extractedData,
    faceMatchScore,
    livenessDetected,
    overallApproved,
    failureReason,
  };
}

// ---------------------------------------------------------------------------
// Custom error classes
// ---------------------------------------------------------------------------
class OcrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OcrError";
  }
}

class FaceMatchError extends Error {
  similarity: number;
  livenessDetected: boolean;
  constructor(message: string, similarity: number, livenessDetected: boolean) {
    super(message);
    this.name = "FaceMatchError";
    this.similarity = similarity;
    this.livenessDetected = livenessDetected;
  }
}
