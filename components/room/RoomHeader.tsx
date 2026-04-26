import { MapPin, Heart, Share2 } from "lucide-react";

export default function RoomHeader() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground text-balance">
          Habitación amueblada en Condesa
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="p-2 rounded-full hover:bg-muted-bg transition-colors"
            aria-label="Compartir"
          >
            <Share2 size={18} className="text-muted" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-muted-bg transition-colors"
            aria-label="Guardar en favoritos"
          >
            <Heart size={18} className="text-muted" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted text-sm">
        <MapPin size={16} className="text-primary shrink-0" />
        <span>La Condesa, Ciudad de México</span>
      </div>
    </div>
  );
}
