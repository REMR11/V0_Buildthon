import Image from "next/image";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Camila R.",
    city: "Bogotá",
    avatar: "/images/avatar-1.jpg",
    text: "Excelente lugar, muy limpio y seguro. María siempre estuvo pendiente de todo. Lo recomiendo al 100%.",
    date: "Marzo 2025",
    rating: 5,
  },
  {
    name: "Diego M.",
    city: "Guadalajara",
    avatar: "/images/avatar-2.jpg",
    text: "La ubicación es inmejorable y el cuarto tiene todo lo necesario para vivir cómodamente. Muy buena experiencia.",
    date: "Enero 2025",
    rating: 4,
  },
  {
    name: "Valentina S.",
    city: "Lima",
    avatar: "/images/avatar-3.jpg",
    text: "Me sentí como en casa desde el primer día. El departamento es bonito y la zona es muy tranquila.",
    date: "Noviembre 2024",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "text-primary fill-primary" : "text-border"}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const avg = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-foreground">Reseñas</h2>
        <div className="flex items-center gap-1.5">
          <Star size={16} className="text-primary fill-primary" />
          <span className="text-sm font-semibold text-foreground">{avg}</span>
          <span className="text-sm text-muted">
            ({reviews.length} reseñas)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.name}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                <Image
                  src={review.avatar}
                  alt={`Foto de ${review.name}`}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {review.name}
                </span>
                <span className="text-xs text-muted">{review.city}</span>
              </div>
              <div className="ml-auto">
                <Stars count={review.rating} />
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {review.text}
            </p>
            <p className="text-xs text-muted mt-2">{review.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
