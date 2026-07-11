"use client";

/*
 * Quadro kanban de tarefas. O botão ▶ move o card para a coluna
 * seguinte; ao chegar em "Concluído", a prioridade vira um ✓.
 */

import { useState } from "react";
import { Selo } from "@/components/Selo";
import { useAviso } from "@/components/useAviso";
import { colunasKanban } from "@/lib/dados";
import type { ColunaKanban } from "@/lib/tipos";

export function QuadroTarefas() {
  const { avisar, elemento } = useAviso();
  const [colunas, setColunas] = useState<ColunaKanban[]>(
    () => colunasKanban.map((coluna) => ({ ...coluna, tarefas: [...coluna.tarefas] })),
  );

  function mover(indiceColuna: number, indiceTarefa: number) {
    setColunas((atuais) => {
      const proximas = atuais.map((coluna) => ({ ...coluna, tarefas: [...coluna.tarefas] }));
      const [tarefa] = proximas[indiceColuna].tarefas.splice(indiceTarefa, 1);
      const destino = indiceColuna + 1;
      const concluiu = destino === proximas.length - 1;
      proximas[destino].tarefas.push(concluiu ? { ...tarefa, prioridade: null } : tarefa);
      return proximas;
    });
    avisar("Tarefa movida — histórico de alteração registrado");
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {colunas.map((coluna, indiceColuna) => (
          <div key={coluna.titulo} className="rounded-xl bg-plano-2 p-2.5">
            <h5 className="flex justify-between px-1.5 pb-2.5 pt-1 text-[11.5px] font-semibold uppercase tracking-wide text-suave">
              {coluna.titulo} <span>{coluna.tarefas.length}</span>
            </h5>
            {coluna.tarefas.map((tarefa, indiceTarefa) => (
              <div
                key={tarefa.titulo}
                className="mb-2 rounded-lg border border-borda bg-superficie p-3 text-[12.5px]"
              >
                <b className="mb-1 block text-navy">{tarefa.titulo}</b>
                {tarefa.detalhe}
                <div className="mt-2 flex items-center justify-between">
                  {tarefa.prioridade ? (
                    <Selo tom={tarefa.prioridade.tom}>{tarefa.prioridade.texto}</Selo>
                  ) : (
                    <Selo tom="verde">✓</Selo>
                  )}
                  {indiceColuna < colunas.length - 1 && (
                    <button
                      type="button"
                      onClick={() => mover(indiceColuna, indiceTarefa)}
                      className="rounded-md bg-selo-cinza px-2 py-0.5 text-[11px] font-bold hover:bg-borda"
                      aria-label={`Mover "${tarefa.titulo}" para a próxima coluna`}
                    >
                      ▶
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {elemento}
    </>
  );
}
