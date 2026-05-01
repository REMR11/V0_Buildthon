"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Wifi, Bath, MapPin, Star, Heart, ChevronLeft, ChevronRight, Sparkles, Clock } from "lucide-react";
import {
  motion,
  Reveal,
  Stagger,
  TextReveal,
  Magnetic,
  staggerItem,
} from "@/components/motion";

const rooms = [
  {
    id: 1,
    images: ["/images/rooms/room-1.jpg", "/images/rooms/room-2.jpg", "/images/rooms/room-3.jpg"],
    title: "Habitaci\u00f3n acogedora cerca del centro",
    type: "Habitaci\u00f3n privada en casa",
    city: "Guadalajara",
    country: "M\u00e9xico",
    price: 180,
    rating: 4.9,
    reviews: 23,
    verified: true,
    amenities: ["wifi", "bath"],
    availability: "Disponible ahora",
    isNew: true,
    daysAgo: 3,
  },
  {
    id: 2,
    images: ["/images/rooms/room-2.jpg", "/images/rooms/room-4.jpg"],
    title: "Cuarto luminoso con escritorio",
    type: "Habitaci\u00f3n privada en departamento",
    city: "Bogot\u00e1",
    country: "Colombia",
    price: 220,
    rating: 4.8,
    reviews: 18,
    verified: true,
    amenities: ["wifi"],
    availability: "Desde 1 Jun",
    isNew: false,
    daysAgo: 15,
  },
  {
    id: 3,
    images: ["/images/rooms/room-3.jpg", "/images/rooms/room-5.jpg", "/images/rooms/room-1.jpg"],
    title: "Suite con ba\u00f1o privado",
    type: "Estudio independiente",
    city: "Lima",
    country: "Per\u00fa",
    price: 320,
    rating: 5.0,
    reviews: 31,
    verified: true,
    amenities: ["wifi", "bath"],
    availability: "Disponible ahora",
    isNew: true,
    daysAgo: 5,
  },
  {
    id: 4,
    images: ["/images/rooms/room-4.jpg", "/images/rooms/room-6.jpg"],
    title: "Estudio compacto bien equipado",
    type: "Estudio independiente",
    city: "Medell\u00edn",
    country: "Colombia",
    price: 195,
    rating: 4.7,
    reviews: 12,
    verified: false,
    amenities: ["wifi"],
    availability: "Disponible ahora",
    isNew: false,
    daysAgo: 22,
  },
  {
    id: 5,
    images: ["/images/rooms/room-5.jpg", "/images/rooms/room-1.jpg", "/images/rooms/room-3.jpg"],
    title: "Habitaci\u00f3n premium con balc\u00f3n",
    type: "Habitaci\u00f3n privada en casa",
    city: "Guadalajara",
    country: "M\u00e9xico",
    price: 380,
    rating: 4.9,
    reviews: 27,
    verified: true,
    amenities: ["wifi", "bath"],
    availability: "Desde 15 Jun",
    isNew: true,
    daysAgo: 2,
  },
  {
    id: 6,
    images: ["/images/rooms/room-6.jpg", "/images/rooms/room-2.jpg"],
    title: "Loft estilo industrial",
    type: "Estudio independiente",
    city: "Bogot\u00e1",
    country: "Colombia",
    price: 290,
    rating: 4.8,
    reviews: 15,
    verified: true,
    amenities: ["wifi"],
    availability: "Disponible ahora",
    isNew: false,
    daysAgo: 10,
  },
];

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  bath: Bath,
};

function RoomCard({ room }: { room: typeof rooms[0] }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      href={`/habitacion/${room.id}`}
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-primary-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image carousel */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={room.images[currentImage]}
          alt={room.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {room.images.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {room.images.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
            {room.images.map((_, index) => (
              <span key={index} className={`carousel-dot ${index === currentImage ? "active" : ""}`} />
            ))}
          </div>
        )}

        <motion.button
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? "bg-primary text-white"
              : "bg-white/80 hover:bg-white text-foreground/70 hover:text-primary"
          }`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          whileTap={{ scale: 1.3 }}
        >
          <Heart size={18} className={isFavorite ? "fill-current" : ""} />
        </motion.button>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {room.verified && (
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-primary font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm">
              <BadgeCheck size={14} />
              <span>Verificado</span>
            </div>
          )}
          {room.isNew && room.daysAgo <= 7 && (
            <div className="flex items-center gap-1.5 bg-green-500 text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm">
              <Sparkles size={12} />
              <span>Nuevo</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 right-3 glass rounded-lg px-3 py-1.5">
          <span className="text-foreground font-bold">${room.price}</span>
          <span className="text-foreground/60 text-sm">/mes</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs font-medium text-muted mb-1">{room.type}</p>
        <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {room.title}
        </h3>
        <div className="flex items-center gap-1.5 text-muted text-sm mb-3">
          <MapPin size={14} />
          <span>{room.city}, {room.country}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <Clock size={14} className={room.availability === "Disponible ahora" ? "text-green-600" : "text-muted"} />
          <span className={`text-sm font-medium ${room.availability === "Disponible ahora" ? "text-green-600" : "text-muted"}`}>
            {room.availability}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-primary fill-primary" />
            <span className="font-semibold text-foreground text-sm">{room.rating}</span>
            <span className="text-muted text-sm">({room.reviews} rese\u00f1as)</span>
          </div>
          <div className="flex items-center gap-2">
            {room.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity];
              return (
                <div
                  key={amenity}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                  title={amenity === "wifi" ? "WiFi incluido" : "Ba\u00f1o privado"}
                >
                  <Icon size={14} className="text-muted" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedRooms() {
  return (
    <section id="habitaciones" className="py-24 bg-secondary">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <Reveal direction="up">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
              {"Espacios para compartir"}
            </span>
          </Reveal>
          <TextReveal
            text="Habitaciones listas para ti y tu roommate"
            as="h2"
            className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4"
            delay={0.1}
          />
          <Reveal direction="up" delay={0.3}>
            <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
              {"Todas verificadas, con contrato digital y listas para dividir. Encuentra la que va con tu presupuesto y estilo."}
            </p>
          </Reveal>
        </div>

        {/* Urgency banner */}
        <Reveal direction="up" delay={0.2}>
          <motion.div
            className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8 flex items-center justify-center gap-3"
            animate={{ borderColor: ["rgba(224,112,48,0.2)", "rgba(224,112,48,0.4)", "rgba(224,112,48,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={18} className="text-primary" />
            </motion.div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary font-bold">127 habitaciones nuevas</span> publicadas esta semana
            </p>
          </motion.div>
        </Reveal>

        {/* Rooms grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" stagger={0.1}>
          {rooms.map((room) => (
            <motion.div key={room.id} variants={staggerItem} whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}>
              <RoomCard room={room} />
            </motion.div>
          ))}
        </Stagger>

        {/* CTA */}
        <Reveal direction="up" delay={0.2}>
          <div className="text-center">
            <Magnetic strength={5}>
              <motion.div className="inline-block">
                <Link
                  href="/explorar"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-full transition-colors shadow-primary-md animate-glow"
                >
                  <span>Ver todas las habitaciones</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </motion.div>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
