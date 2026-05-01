"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";

const faqs = [
  {
    category: "Roommates",
    question: "\u00bfC\u00f3mo funciona el matching de compatibilidad?",
    answer:
      "Al registrarte, completas un perfil con tus h\u00e1bitos, horarios, gustos y preferencias de convivencia. Nuestro sistema analiza esta info y te muestra personas con un alto porcentaje de compatibilidad. T\u00fa decides con qui\u00e9n quieres hablar y conocer antes de comprometerte a compartir.",
  },
  {
    category: "Roommates",
    question: "\u00bfY si no me llevo bien con mi roommate?",
    answer:
      "Antes de firmar cualquier contrato, te recomendamos chatear y conocer a tu posible roommate por la plataforma. Si despu\u00e9s de mudarte surge alg\u00fan problema, Nidoo act\u00faa como mediador neutral. Adem\u00e1s, los contratos incluyen cl\u00e1usulas de salida para que nadie se quede atrapado en una situaci\u00f3n inc\u00f3moda.",
  },
  {
    category: "Seguridad",
    question: "\u00bfC\u00f3mo s\u00e9 que mi roommate es una persona confiable?",
    answer:
      "Todos los usuarios de Nidoo pasan por verificaci\u00f3n de identidad con documento oficial (KYC). Adem\u00e1s, puedes ver rese\u00f1as de otros roommates anteriores, su porcentaje de compatibilidad contigo, y chatear antes de tomar cualquier decisi\u00f3n. Nada se hace a ciegas.",
  },
  {
    category: "Seguridad",
    question: "\u00bfEl contrato digital tiene validez legal?",
    answer:
      "S\u00ed. Los contratos de Nidoo son redactados por nuestro equipo legal y cumplen con la legislaci\u00f3n de arrendamiento de M\u00e9xico, Colombia, Per\u00fa y El Salvador. Incluyen firma electr\u00f3nica con validez jur\u00eddica, timestamp certificado, y son almacenados de forma segura.",
  },
  {
    category: "Ahorro",
    question: "\u00bfCu\u00e1nto puedo ahorrar al compartir con un roommate?",
    answer:
      "En promedio, nuestros usuarios ahorran entre un 40% y 50% en renta mensual al compartir. Adem\u00e1s del ahorro en renta, tambi\u00e9n dividen servicios (luz, agua, internet) y en muchos casos hasta la despensa. Es una diferencia real en tu bolsillo.",
  },
  {
    category: "Ahorro",
    question: "\u00bfEs gratis usar Nidoo?",
    answer:
      "Registrarte, crear tu perfil y buscar roommates es completamente gratis. Solo aplicamos una peque\u00f1a comisi\u00f3n cuando se firma un contrato exitoso, para cubrir los costos del contrato digital, verificaciones y la protecci\u00f3n de pagos.",
  },
  {
    category: "Proceso",
    question: "\u00bfPuedo visitar la habitaci\u00f3n antes de rentarla?",
    answer:
      "Absolutamente. Recomendamos coordinar una visita a trav\u00e9s del chat de la plataforma antes de firmar. Algunos propietarios tambi\u00e9n ofrecen video tours para quienes est\u00e1n en otra ciudad. Nunca pagues ni firmes sin estar seguro.",
  },
  {
    category: "General",
    question: "\u00bfEn qu\u00e9 ciudades est\u00e1 disponible Nidoo?",
    answer:
      "Actualmente operamos en 5 pa\u00edses: M\u00e9xico (Guadalajara, CDMX, Monterrey), Colombia (Bogot\u00e1, Medell\u00edn), Per\u00fa (Lima), y El Salvador (San Salvador). Estamos expandi\u00e9ndonos r\u00e1pidamente. Si tu ciudad no est\u00e1 disponible a\u00fan, suscr\u00edbete y te avisamos.",
  },
];

const CATEGORIES = ["Todos", ...Array.from(new Set(faqs.map((f) => f.category)))];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary/60 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-foreground leading-snug">{question}</span>
        <ChevronDown
          size={20}
          className={`text-muted flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Smooth height animation via max-height */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 border-t border-border">
          <p className="text-muted leading-relaxed pt-4 text-sm">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const visible =
    activeCategory === "Todos"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  const toggle = (globalIndex: number) =>
    setOpenIndex(openIndex === globalIndex ? null : globalIndex);

  // Resolve local visible index back to the global faqs index
  const globalIndex = (item: (typeof faqs)[0]) => faqs.indexOf(item);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-3xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Resolvemos tus dudas
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            {"Las dudas que todos tienen (y sus respuestas)"}
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            {"Todo lo que necesitas saber antes de encontrar a tu roommate ideal."}
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-primary-sm"
                  : "bg-secondary border border-border text-muted hover:text-foreground hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion list */}
        <div className="flex flex-col gap-3 mb-12">
          {visible.map((faq) => {
            const idx = globalIndex(faq);
            return (
              <FAQItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === idx}
                onToggle={() => toggle(idx)}
              />
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="bg-secondary rounded-2xl p-8 text-center border border-border">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={24} className="text-primary" aria-hidden="true" />
          </div>
          <h3 className="font-semibold text-xl text-foreground mb-2">
            ¿Tienes más preguntas?
          </h3>
          <p className="text-muted mb-6 max-w-sm mx-auto text-sm leading-relaxed">
            Nuestro equipo de soporte está disponible en español, lunes a domingo
            de 8 am a 10 pm (hora CDMX).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/ayuda"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-all shadow-primary-sm hover:shadow-primary-md hover:-translate-y-0.5 text-sm"
            >
              <HelpCircle size={16} aria-hidden="true" />
              Centro de ayuda
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 bg-card hover:bg-secondary border border-border text-foreground font-semibold px-6 py-3 rounded-full transition-all text-sm"
            >
              Contactar soporte
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
