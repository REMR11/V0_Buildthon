import { Ban, PawPrint, Users, Clock, Volume2 } from "lucide-react";

const rules = [
  { label: "No fumar", icon: Ban },
  { label: "No mascotas", icon: PawPrint },
  { label: "Solo mujeres", icon: Users },
  { label: "Horario de silencio: 22:00 - 08:00", icon: Volume2 },
  { label: "No visitas después de las 23:00", icon: Clock },
];

export default function HouseRules() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-3">
        Reglas de la casa
      </h2>
      <ul className="space-y-3">
        {rules.map((rule) => (
          <li key={rule.label} className="flex items-center gap-3 text-sm text-foreground/80">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary shrink-0">
              <rule.icon size={16} className="text-accent" />
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
