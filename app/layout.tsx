import type { Metadata } from "next";
import { BarraLateral } from "@/components/BarraLateral";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Juridico — gestão para escritórios de advocacia",
    template: "%s — Juridico",
  },
  description: "Acompanhe processos, clientes e prazos em um só lugar.",
};

export default function LayoutRaiz({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="bg-plano font-sans text-tinta antialiased">
        <div className="flex min-h-screen">
          <BarraLateral />
          <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
