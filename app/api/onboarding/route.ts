import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // In production this would persist to DB, send verification emails, etc.
    console.log("[v0] Onboarding submission received:", JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, message: "Perfil activado correctamente." }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Error al procesar tu solicitud." }, { status: 500 });
  }
}
