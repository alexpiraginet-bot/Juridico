import type { Metadata } from "next";
import Script from "next/script";
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
        {children}
        {/* Widget universal de suporte do Lex Technology (Atendente IA + anexo de print). */}
        <Script
          src="https://alex-hub-three.vercel.app/support-widget.js"
          data-app="juridico"
          strategy="lazyOnload"
        />
        {/* Captação: pílula "Feito pela Lex" → WhatsApp comercial (canto oposto ao suporte). */}
        <Script
          src="https://alex-hub-three.vercel.app/lex-cta.js"
          data-app="juridico"
          data-label="LexFlow (gestão jurídica)"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
