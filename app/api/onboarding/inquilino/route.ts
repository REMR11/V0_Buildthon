import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate role guard
    if (body.role !== "inquilino") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    // TODO: persist to database, send verification email, etc.
    console.log("[api/onboarding/inquilino] received:", JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, message: "Perfil de inquilino creado correctamente." });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
