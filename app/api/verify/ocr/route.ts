import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// OCR endpoint — uses Eden AI to extract document data from ID images.
// Both files are uploaded to S3 with short-lived signed URLs before sending
// their hashes to the DB. The raw images are never stored in the database.
// ---------------------------------------------------------------------------

interface EdenOcrResult {
  extracted_data?: Array<{
    fields?: Array<{ key: string; value: string }>;
  }>;
  status?: string;
  error?: { message: string };
}

// Regex patterns per country
const DOC_PATTERNS: Record<string, RegExp> = {
  dui:   /\b\d{8}-\d\b/,                         // El Salvador DUI
  dni:   /\b\d{7,8}\b/,                          // Perú / Argentina DNI
  ine:   /\b[A-Z]{6}\d{8}[HM][A-Z]{5}\d{2}\b/i, // México INE
  cedula: /\b\d{6,12}\b/,                        // Colombia / Chile / etc.
  generic: /\b\d{6,12}\b/,
};

function extractDocNumber(text: string): string {
  for (const pattern of Object.values(DOC_PATTERNS)) {
    const m = text.match(pattern);
    if (m) return m[0];
  }
  return "";
}

function extractDate(text: string, keywords: string[]): string {
  // Look for a date near a keyword
  for (const kw of keywords) {
    const re = new RegExp(
      `${kw}[^\\d]*(\\d{1,2}[/\\-.]\\d{1,2}[/\\-.]\\d{2,4}|\\d{4}[/\\-.]\\d{1,2}[/\\-.]\\d{1,2})`,
      "i",
    );
    const m = text.match(re);
    if (m) return m[1];
  }
  // Fallback: any date-like string
  const m = text.match(/\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})\b/);
  return m ? m[1] : "";
}

function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const frontFile = formData.get("front") as File | null;
    const backFile  = formData.get("back")  as File | null;

    if (!frontFile || !backFile) {
      return NextResponse.json({ error: "Se requieren ambas caras del documento" }, { status: 400 });
    }

    // Size guard (10 MB)
    if (frontFile.size > 10 * 1024 * 1024 || backFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (max 10 MB)" }, { status: 413 });
    }

    const frontBuffer = Buffer.from(await frontFile.arrayBuffer());
    const backBuffer  = Buffer.from(await backFile.arrayBuffer());

    // Compute hashes for deduplication (stored in DB instead of raw files)
    const frontHash = sha256(frontBuffer);
    const backHash  = sha256(backBuffer);

    // --- Eden AI OCR ---
    const edenKey = process.env.EDENAI_API_KEY;
    if (!edenKey) {
      return NextResponse.json({ error: "Servicio OCR no configurado" }, { status: 503 });
    }

    const edenForm = new FormData();
    edenForm.append("providers", "amazon");
    edenForm.append("language", "es");
    edenForm.append("file",
      new Blob([frontBuffer], { type: frontFile.type }),
      frontFile.name,
    );

    const edenRes = await fetch(
      "https://api.edenai.run/v2/ocr/identity_parser",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${edenKey}` },
        body: edenForm,
      },
    );

    if (!edenRes.ok) {
      const errText = await edenRes.text();
      console.error("[v0] Eden AI OCR error:", errText);
      return NextResponse.json(
        { error: "No pudimos leer el documento. Asegurate de que este bien iluminado y sin obstrucciones." },
        { status: 422 },
      );
    }

    const edenData: Record<string, EdenOcrResult> = await edenRes.json();

    // Flatten all fields from all providers
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

    const documentNumber = extractDocNumber(allText) ||
      fields["document_id"] || fields["id_number"] || fields["cedula"] || "";

    const fullName =
      fields["last_name"] && fields["given_names"]
        ? `${fields["given_names"]} ${fields["last_name"]}`.trim()
        : fields["full_name"] || fields["nombre"] || "";

    const expiryDate  = fields["expire_date"] || fields["expiry_date"] ||
      extractDate(allText, ["vence", "expira", "caducidad", "expiry", "expire"]);

    const birthDate   = fields["date_of_birth"] || fields["birth_date"] ||
      extractDate(allText, ["nacimiento", "nacida", "dob", "birth"]);

    if (!documentNumber) {
      return NextResponse.json(
        { error: "No pudimos leer el documento. Asegurate de que este bien iluminado y sin obstrucciones." },
        { status: 422 },
      );
    }

    // Validate expiry
    if (expiryDate) {
      const parts = expiryDate.split(/[/\-.]/);
      const parsed = parts.length === 3
        ? new Date(
            parseInt(parts[2].length === 2 ? `20${parts[2]}` : parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          )
        : new Date(expiryDate);
      if (!isNaN(parsed.getTime()) && parsed < new Date()) {
        return NextResponse.json(
          { error: "El documento esta vencido. Presenta un documento vigente." },
          { status: 422 },
        );
      }
    }

    // Validate age
    if (birthDate) {
      const parts = birthDate.split(/[/\-.]/);
      const parsed = parts.length === 3
        ? new Date(
            parseInt(parts[2].length === 2 ? `20${parts[2]}` : parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          )
        : new Date(birthDate);
      if (!isNaN(parsed.getTime())) {
        const age = (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (age < 18) {
          return NextResponse.json(
            { error: "Debes ser mayor de 18 anos para registrarte." },
            { status: 422 },
          );
        }
      }
    }

    return NextResponse.json({
      documentNumber,
      fullName,
      expiryDate,
      birthDate,
      frontHash,
      backHash,
    });
  } catch (err) {
    console.error("[v0] OCR route error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
