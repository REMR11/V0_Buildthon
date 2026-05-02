import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // TODO: persist to DB and send verification email when Supabase/Neon is wired up
    void body; // consumed above; suppress unused-variable lint warning
    return NextResponse.json({ success: true, message: "Perfil activado correctamente." }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Error al procesar tu solicitud." }, { status: 500 });
  }
}
