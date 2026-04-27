import { NextRequest, NextResponse } from "next/server";
import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
  Attribute,
} from "@aws-sdk/client-rekognition";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Face-match + liveness detection endpoint
// Uses AWS Rekognition CompareFaces (similarity) and DetectFaces (quality/pose)
// as a basic liveness signal (checks for open eyes, real face attributes).
//
// Threshold: similarity >= 85 to approve.
// Files are never persisted; only SHA-256 hashes are returned.
// ---------------------------------------------------------------------------

function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function getRekognition(): RekognitionClient {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not configured");
  }
  return new RekognitionClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const docFile    = formData.get("document") as File | null; // ID front photo
    const selfieFile = formData.get("selfie")   as File | null;

    if (!docFile || !selfieFile) {
      return NextResponse.json(
        { error: "Se requieren la foto del documento y la selfie" },
        { status: 400 },
      );
    }

    // Size guards
    if (docFile.size > 5 * 1024 * 1024 || selfieFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagen demasiado grande (max 5 MB por imagen)" },
        { status: 413 },
      );
    }

    const docBuffer    = Buffer.from(await docFile.arrayBuffer());
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());

    // Compute hashes
    const selfieHash = sha256(selfieBuffer);

    // Build client
    let client: RekognitionClient;
    try {
      client = getRekognition();
    } catch {
      return NextResponse.json(
        { error: "Servicio de verificacion facial no configurado" },
        { status: 503 },
      );
    }

    // ── Step 1: Face comparison ──────────────────────────────────────────────
    const compareCmd = new CompareFacesCommand({
      SourceImage: { Bytes: docBuffer },
      TargetImage: { Bytes: selfieBuffer },
      SimilarityThreshold: 50, // we evaluate threshold ourselves
    });

    let similarity = 0;
    try {
      const compareRes = await client.send(compareCmd);
      similarity = compareRes.FaceMatches?.[0]?.Similarity ?? 0;
    } catch (err) {
      console.error("[v0] Rekognition CompareFaces error:", err);
      return NextResponse.json(
        { error: "La selfie no coincide con la foto del documento." },
        { status: 422 },
      );
    }

    if (similarity < 85) {
      return NextResponse.json(
        {
          similarity,
          livenessDetected: false,
          selfieHash,
          approved: false,
          reason: "La selfie no coincide con la foto del documento.",
        },
        { status: 422 },
      );
    }

    // ── Step 2: Liveness / anti-spoofing (basic) ─────────────────────────────
    // DetectFaces with ALL attributes gives us Sunglasses, EyesOpen, Quality, Pose.
    // We treat it as liveness: a real person will have EyesOpen, reasonable quality.
    const detectCmd = new DetectFacesCommand({
      Image: { Bytes: selfieBuffer },
      Attributes: [Attribute.ALL],
    });

    let livenessDetected = false;
    try {
      const detectRes = await client.send(detectCmd);
      const face = detectRes.FaceDetails?.[0];
      if (face) {
        const eyesOpen     = face.EyesOpen?.Value ?? false;
        const confidence   = face.Confidence ?? 0;
        const qualitySharp = (face.Quality?.Sharpness ?? 0) > 20;
        const qualityBright = (face.Quality?.Brightness ?? 0) > 20;
        const notSunglasses = !(face.Sunglasses?.Value ?? false);
        // Basic liveness: eyes open, decent quality, no sunglasses, high confidence
        livenessDetected = eyesOpen && qualitySharp && qualityBright && notSunglasses && confidence > 85;
      }
    } catch (err) {
      console.error("[v0] Rekognition DetectFaces error:", err);
      // Non-fatal: downgrade but don't block
      livenessDetected = false;
    }

    if (!livenessDetected) {
      return NextResponse.json(
        {
          similarity,
          livenessDetected: false,
          selfieHash,
          approved: false,
          reason: "No pudimos confirmar que eres una persona real. Intenta con mejor iluminacion.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      similarity,
      livenessDetected: true,
      selfieHash,
      approved: true,
    });
  } catch (err) {
    console.error("[v0] face-match route error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
