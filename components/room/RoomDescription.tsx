"use client";

import { useState } from "react";
import { Home, Layers, Calendar, Clock, FileText } from "lucide-react";

interface Props {
  description: string;
  roomSize: number;
  floor: number;
  availableFrom: string;
  minStay: number;
  contractType: string;
}

const CONTRACT_LABELS: Record<string, string> = {
  mensual: "Mensual",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" });
}

export default function RoomDescription({ description, roomSize, floor, availableFrom, minStay, contractType }: Props) {
  const [expanded, setExpanded] = useState(false);

  const lines = description.split(". ");
  const preview = lines.slice(0, 2).join(". ") + ".";
  const isLong = lines.length > 2;

  const floorLabel = floor === 0 ? "Planta baja" : `Piso ${floor}`;

  const details = [
    { icon: Home, label: "Tamaño", value: `${roomSize} m²` },
    { icon: Layers, label: "Piso", value: floorLabel },
    { icon: Calendar, label: "Disponible desde", value: formatDate(availableFrom) },
    { icon: Clock, label: "Estadía mínima", value: `${minStay} ${minStay === 1 ? "mes" : "meses"}` },
    { icon: FileText, label: "Tipo de contrato", value: CONTRACT_LABELS[contractType] ?? contractType },
  ];

  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="font-serif text-xl font-bold text-foreground mb-3">Descripción</h2>

      <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
        {expanded || !isLong ? description : preview}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold mt-2 underline underline-offset-2"
          style={{ color: "#D85A30" }}
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}

      {/* Details grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-muted" />
            </div>
            <div>
              <p className="text-xs text-muted">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
