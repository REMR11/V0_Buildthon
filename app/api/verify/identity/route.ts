import { NextRequest, NextResponse } from "next/server";
import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
  Attribute,
} from "@aws-sdk/client-rekognition";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Unified identity verification route
//
// Accepts multipart/form-data with:
//   front          — ID document front image
//   back           — ID document back image
//   selfie         — Selfie image
//   registeredName — Full name from step 1 (used for Levenshtein name check)
//
// Steps performed:
//   1. OCR via Eden AI identity_parser (front image)
//   2. Document not expired
//   3. Age >= 18
//   4. Name match (Levenshtein distance <= 4 → nameWarning if exceeded)
//   5. Face comparison via AWS Rekognition (similarity >= 85)
//   6. Liveness detection via AWS Rekognition DetectFaces
//
// Images are never stored in DB. Only SHA-256 hashes are returned.
// ---------------------------------------------------------------------------

// ── Types ──────────────────────────────────────────────────────────────────
interface EdenOcrResult {
  extracted_data?: Array<{
    fields?: Array<{ key: string; value: string }>;
  }>;
  items?: Array<{ value?: string; type?: string }>;
  status?: string;
  error?: { message: string };
}

export interface IdentityVerificationResponse {
  approved: boolean;
  nameWarning: boolean;
  failureReason?: string;
  extractedData: {
    documentNumber: string;
    fullName: string;
    expiryDate: string;
    birthDate: string;
  };
  faceMatchScore: number;
  livenessDetected: boolean;
  hashes: {
    front: string;
    back: string;
    selfie: string;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Document number patterns per country/doc type
const DOC_PATTERNS: RegExp[] = [
  /\b\d{8}-\d\b/,                            // El Salvador DUI
  /\b[A-Z]{6}\d{8}[HM][A-Z]{5}[A-Z0-9]\d\b/i, // México INE/CURP
  /\b\d{6,12}\b/,                            // Generic (Colombia, Chile, etc.)
];

function extractDocNumber(text: string): string {
  for (const pattern of DOC_PATTERNS) {
    const m = text.match(pattern);
    if (m) return m[0];
  }
  return "";
}

function extractDate(text: string, keywords: string[]): string {
  for (const kw of keywords) {
    const re = new RegExp(
      `${kw}[^\\d]*(\\d{1,2}[/\\-.]\\d{1,2}[/\\-.]\\d{2,4}|\\d{4}[/\\-.]\\d{1,2}[/\\-.]\\d{1,2})`,
      "i",
    );
    const m = text.match(re);
    if (m) return m[1];
  }
  const m = text.match(/\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})\b/);
  return m ? m[1] : "";
}

