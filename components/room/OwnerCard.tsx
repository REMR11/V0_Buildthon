import Image from "next/image";
import { BadgeCheck, Clock } from "lucide-react";

export default function OwnerCard() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-4">
        El propietario
      </h2>
      <div className="flex items-start gap-4 bg-card rounded-xl border border-border p-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
          <Image
            src="/images/owner-avatar.jpg"
            alt="Foto de María"
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">María</span>
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
              <BadgeCheck size={14} />
              Verificada
            </span>
          </div>
          <p className="text-xs text-muted">
            Miembro desde enero 2023
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
            <Clock size={13} className="text-accent" />
            <span>Responde en menos de 2 horas</span>
          </div>
        </div>
      </div>
    </section>
  );
}
