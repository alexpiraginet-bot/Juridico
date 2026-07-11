import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LexFlow — Sistema de Gestão Jurídica",
    template: "%s — LexFlow",
  },
  description:
    "Atendimentos via WhatsApp, intimações do DJEN, prazos auditáveis e minutas assistidas por IA — o escritório inteiro em um só lugar.",
};

export default function LayoutRaiz({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="bg-plano text-[14px] font-sans text-tinta antialiased">{children}</body>
    </html>
  );
}
