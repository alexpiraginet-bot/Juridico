"use client";

/*
 * O coração do LexFlow: a intimação chega classificada, a IA analisa
 * e sugere o prazo com fundamento legal — mas nada entra na agenda
 * sem a validação expressa do advogado (clique em "Validar prazo").
 *
 * Desde a Fase 2 a validação é real: a server action grava o prazo
 * no banco de dados e ele passa a aparecer na aba Prazos.
 */

import { useState, useTransition } from "react";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { useAviso } from "@/components/useAviso";
import { validarPrazoDaCitacao } from "@/lib/acoes/prazos";
import { analiseIntimacao, intimacoes, teorPublicacao } from "@/lib/dados";

export function PainelIntimacoes() {
  const { avisar, elemento } = useAviso();
  const [prazoValidado, setPrazoValidado] = useState(false);
  const [validando, iniciarValidacao] = useTransition();

  function validarPrazo() {
    iniciarValidacao(async () => {
      const resultado = await validarPrazoDaCitacao();
      if (resultado.ok) {
        setPrazoValidado(true);
        avisar("✅ Prazo validado e gravado na agenda oficial — confira na aba Prazos");
      } else {
        avisar(`⚠️ ${resultado.erro}`);
      }
    });
  }

  return (
    <div className="grid gap-3.5 xl:grid-cols-[1fr_380px]">
      <div className="overflow-x-auto rounded-xl border border-borda bg-superficie p-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-borda text-left text-[11px] uppercase tracking-wide text-suave">
              <th className="px-2.5 py-2 font-semibold">Data</th>
              <th className="px-2.5 py-2 font-semibold">Processo</th>
              <th className="px-2.5 py-2 font-semibold">Tipo</th>
              <th className="px-2.5 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {intimacoes.map((intimacao) => {
              const status = intimacao.principal
                ? prazoValidado
                  ? { texto: "tratada", tom: "verde" as const }
                  : intimacao.status
                : intimacao.status;
              return (
                <tr
                  key={intimacao.id}
                  onClick={intimacao.aviso ? () => avisar(intimacao.aviso!) : undefined}
                  className={`border-b border-plano-2 last:border-b-0 ${
                    intimacao.principal ? "bg-realce" : "cursor-pointer hover:bg-realce"
                  }`}
                >
                  <td className="px-2.5 py-2.5">{intimacao.data}</td>
                  <td className={`px-2.5 py-2.5 ${intimacao.naoVinculada ? "text-suave" : ""}`}>
                    {intimacao.naoVinculada ? (
                      intimacao.processo
                    ) : (
                      <b>{intimacao.processo}</b>
                    )}
                  </td>
                  <td className="px-2.5 py-2.5">
                    <Selo tom={intimacao.tipo.tom}>{intimacao.tipo.texto}</Selo>
                  </td>
                  <td className="px-2.5 py-2.5">
                    <Selo tom={status.tom}>{status.texto}</Selo>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 className="mb-2 mt-5 text-[13px] font-bold text-navy">
          Teor da publicação (DJEN · 09/07)
        </h3>
        <p className="rounded-lg border border-borda bg-realce p-3.5 font-serif text-[12.5px] leading-relaxed">
          {teorPublicacao}
        </p>
      </div>

      <div className="rounded-xl border border-borda bg-superficie p-4">
        <SeloIA>Análise da IA — pendente de validação</SeloIA>

        {analiseIntimacao.map((item) => (
          <div key={item.titulo} className="border-b border-dashed border-borda py-2.5 text-[12.5px] last:border-b-0">
            <b className="mb-0.5 block text-[10.5px] uppercase tracking-wide text-suave">
              {item.titulo}
            </b>
            {item.texto}
            {item.destaque && <b>{item.destaque}</b>}
          </div>
        ))}

        <div className="mt-3.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={validarPrazo}
            disabled={prazoValidado || validando}
            className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro disabled:opacity-60"
          >
            {prazoValidado
              ? "✔ Prazo validado"
              : validando
                ? "Validando…"
                : "✔ Validar prazo (31/07)"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-borda px-3 py-1.5 text-[11.5px] font-semibold hover:bg-plano"
            onClick={() =>
              avisar("Edição do prazo: você define termo inicial, dias e fundamento — a IA registra a alteração")
            }
          >
            Ajustar
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#E5C4C0] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-vermelho hover:bg-selo-vermelho"
            onClick={() => avisar("Sugestão rejeitada — registrada no log de auditoria com seu usuário")}
          >
            Rejeitar
          </button>
        </div>

        <p className="mt-2.5 text-[11px] text-suave">
          Toda validação é registrada em log de auditoria imutável (usuário, data/hora, conteúdo).
        </p>
      </div>

      {elemento}
    </div>
  );
}
