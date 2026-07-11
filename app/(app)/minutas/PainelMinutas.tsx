"use client";

/*
 * Geração de minuta com histórico de versões (IA → humana → aprovada)
 * e editor livre. Regra do produto: o sistema nunca protocola sozinho.
 *
 * Dois modos:
 * - IA real (ANTHROPIC_API_KEY configurada): escolhe um processo do
 *   banco, orienta o redator e a server action pede a peça ao Claude.
 * - Demonstração (sem chave): reproduz o roteiro do protótipo.
 *
 * O efeito de digitação usa o DOM direto (ref) para não brigar com o
 * contentEditable durante as edições do usuário.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { useAviso } from "@/components/useAviso";
import { gerarMinutaReal } from "@/lib/acoes/minutas";
import { contextoMinuta, minutaContestacao } from "@/lib/dados";

interface ProcessoParaMinuta {
  id: string;
  numero: string;
  titulo: string;
}

interface Props {
  processos: ProcessoParaMinuta[];
  iaAtiva: boolean;
}

export function PainelMinutas({ processos, iaAtiva }: Props) {
  const { avisar, elemento } = useAviso();
  const [gerada, setGerada] = useState(false);
  const [temVersaoHumana, setTemVersaoHumana] = useState(false);
  const [aprovada, setAprovada] = useState(false);
  const [processoId, setProcessoId] = useState(processos[0]?.id ?? "");
  const [instrucoes, setInstrucoes] = useState("");
  const [gerando, iniciarGeracao] = useTransition();
  const editor = useRef<HTMLDivElement>(null);
  const intervalo = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(intervalo.current), []);

  function digitar(texto: string, aoTerminar?: () => void) {
    if (!editor.current) return;
    clearInterval(intervalo.current);
    editor.current.textContent = "";
    let posicao = 0;
    intervalo.current = setInterval(() => {
      posicao += 24;
      if (!editor.current) return;
      editor.current.textContent = texto.slice(0, posicao);
      if (posicao >= texto.length) {
        clearInterval(intervalo.current);
        editor.current.textContent = texto;
        aoTerminar?.();
      }
    }, 8);
  }

  function gerarComIa() {
    if (!processoId) return;
    iniciarGeracao(async () => {
      const resultado = await gerarMinutaReal(processoId, instrucoes);
      if (resultado.ok) {
        setGerada(true);
        digitar(resultado.texto, () =>
          avisar("✨ Minuta gerada pela IA — revise, edite e aprove quando estiver de acordo"),
        );
      } else {
        avisar(`⚠️ ${resultado.erro}`);
      }
    });
  }

  function gerarDemonstracao() {
    setGerada(true);
    digitar(minutaContestacao, () =>
      avisar("✨ Minuta v1 gerada (demonstração) — edite livremente e aprove quando revisada"),
    );
  }

  return (
    <div className="grid gap-3.5 xl:grid-cols-[380px_1fr]">
      <div>
        <div className="mb-3.5 rounded-xl border border-borda bg-superficie p-4">
          {iaAtiva && processos.length > 0 ? (
            <>
              <h3 className="mb-3 text-[13px] font-bold text-navy">Gerar com IA</h3>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-suave">Processo</span>
                <select
                  value={processoId}
                  onChange={(evento) => setProcessoId(evento.target.value)}
                  className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
                >
                  {processos.map((processo) => (
                    <option key={processo.id} value={processo.id}>
                      {processo.numero} — {processo.titulo}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold text-suave">
                  Orientações ao redator (opcional)
                </span>
                <textarea
                  value={instrucoes}
                  onChange={(evento) => setInstrucoes(evento.target.value)}
                  rows={3}
                  placeholder="Ex.: contestação focando na preliminar de incompetência territorial"
                  className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
                />
              </label>

              <p className="mt-2 text-[11px] text-suave">
                A IA recebe a capa do processo, o cliente e os prazos pendentes — e devolve
                um rascunho com a nota de pendências.
              </p>

              <button
                type="button"
                onClick={gerarComIa}
                disabled={gerando}
                className="mt-3 rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro disabled:opacity-60"
              >
                {gerando ? "✨ Redigindo… (pode levar ~1 min)" : "✨ Gerar minuta com IA"}
              </button>
            </>
          ) : iaAtiva ? (
            <>
              <h3 className="mb-2 text-[13px] font-bold text-navy">Gerar com IA</h3>
              <p className="text-[12.5px] text-suave">
                A IA está configurada, mas não há processos no banco. Cadastre um processo
                para gerar a primeira minuta real.
              </p>
              <Link
                href="/processos/novo"
                className="mt-3 inline-block rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
              >
                Cadastrar processo
              </Link>
            </>
          ) : (
            <>
              <h3 className="mb-3 text-[13px] font-bold text-navy">Contexto carregado</h3>
              {contextoMinuta.map((item) => (
                <p key={item} className="flex items-start gap-2 py-1 text-[12.5px]">
                  ✔ {item}
                </p>
              ))}
              <button
                type="button"
                onClick={gerarDemonstracao}
                disabled={gerada}
                className="mt-3 rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro disabled:opacity-60"
              >
                ✨ Gerar minuta de contestação
              </button>
              <p className="mt-3 rounded-lg border border-[#C9DAEA] bg-selo-azul px-2.5 py-2 text-[11px] text-azul">
                Modo demonstração. Para redigir minutas reais com o Claude, configure a
                variável <b>ANTHROPIC_API_KEY</b> (veja o README).
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">Histórico de versões</h3>
          <table className="w-full text-[13px]">
            <tbody>
              {gerada && (
                <tr className="border-b border-plano-2 last:border-b-0">
                  <td className="py-2 pr-2">
                    <SeloIA>v1 IA</SeloIA>
                  </td>
                  <td className="py-2 pr-2">agora</td>
                  <td className="py-2">rascunho gerado</td>
                </tr>
              )}
              {temVersaoHumana && (
                <tr className="border-b border-plano-2 last:border-b-0">
                  <td className="py-2 pr-2">
                    <Selo tom="azul">v2 humana</Selo>
                  </td>
                  <td className="py-2 pr-2">agora</td>
                  <td className="py-2">edições do advogado</td>
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
              {!gerada && (
                <tr>
                  <td className="py-2 text-suave" colSpan={3}>
                    Nenhuma versão ainda — gere a primeira minuta.
                  </td>
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
                avisar("✅ Versão aprovada e registrada — pronta para protocolo manual");
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
          {iaAtiva && processos.length > 0
            ? "Escolha o processo, oriente o redator se quiser e clique em “Gerar minuta com IA”."
            : "Clique em “Gerar minuta de contestação” para ver a IA montar a peça com todo o contexto do caso."}
        </div>
      </div>

      {elemento}
    </div>
  );
}
