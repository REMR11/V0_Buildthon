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
  title: "Nidoo \u2014 Encuentra tu roommate ideal y renta a la mitad",
  description:
    "Nidoo te conecta con personas de gustos similares para compartir depa y dividir gastos en Am\u00e9rica Latina. Match por compatibilidad, perfiles verificados y ahorro real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${lora.variable} bg-background`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
