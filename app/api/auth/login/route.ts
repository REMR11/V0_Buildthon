import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authRatelimit } from "@/lib/redis";

// ---------------------------------------------------------------------------
// POST /api/auth/login
// Validates credentials and returns a session token via NextAuth signIn.
// This route is called by the login form before NextAuth's own handler so we
// can apply rate-limiting and return structured JSON errors.
// ---------------------------------------------------------------------------

const MOCK_USERS = [
  {
    id: "1",
    email: "demo@nidoo.com",
    passwordHash:
      "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.i",
    name: "Demo Usuario",
    role: "propietario",
  },
];

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (authRatelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await authRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Demasiados intentos. Espera 15 minutos e intenta de nuevo." },
          { status: 429 }
        );
      }
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos." },
        { status: 400 }
      );
    }

    const user = MOCK_USERS.find((u) => u.email === email.toLowerCase().trim());

    // Constant-time response to prevent user enumeration
    const dummyHash = "$2a$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuvwxyz123456";
    const hash = user?.passwordHash ?? dummyHash;
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Credenciales incorrectas. Verifica tu email y contraseña." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
