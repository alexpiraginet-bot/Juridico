import type { Metadata } from "next";
import { QuadroTarefas } from "./QuadroTarefas";

export const metadata: Metadata = { title: "Tarefas" };

export default function PaginaTarefas() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Tarefas & Fluxos</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Fluxo padrão &quot;Novo processo&quot; gerou as tarefas automaticamente · mova os cards com ▶
      </p>
      <QuadroTarefas />
    </div>
  );
}
