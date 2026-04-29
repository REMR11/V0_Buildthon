"use client";

import { forwardRef } from "react";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import type { Listing } from "@/lib/listings";

const RoomHeader = forwardRef<HTMLDivElement, { room: Listing }>(function RoomHeader({ room }, ref) {
  return (
    <div ref={ref}>
      {/* Title row */}
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-balance leading-tight flex-1">
          {room.title}
        </h1>
        {room.verified && (
          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full mt-1 flex-shrink-0" style={{ background: "#e8f4f1", color: "#1a7a6a" }}>
            <BadgeCheck size={13} />
            Verificado
          </span>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-muted text-sm mb-3">
        <MapPin size={14} />
        <span>{room.location.neighborhood}, {room.location.city}</span>
      </div>

      {/* Rating + environment */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <div className="flex items-center gap-1.5">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-foreground text-sm">{room.rating.toFixed(1)}</span>
          <span className="text-muted text-sm">({room.reviews} reseñas)</span>
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-muted">
          {room.environment}
        </span>
      </div>
    </div>
  );
});

export default RoomHeader;
