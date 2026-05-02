"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Grid2x2 } from "lucide-react";

interface Props {
  images: string[];
  title: string;
  hostColor: string;
  hostInitials: string;
}

function Placeholder({ color, initials }: { color: string; initials: string }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white font-bold text-3xl"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

export default function RoomGallery({ images, title, hostColor, hostInitials }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasImages = images && images.length > 0;
  const mainImage = hasImages ? images[0] : null;
  const sideImages = hasImages ? images.slice(1, 3) : [];

  return (
    <>
      {/* Desktop gallery */}
      <div className="hidden md:grid grid-cols-5 gap-2 h-80 rounded-2xl overflow-hidden">
        {/* Main image — 3/5 width */}
        <div
          className="col-span-3 relative cursor-pointer"
          onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
        >
          {mainImage ? (
            <Image src={mainImage} alt={title} fill className="object-cover hover:brightness-95 transition" sizes="60vw" />
          ) : (
            <Placeholder color={hostColor} initials={hostInitials} />
          )}
        </div>

        {/* Side images — 2/5 width stacked */}
        <div className="col-span-2 flex flex-col gap-2">
          {[0, 1].map((i) => {
            const img = sideImages[i];
            const isLast = i === 1;
            return (
              <div
                key={i}
                className="relative flex-1 cursor-pointer overflow-hidden"
                onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
              >
                {img ? (
                  <Image src={img} alt={`${title} foto ${i + 2}`} fill className="object-cover hover:brightness-95 transition" sizes="40vw" />
                ) : (
                  <Placeholder color={hostColor} initials={hostInitials} />
                )}
                {/* "Ver todas" button on last side image */}
                {isLast && hasImages && images.length > 3 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(0); setLightboxOpen(true); }}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 hover:bg-white text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow transition"
                  >
                    <Grid2x2 size={13} />
                    Ver todas las fotos
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden relative rounded-2xl overflow-hidden h-64">
        {hasImages ? (
          <>
            <div
              className="flex h-full"
              style={{ overflowX: "scroll", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
              id="mobile-gallery"
            >
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="relative flex-shrink-0 w-full h-full"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Image src={src} alt={`${title} foto ${idx + 1}`} fill className="object-cover" sizes="100vw" />
                </div>
              ))}
            </div>
            {/* Dots */}
            <MobileGalleryDots images={images} />
          </>
        ) : (
          <Placeholder color={hostColor} initials={hostInitials} />
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar galería"
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + images.length) % images.length); }}
            aria-label="Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div
            className="relative w-full max-w-3xl mx-12 aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {images[lightboxIndex] && (
              <Image
                src={images[lightboxIndex]}
                alt={`${title} foto ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="80vw"
              />
            )}
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % images.length); }}
            aria-label="Siguiente"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}

function MobileGalleryDots({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    setActive(index);
  };

  // Attach scroll listener to parent
  return (
    <div
      className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5"
      onScroll={handleScroll}
    >
      {images.map((_, i) => (
        <span
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === active ? 20 : 6,
            height: 6,
            background: i === active ? "white" : "rgba(255,255,255,0.5)",
          }}
        />
      ))}
    </div>
  );
}
