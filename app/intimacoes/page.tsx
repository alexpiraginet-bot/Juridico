import type { Metadata } from "next";
import { PainelIntimacoes } from "./PainelIntimacoes";

export const metadata: Metadata = { title: "Intimações" };

export default function PaginaIntimacoes() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Publicações & Intimações</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Capturadas automaticamente do DJEN/Comunica API e dos diários · classificadas pela IA
      </p>
      <PainelIntimacoes />
    </div>
  );
}
