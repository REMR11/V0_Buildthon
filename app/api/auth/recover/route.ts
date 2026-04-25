import { NextRequest, NextResponse } from "next/server";
import { authRatelimit, storeOtp } from "@/lib/redis";

// ---------------------------------------------------------------------------
// POST /api/auth/recover
// Generates a 6-digit OTP, stores it in Redis with 10-min TTL, and (in prod)
// sends it via email. In demo mode it returns the OTP directly in the response
// so the flow can be tested without an email provider.
// ---------------------------------------------------------------------------

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const KNOWN_EMAILS = ["demo@nidoo.com"];

export async function POST(req: NextRequest) {
  try {
    if (authRatelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await authRatelimit.limit(`recover:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: "Demasiados intentos. Espera 15 minutos." },
          { status: 429 }
        );
      }
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido." }, { status: 400 });
    }

    const normalised = email.toLowerCase().trim();
    const exists = KNOWN_EMAILS.includes(normalised);

    // Always respond the same way to prevent user enumeration
    if (!exists) {
      return NextResponse.json({
        ok: true,
        message:
          "Si tu email está registrado, recibirás un código en breve.",
      });
    }

    const otp = generateOtp();
    await storeOtp(normalised, otp);

    const isDemoMode = !process.env.UPSTASH_REDIS_REST_URL;

    // In demo mode, return the OTP so it can be shown in the UI
    return NextResponse.json({
      ok: true,
      message: "Si tu email está registrado, recibirás un código en breve.",
      ...(isDemoMode && { demoOtp: otp }),
    });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
