import { Wifi, Droplets, Zap, Flame, WashingMachine, Dumbbell, Waves, Car, Wind, UtensilsCrossed, CheckCircle } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  wifi: Wifi,
  agua: Droplets,
  electricidad: Zap,
  gas: Flame,
  lavandería: WashingMachine,
  gym: Dumbbell,
  piscina: Waves,
  estacionamiento: Car,
  "aire acondicionado": Wind,
  desayuno: UtensilsCrossed,
  cena: UtensilsCrossed,
};

function getIcon(item: string): React.ElementType {
  const key = item.toLowerCase();
  for (const [k, Icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return Icon;
  }
  return CheckCircle;
}

export default function RoomIncludes({ includes }: { includes: string[] }) {
  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="font-serif text-xl font-bold text-foreground mb-4">Qué incluye el precio</h2>
      <div className="flex flex-wrap gap-3">
        {includes.map((item) => {
          const Icon = getIcon(item);
          return (
            <div
              key={item}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground"
            >
              <Icon size={15} className="text-muted flex-shrink-0" />
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
