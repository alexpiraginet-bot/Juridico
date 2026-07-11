import type { Metadata } from "next";
import { BarraLateral } from "@/components/BarraLateral";
import { BarraSuperior } from "@/components/BarraSuperior";
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
      <body className="bg-plano text-[14px] font-sans text-tinta antialiased">
        <div className="flex h-screen overflow-hidden">
          <BarraLateral />
          <div className="flex min-w-0 flex-1 flex-col">
            <BarraSuperior />
            <main className="flex-1 overflow-y-auto p-5 md:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
