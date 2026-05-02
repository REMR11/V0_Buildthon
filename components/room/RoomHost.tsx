import { BadgeCheck, Star } from "lucide-react";
import type { Listing } from "@/lib/listings";

interface Props {
  host: Listing["hostProfile"];
  rating: number;
  reviews: number;
}

export default function RoomHost({ host, rating, reviews }: Props) {
  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="font-serif text-xl font-bold text-foreground mb-4">Sobre el propietario</h2>

      <div className="rounded-2xl border border-border bg-card p-5">
        {/* Host identity */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: host.color }}
            aria-label={`Avatar de ${host.name}`}
          >
            {host.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground">{host.name}</p>
              {host.verified && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e8f4f1", color: "#1a7a6a" }}>
                  <BadgeCheck size={12} />
                  Verificado
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">Miembro desde {host.memberSince}</p>
            <p className="text-xs text-muted">{host.responseTime}</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-5">{host.bio}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border text-center mb-5">
          <div className="px-3">
            <p className="font-bold text-foreground text-lg">{host.totalRooms}</p>
            <p className="text-xs text-muted">habitaciones</p>
          </div>
          <div className="px-3">
            <p className="font-bold text-foreground text-lg">{reviews}</p>
            <p className="text-xs text-muted">reseñas</p>
          </div>
          <div className="px-3">
            <div className="flex items-center justify-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <p className="font-bold text-foreground text-lg">{rating.toFixed(1)}</p>
            </div>
            <p className="text-xs text-muted">calificación</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href="#"
            className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Ver perfil completo
          </a>
          <a
            href="#"
            className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold text-white transition-colors"
            style={{ background: "#D85A30" }}
          >
            Enviar mensaje
          </a>
        </div>
      </div>
    </section>
  );
}
