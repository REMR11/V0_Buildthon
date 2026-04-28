"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "Como funciona el proceso de verificacion de identidad?",
    answer:
      "Todos los usuarios deben verificar su identidad subiendo una foto de su identificacion oficial (INE, cedula, pasaporte) y una selfie. Nuestro sistema automatizado valida la informacion en menos de 24 horas. Esto garantiza que tanto propietarios como inquilinos sean personas reales y confiables.",
  },
  {
    question: "Es gratis publicar mi habitacion?",
    answer:
      "Si, publicar tu habitacion en Nidoo es completamente gratis. No cobramos comisiones por publicar ni por recibir solicitudes. Solo aplicamos una pequena comision cuando se firma un contrato exitoso, para cubrir los costos del contrato digital y la proteccion de pagos.",
  },
  {
    question: "Como funcionan los contratos digitales?",
    answer:
      "Nuestros contratos digitales son documentos legalmente validos que cumplen con la normativa de cada pais. Ambas partes firman electronicamente, y el contrato queda almacenado de forma segura en nuestra plataforma. Incluye todas las clausulas estandar de arrendamiento y puede personalizarse segun las necesidades.",
  },
  {
    question: "Que pasa si tengo problemas con mi inquilino/propietario?",
    answer:
      "Nidoo cuenta con un equipo de soporte dedicado a resolver conflictos. Si surge algun problema, puedes contactarnos a traves del chat de la plataforma o por email. Mediamos entre las partes y, si es necesario, aplicamos las politicas de proteccion que cubren tanto a propietarios como inquilinos.",
  },
  {
    question: "Como se procesan los pagos mensuales?",
    answer:
      "Los pagos se procesan de forma automatica cada mes a traves de nuestra plataforma segura. El inquilino puede pagar con tarjeta de credito, debito o transferencia bancaria. El propietario recibe el pago en su cuenta en un plazo de 2-3 dias habiles, menos la comision de servicio.",
  },
  {
    question: "Puedo visitar la habitacion antes de rentarla?",
    answer:
      "Absolutamente. Recomendamos coordinar una visita a traves del chat de la plataforma antes de firmar cualquier contrato. Algunos propietarios tambien ofrecen video tours para inquilinos que estan en otra ciudad. Nunca pagues ni firmes sin estar seguro de tu decision.",
  },
  {
    question: "En que ciudades esta disponible Nidoo?",
    answer:
      "Actualmente operamos en Guadalajara, Ciudad de Mexico, Bogota, Medellin, Lima y San Salvador. Estamos expandiendonos rapidamente a mas ciudades de America Latina. Si tu ciudad no esta disponible aun, puedes suscribirte para recibir notificaciones cuando llegemos a tu zona.",
  },
  {
    question: "Que incluye la proteccion de Nidoo?",
    answer:
      "Nuestra proteccion incluye: verificacion de identidad de todos los usuarios, contratos legales digitales, pagos seguros con trazabilidad completa, soporte de mediacion en caso de conflictos, y garantia de devolucion del deposito si el propietario no cumple con lo acordado.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Resolvemos tus dudas
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Todo lo que necesitas saber sobre Nidoo antes de empezar.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="faq-item group bg-card rounded-2xl border border-border overflow-hidden"
              open={openIndex === index}
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) {
                  setOpenIndex(index);
                } else if (openIndex === index) {
                  setOpenIndex(null);
                }
              }}
            >
              <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer hover:bg-secondary/50 transition-colors">
                <span className="font-semibold text-foreground text-left pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className="faq-icon text-muted flex-shrink-0"
                />
              </summary>
              <div className="faq-content px-6 pb-6">
                <p className="text-muted leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Still have questions */}
        <div className="bg-secondary rounded-2xl p-8 text-center border border-border">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={24} className="text-primary" />
          </div>
          <h3 className="font-semibold text-xl text-foreground mb-2">
            Tienes mas preguntas?
          </h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Nuestro equipo de soporte esta disponible para ayudarte en cualquier momento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/ayuda"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-all"
            >
              <HelpCircle size={18} />
              Centro de ayuda
            </a>
            <a
              href="mailto:soporte@nidoo.com"
              className="inline-flex items-center justify-center gap-2 bg-card hover:bg-secondary text-foreground border border-border font-semibold px-6 py-3 rounded-full transition-all"
            >
              Contactar soporte
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
