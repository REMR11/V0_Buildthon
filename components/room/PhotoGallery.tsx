"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const photos = [
  { src: "/images/room-main.jpg", alt: "Habitacion principal" },
  { src: "/images/room-2.jpg", alt: "Escritorio y ventana" },
  { src: "/images/room-3.jpg", alt: "Bano privado" },
  { src: "/images/room-4.jpg", alt: "Cocina compartida" },
  { src: "/images/room-5.jpg", alt: "Terraza" },
];

export default function PhotoGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  function openLightbox(index: number) {
    setActiveIndex(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function prev() {
    setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      {/* Gallery grid */}
      <div className="flex flex-col gap-2">
        {/* Main photo */}
        <button
          onClick={() => openLightbox(0)}
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
        >
          <Image
            src={photos[0].src}
            alt={photos[0].alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
        </button>

        {/* Thumbnail strip */}
        <div className="grid grid-cols-4 gap-2">
          {photos.slice(1).map((photo, i) => (
            <button
              key={photo.src}
              onClick={() => openLightbox(i + 1)}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 25vw, 15vw"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Galeria de fotos"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Cerrar galeria"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={36} />
          </button>

          <div
            className="relative w-full max-w-3xl aspect-[4/3] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[activeIndex].src}
              alt={photos[activeIndex].alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Siguiente foto"
          >
            <ChevronRight size={36} />
          </button>

          <div className="absolute bottom-6 text-white/70 text-sm">
            {activeIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
