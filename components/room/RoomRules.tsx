import { CheckCircle2, XCircle } from "lucide-react";

export default function RoomRules({ rules }: { rules: string[] }) {
  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="font-serif text-xl font-bold text-foreground mb-4">Reglas del hogar</h2>
      <ul className="space-y-3">
        {rules.map((rule) => {
          const isRestriction = rule.toLowerCase().startsWith("no ");
          return (
            <li key={rule} className="flex items-start gap-3">
              {isRestriction ? (
                <XCircle size={17} className="flex-shrink-0 mt-0.5" style={{ color: "#D85A30" }} />
              ) : (
                <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5 text-teal-600" />
              )}
              <span className="text-sm text-foreground/80 leading-snug">{rule}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
