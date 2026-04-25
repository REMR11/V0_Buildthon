"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";

const TOKEN = {
  primary:     "#D85A30",
  teal:        "#1D9E75",
  bg:          "#fdf8f4",
  card:        "#ffffff",
  border:      "#e2cbb5",
  muted:       "#9e7a5a",
  mutedBg:     "#f0e4d7",
  foreground:  "#2c1a0e",
};

export default function RegistroPage() {
  const [hovered, setHovered] = useState<"propietario" | "inquilino" | null>(null);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: TOKEN.bg }}
    >
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <span
          className="text-2xl font-bold font-serif tracking-tight"
          style={{ color: TOKEN.primary }}
        >
          Nidoo
        </span>
      </Link>

      {/* Heading */}
      <div className="text-center mb-10 max-w-sm">
        <h1
          className="text-3xl font-bold font-serif mb-2 text-balance"
          style={{ color: TOKEN.foreground }}
        >
          Bienvenido/a a Nidoo
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: TOKEN.muted }}>
          Cuéntanos quién eres para guiarte por el camino correcto.
        </p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
        {/* Propietario */}
        <Link
          href="/registro/propietario"
          className="flex-1 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 border-2"
          style={{
            background: TOKEN.card,
            borderColor: hovered === "propietario" ? TOKEN.primary : TOKEN.border,
            boxShadow: hovered === "propietario" ? `0 8px 32px ${TOKEN.primary}22` : "0 2px 8px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={() => setHovered("propietario")}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `${TOKEN.primary}18` }}
          >
            <Home size={22} style={{ color: TOKEN.primary }} />
          </div>
          <div>
            <p className="font-bold text-base mb-1" style={{ color: TOKEN.foreground }}>
              Soy propietario/a
            </p>
            <p className="text-sm leading-relaxed" style={{ color: TOKEN.muted }}>
              Tengo un cuarto disponible y quiero rentarlo de forma segura con contrato.
            </p>
          </div>
          <div
            className="flex items-center gap-1 text-sm font-semibold mt-auto"
            style={{ color: TOKEN.primary }}
          >
            Registrar mi cuarto <ArrowRight size={15} />
          </div>
        </Link>

        {/* Inquilino */}
        <Link
          href="/registro/inquilino"
          className="flex-1 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 border-2"
          style={{
            background: TOKEN.card,
            borderColor: hovered === "inquilino" ? TOKEN.teal : TOKEN.border,
            boxShadow: hovered === "inquilino" ? `0 8px 32px ${TOKEN.teal}22` : "0 2px 8px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={() => setHovered("inquilino")}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `${TOKEN.teal}18` }}
          >
            <Search size={22} style={{ color: TOKEN.teal }} />
          </div>
          <div>
            <p className="font-bold text-base mb-1" style={{ color: TOKEN.foreground }}>
              Busco habitación
            </p>
            <p className="text-sm leading-relaxed" style={{ color: TOKEN.muted }}>
              Necesito un lugar seguro y confiable. Quiero conectar con propietarios verificados.
            </p>
          </div>
          <div
            className="flex items-center gap-1 text-sm font-semibold mt-auto"
            style={{ color: TOKEN.teal }}
          >
            Crear mi perfil <ArrowRight size={15} />
          </div>
        </Link>
      </div>

      <p className="mt-8 text-xs" style={{ color: TOKEN.muted }}>
        ¿Ya tienes cuenta?{" "}
        <Link href="#" className="font-semibold underline underline-offset-2" style={{ color: TOKEN.foreground }}>
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
