import { MapPin } from "lucide-react";

export default function MapPlaceholder() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-3">Ubicación</h2>
      <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-secondary">
        {/* Static map placeholder */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin size={24} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            La Condesa, Ciudad de México
          </p>
          <p className="text-xs text-muted">
            La dirección exacta se comparte al confirmar la solicitud
          </p>
        </div>
        {/* Visual map grid lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="map-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>
      </div>
    </section>
  );
}
