import type { Metadata } from "next";
import { PainelAtendimentos } from "./PainelAtendimentos";

export const metadata: Metadata = { title: "Atendimentos" };

export default function PaginaAtendimentos() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Atendimentos · WhatsApp</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Inbox oficial multiatendente — cada conversa vinculada a cliente, caso e responsável
      </p>
      <PainelAtendimentos />
    </div>
  );
}
