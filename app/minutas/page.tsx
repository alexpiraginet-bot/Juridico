import type { Metadata } from "next";
import { PainelMinutas } from "./PainelMinutas";

export const metadata: Metadata = { title: "Minutas IA" };

export default function PaginaMinutas() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Minutas Assistidas por IA</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Contexto: intimação + histórico do processo + documentos + modelos e estilo do escritório
      </p>
      <PainelMinutas />
    </div>
  );
}
