import { Bath, Sofa, Wifi, Zap, Droplets } from "lucide-react";

const tags = [
  { label: "Bano privado", icon: Bath },
  { label: "Amueblado", icon: Sofa },
  { label: "Internet incluido", icon: Wifi },
  { label: "Luz incluida", icon: Zap },
  { label: "Agua incluida", icon: Droplets },
];

export default function TagsRow() {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.label}
          className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-full"
        >
          <tag.icon size={14} className="text-primary" />
          {tag.label}
        </span>
      ))}
    </div>
  );
}
