import {
  Wifi,
  Zap,
  Droplets,
  Flame,
  WashingMachine,
  ShieldCheck,
  Tv,
  Wind,
} from "lucide-react";

const services = [
  { label: "Internet de alta velocidad", icon: Wifi },
  { label: "Electricidad", icon: Zap },
  { label: "Agua", icon: Droplets },
  { label: "Gas", icon: Flame },
  { label: "Lavadora", icon: WashingMachine },
  { label: "Seguridad 24/7", icon: ShieldCheck },
  { label: "TV por cable", icon: Tv },
  { label: "Aire acondicionado", icon: Wind },
];

export default function IncludedServices() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-3">
        Servicios incluidos
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {services.map((service) => (
          <div
            key={service.label}
            className="flex items-center gap-3 text-sm text-foreground/80"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary shrink-0">
              <service.icon size={16} className="text-primary" />
            </span>
            {service.label}
          </div>
        ))}
      </div>
    </section>
  );
}
