import { NextRequest, NextResponse } from "next/server";
import { authRatelimit, verifyOtp } from "@/lib/redis";

// ---------------------------------------------------------------------------
// POST /api/auth/verify-otp
// Verifies the 6-digit OTP submitted by the user. On success, the client
// should redirect to /reset-password (or auto-sign in, depending on flow).
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    if (authRatelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await authRatelimit.limit(`otp:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: "Demasiados intentos. Espera 15 minutos." },
          { status: 429 }
        );
      }
    }

    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email y código requeridos." },
        { status: 400 }
      );
    }

    const valid = await verifyOtp(email.toLowerCase().trim(), otp.trim());

    if (!valid) {
      return NextResponse.json(
        { error: "Código incorrecto o expirado. Solicita uno nuevo." },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
