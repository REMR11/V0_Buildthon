import {
  CalendarDays,
  Clock,
  ShieldCheck,
  FileText,
  CreditCard,
  MessageCircle,
} from "lucide-react";

const trustBadges = [
  { label: "Identidad verificada", icon: ShieldCheck },
  { label: "Contrato digital incluido", icon: FileText },
  { label: "Pago seguro", icon: CreditCard },
];

export default function Sidebar() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-5">
      {/* Price summary */}
      <div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-bold text-primary">$6,500</span>
          <span className="text-muted text-sm">MXN / mes</span>
        </div>
        <p className="text-xs text-muted">Servicios incluidos en la renta</p>
      </div>

      {/* Details */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-3 text-sm text-foreground/80">
          <CalendarDays size={16} className="text-primary shrink-0" />
          <div>
            <span className="text-muted text-xs block">Disponible desde</span>
            <span className="font-medium text-foreground">1 de junio, 2025</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground/80">
          <Clock size={16} className="text-primary shrink-0" />
          <div>
            <span className="text-muted text-xs block">Estancia mínima</span>
            <span className="font-medium text-foreground">3 meses</span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm">
          Solicitar esta habitación
        </button>
        <button className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary text-foreground font-semibold py-3 px-4 rounded-xl transition-colors text-sm">
          <MessageCircle size={16} />
          Enviar mensaje al propietario
        </button>
      </div>

      {/* Trust badges */}
      <div className="border-t border-border pt-4 space-y-3">
        {trustBadges.map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-2.5 text-xs text-muted"
          >
            <badge.icon size={16} className="text-accent shrink-0" />
            {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
}