function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const parts = raw.split(/[/\-.]/);
  if (parts.length === 3) {
    const year  = parseInt(parts[2].length === 2 ? `20${parts[2]}` : parts[2]);
    const month = parseInt(parts[1]) - 1;
    const day   = parseInt(parts[0]);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// Simple Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function getRekognition(): RekognitionClient {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not configured");
  }
  return new RekognitionClient({ region, credentials: { accessKeyId, secretAccessKey } });
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const frontFile  = formData.get("front")          as File | null;
    const backFile   = formData.get("back")           as File | null;
    const selfieFile = formData.get("selfie")         as File | null;
    const regName    = (formData.get("registeredName") as string | null) ?? "";

    if (!frontFile || !backFile || !selfieFile) {
      return NextResponse.json(
        { error: "Se requieren el frente, reverso del documento y la selfie." },
        { status: 400 },
      );
    }

    // Size guard — 10 MB per image
    for (const [label, f] of [["frente", frontFile], ["reverso", backFile], ["selfie", selfieFile]] as const) {
      if (f.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `La imagen del ${label} supera el limite de 10 MB.` },
          { status: 413 },
        );
      }
    }

    const frontBuffer  = Buffer.from(await frontFile.arrayBuffer());
    const backBuffer   = Buffer.from(await backFile.arrayBuffer());
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());

    const hashes = {
      front:  sha256(frontBuffer),
      back:   sha256(backBuffer),
      selfie: sha256(selfieBuffer),
    };

    // ── Step 1: OCR ──────────────────────────────────────────────────────────
    const edenKey = process.env.EDENAI_API_KEY;
    if (!edenKey) {
      return NextResponse.json({ error: "Servicio OCR no configurado." }, { status: 503 });
    }

    const edenForm = new FormData();
    edenForm.append("providers", "amazon");
    edenForm.append("language", "es");
    edenForm.append(
      "file",
      new Blob([frontBuffer], { type: frontFile.type }),
      frontFile.name,
    );

    const edenRes = await fetch("https://api.edenai.run/v2/ocr/identity_parser", {
      method: "POST",
      headers: { Authorization: `Bearer ${edenKey}` },
      body: edenForm,
    });

    if (!edenRes.ok) {
      const errText = await edenRes.text();
      console.error("[v0] Eden AI error:", errText);
      return NextResponse.json(
        { error: "No pudimos leer el documento. Asegurate de que este bien iluminado y sin obstrucciones." },
        { status: 422 },
      );
    }

    const edenData: Record<string, EdenOcrResult> = await edenRes.json();

    let allText = "";
    const fields: Record<string, string> = {};
    for (const provider of Object.values(edenData)) {
      if (provider.status !== "success" || !provider.extracted_data) continue;
      for (const block of provider.extracted_data) {
        for (const field of block.fields ?? []) {
          const key = field.key?.toLowerCase() ?? "";
          const val = field.value ?? "";
          fields[key] = val;
          allText += ` ${val}`;
        }
      }
    }

    const documentNumber =
      extractDocNumber(allText) ||
      fields["document_id"] || fields["id_number"] || fields["cedula"] || "";

    const fullName =
      fields["last_name"] && fields["given_names"]
        ? `${fields["given_names"]} ${fields["last_name"]}`.trim()
        : fields["full_name"] || fields["nombre"] || "";

    const expiryDate =
      fields["expire_date"] || fields["expiry_date"] ||
      extractDate(allText, ["vence", "expira", "caducidad", "expiry", "expire"]);

    const birthDate =
      fields["date_of_birth"] || fields["birth_date"] ||
      extractDate(allText, ["nacimiento", "nacida", "dob", "birth"]);

    // Validation 1 — document readable
    if (!documentNumber) {
      return NextResponse.json(
        {
          approved: false,
          nameWarning: false,
          failureReason: "No pudimos leer el numero del documento. Asegurate de que este bien iluminado y sin obstrucciones.",
          extractedData: { documentNumber: "", fullName, expiryDate, birthDate },
          faceMatchScore: 0,
          livenessDetected: false,
          hashes,
        } satisfies IdentityVerificationResponse,
        { status: 422 },
      );
    }

    // Validation 2 — document not expired
    if (expiryDate) {
      const expiry = parseDate(expiryDate);
      if (expiry && expiry < new Date()) {
        return NextResponse.json(
          {
            approved: false,
            nameWarning: false,
            failureReason: "El documento esta vencido. Presenta un documento vigente.",
            extractedData: { documentNumber, fullName, expiryDate, birthDate },
            faceMatchScore: 0,
            livenessDetected: false,
            hashes,
          } satisfies IdentityVerificationResponse,
          { status: 422 },
        );
      }
    }

    // Validation 3 — age >= 18
    if (birthDate) {
      const dob = parseDate(birthDate);
      if (dob) {
        const ageYears = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (ageYears < 18) {
          return NextResponse.json(
            {
              approved: false,
              nameWarning: false,
              failureReason: "Debes ser mayor de 18 anos para registrarte.",
              extractedData: { documentNumber, fullName, expiryDate, birthDate },
              faceMatchScore: 0,
              livenessDetected: false,
              hashes,
            } satisfies IdentityVerificationResponse,
            { status: 422 },
          );
        }
      }
    }

    // Validation 4 — name match (non-blocking, returns nameWarning)
    let nameWarning = false;
    if (regName && fullName) {
      const dist = levenshtein(
        regName.toLowerCase().trim(),
        fullName.toLowerCase().trim(),
      );
      nameWarning = dist > 4;
    }

    // ── Steps 5 & 6: Face match + liveness ───────────────────────────────────
    let client: RekognitionClient;
    try {
      client = getRekognition();
    } catch {
      return NextResponse.json({ error: "Servicio de verificacion facial no configurado." }, { status: 503 });
    }

    // Step 5 — face comparison
    let faceMatchScore = 0;
    try {
      const compareRes = await client.send(
        new CompareFacesCommand({
          SourceImage: { Bytes: frontBuffer },
          TargetImage: { Bytes: selfieBuffer },
          SimilarityThreshold: 50,
        }),
      );
      faceMatchScore = compareRes.FaceMatches?.[0]?.Similarity ?? 0;
    } catch (err) {
      console.error("[v0] Rekognition CompareFaces error:", err);
      return NextResponse.json(
        {
          approved: false,
          nameWarning,
          failureReason: "La selfie no coincide con la foto del documento.",
          extractedData: { documentNumber, fullName, expiryDate, birthDate },
          faceMatchScore: 0,
          livenessDetected: false,
          hashes,
        } satisfies IdentityVerificationResponse,
        { status: 422 },
      );
    }

    if (faceMatchScore < 85) {
      return NextResponse.json(
        {
          approved: false,
          nameWarning,
          failureReason: "La selfie no coincide con la foto del documento.",
          extractedData: { documentNumber, fullName, expiryDate, birthDate },
          faceMatchScore,
          livenessDetected: false,
          hashes,
        } satisfies IdentityVerificationResponse,
        { status: 422 },
      );
    }

    // Step 6 — liveness
    let livenessDetected = false;
    try {
      const detectRes = await client.send(
        new DetectFacesCommand({
          Image: { Bytes: selfieBuffer },
          Attributes: [Attribute.ALL],
        }),
      );
      const face = detectRes.FaceDetails?.[0];
      if (face) {
        livenessDetected =
          (face.EyesOpen?.Value ?? false) &&
          (face.Quality?.Sharpness ?? 0) > 20 &&
          (face.Quality?.Brightness ?? 0) > 20 &&
          !(face.Sunglasses?.Value ?? false) &&
          (face.Confidence ?? 0) > 85;
      }
    } catch (err) {
      console.error("[v0] Rekognition DetectFaces error:", err);
      livenessDetected = false;
    }

    if (!livenessDetected) {
      return NextResponse.json(
        {
          approved: false,
          nameWarning,
          failureReason: "No pudimos confirmar que eres una persona real. Intenta con mejor iluminacion y sin filtros.",
          extractedData: { documentNumber, fullName, expiryDate, birthDate },
          faceMatchScore,
          livenessDetected: false,
          hashes,
        } satisfies IdentityVerificationResponse,
        { status: 422 },
      );
    }

    // ── All passed ────────────────────────────────────────────────────────────
    return NextResponse.json({
      approved: true,
      nameWarning,
      extractedData: { documentNumber, fullName, expiryDate, birthDate },
      faceMatchScore,
      livenessDetected: true,
      hashes,
    } satisfies IdentityVerificationResponse);
  } catch (err) {
    console.error("[v0] /api/verify/identity error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
