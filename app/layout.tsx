import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nidoo — Encuentra tu habitación ideal",
  description:
    "Nidoo conecta propietarios con habitaciones disponibles y estudiantes o trabajadores que buscan alojamiento accesible en América Latina. Confianza, contratos digitales y pagos seguros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} ${lora.variable} bg-background`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
