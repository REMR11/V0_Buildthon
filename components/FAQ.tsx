"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";

const faqs = [
  {
    category: "Proceso",
    question: "¿Cómo funciona el proceso para encontrar habitación?",
    answer:
      "Es muy sencillo: busca por ciudad, fecha y presupuesto, explora habitaciones con fotos reales y precios transparentes, contacta al propietario por nuestro chat, y firma el contrato digital. Todo sin salir de la plataforma. El proceso completo puede tomar desde un día.",
  },
  {
    category: "Proceso",
    question: "¿Puedo visitar la habitación antes de rentarla?",
    answer:
      "Absolutamente. Recomendamos coordinar una visita a través del chat de la plataforma antes de firmar cualquier contrato. Algunos propietarios también ofrecen video tours para inquilinos que están en otra ciudad. Nunca pagues ni firmes sin estar seguro de tu decisión.",
  },
  {
    category: "Seguridad",
    question: "¿Qué significa que una habitación esté 'Verificada'?",
    answer:
      "El badge 'Verificado' indica que el propietario pasó por nuestro proceso KYC: verificación de identidad con documento oficial, validación de la propiedad del inmueble, y revisión de las fotos por nuestro equipo. Esto garantiza que la habitación existe y que el propietario es quien dice ser.",
  },
  {
    category: "Seguridad",
    question: "¿El contrato digital tiene validez legal?",
    answer:
      "Sí. Los contratos de Nidoo son redactados por nuestro equipo legal y cumplen con la legislación de arrendamiento de México, Colombia, Perú y El Salvador. Incluyen firma electrónica con validez jurídica, timestamp certificado, y son almacenados de forma segura. Ambas partes reciben una copia al correo electrónico.",
  },
  {
    category: "Seguridad",
    question: "¿Qué pasa si tengo problemas con mi inquilino o propietario?",
    answer:
      "Nidoo actúa como árbitro neutral en disputas. Documentamos el estado del inmueble con fotos al inicio y al final de la renta. Si surge algún problema, nuestro equipo de soporte media entre las partes basándose en la evidencia documentada y aplica las políticas de protección correspondientes.",
  },
  {
    category: "Pagos",
    question: "¿Es gratis publicar mi habitación?",
    answer:
      "Sí, publicar tu habitación en Nidoo es completamente gratuito. No cobramos comisiones por publicar ni por recibir solicitudes. Solo aplicamos una pequeña comisión cuando se firma un contrato exitoso, para cubrir los costos del contrato digital y la protección de pagos.",
  },
  {
    category: "Pagos",
    question: "¿Cómo se procesan los pagos mensuales?",
    answer:
      "Los pagos se procesan automáticamente cada mes a través de nuestra plataforma segura. El inquilino puede pagar con tarjeta de crédito, débito o transferencia bancaria. El propietario recibe el pago en su cuenta en 2–3 días hábiles, descontando la comisión de servicio.",
  },
  {
    category: "General",
    question: "¿En qué ciudades está disponible Nidoo?",
    answer:
      "Actualmente operamos en 5 países: México (Guadalajara, CDMX, Monterrey), Colombia (Bogotá, Medellín), Perú (Lima), y El Salvador (San Salvador). Estamos expandiéndonos rápidamente. Si tu ciudad no está disponible aún, puedes suscribirte para recibir notificaciones cuando lleguemos.",
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
            Preguntas frecuentes
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            Todo lo que necesitas saber sobre Nidoo antes de empezar.
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
