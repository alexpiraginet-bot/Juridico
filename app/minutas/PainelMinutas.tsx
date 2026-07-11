"use client";

/*
 * Geração de minuta com efeito de digitação, histórico de versões
 * (IA → humana → aprovada) e editor livre. Regra do produto: o
 * sistema nunca protocola sozinho — protocolo é ato do advogado.
 *
 * O texto digitado usa o DOM direto (ref) para não brigar com o
 * contentEditable durante as edições do usuário.
 */

import { useEffect, useRef, useState } from "react";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { useAviso } from "@/components/useAviso";
import { contextoMinuta, minutaContestacao } from "@/lib/dados";

export function PainelMinutas() {
  const { avisar, elemento } = useAviso();
  const [gerada, setGerada] = useState(false);
  const [temVersaoHumana, setTemVersaoHumana] = useState(false);
  const [aprovada, setAprovada] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  const intervalo = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(intervalo.current), []);

  function gerarMinuta() {
    if (!editor.current) return;
    setGerada(true);
    editor.current.textContent = "";
    let posicao = 0;
    intervalo.current = setInterval(() => {
      posicao += 14;
      if (!editor.current) return;
      editor.current.textContent = minutaContestacao.slice(0, posicao);
      if (posicao >= minutaContestacao.length) {
        clearInterval(intervalo.current);
        editor.current.textContent = minutaContestacao;
        avisar("✨ Minuta v1 gerada — edite livremente e aprove quando revisada");
      }
    }, 12);
  }

  return (
    <div className="grid gap-3.5 xl:grid-cols-[380px_1fr]">
      <div>
        <div className="mb-3.5 rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">Contexto carregado</h3>
          {contextoMinuta.map((item) => (
            <p key={item} className="flex items-start gap-2 py-1 text-[12.5px]">
              ✔ {item}
            </p>
          ))}
          <button
            type="button"
            onClick={gerarMinuta}
            disabled={gerada}
            className="mt-3 rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro disabled:opacity-60"
          >
            ✨ Gerar minuta de contestação
          </button>
        </div>

        <div className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">Histórico de versões</h3>
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-b border-plano-2">
                <td className="py-2 pr-2">
                  <SeloIA>v1 IA</SeloIA>
                </td>
                <td className="py-2 pr-2">10/07 10:52</td>
                <td className="py-2">rascunho gerado</td>
              </tr>
              {temVersaoHumana && (
                <tr className="border-b border-plano-2">
                  <td className="py-2 pr-2">
                    <Selo tom="azul">v2 humana</Selo>
                  </td>
                  <td className="py-2 pr-2">agora</td>
                  <td className="py-2">edições do Dr. Gustavo</td>
                </tr>
              )}
              {aprovada && (
                <tr>
                  <td className="py-2 pr-2">
                    <Selo tom="verde">v3 aprovada</Selo>
                  </td>
                  <td className="py-2 pr-2">agora</td>
                  <td className="py-2">liberada para protocolo manual</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-2.5 text-[11px] text-suave">
            🔒 O sistema nunca protocola automaticamente. Protocolo é sempre ato do advogado.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className={gerada ? "" : "invisible"}>
            <SeloIA>Gerado por IA — pendente de revisão humana</SeloIA>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-borda px-3 py-1.5 text-[11.5px] font-semibold hover:bg-plano"
              onClick={() => {
                setTemVersaoHumana(true);
                avisar("Suas edições foram salvas como versão humana (v2)");
              }}
            >
              Salvar edição
            </button>
            <button
              type="button"
              className="rounded-lg bg-verde px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-verde-escuro"
              onClick={() => {
                setAprovada(true);
                avisar("✅ Versão aprovada e registrada em auditoria — pronta para protocolo manual");
              }}
            >
              Aprovar versão
            </button>
          </div>
        </div>

        <div
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="min-h-[380px] whitespace-pre-wrap rounded-xl border border-borda bg-superficie px-6 py-6 font-serif text-[13.5px] leading-[1.8] outline-none md:px-8"
        >
          Clique em “Gerar minuta de contestação” para ver a IA montar a peça com todo o contexto
          do caso.
        </div>
      </div>

      {elemento}
    </div>
  );
}
