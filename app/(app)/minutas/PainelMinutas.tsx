"use client";

/*
 * Minutas com IA — agora PERSISTIDAS. Gerar salva a peça no banco; editar e
 * aprovar atualizam o registro; a lista à esquerda reabre as minutas salvas.
 * Regra do produto: o sistema nunca protocola sozinho — aprovar só marca
 * "pronta para protocolo manual".
 *
 * Sem a ANTHROPIC_API_KEY (iaAtiva=false), cai no roteiro de demonstração
 * (efêmero, sem gravar) — degrada com elegância.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { useAviso } from "@/components/useAviso";
import {
  gerarMinuta,
  salvarEdicaoMinuta,
  aprovarMinuta,
  excluirMinuta,
  type MinutaSalva,
} from "@/lib/acoes/minutas";
import { contextoMinuta, minutaContestacao } from "@/lib/dados";

interface ProcessoParaMinuta {
  id: string;
  numero: string;
  titulo: string;
}

interface Props {
  processos: ProcessoParaMinuta[];
  iaAtiva: boolean;
  minutasSalvas: MinutaSalva[];
}

const ROTULO_STATUS: Record<MinutaSalva["status"], { texto: string; tom: "cinza" | "azul" | "verde" }> = {
  RASCUNHO_IA: { texto: "rascunho IA", tom: "cinza" },
  EDITADA: { texto: "editada", tom: "azul" },
  APROVADA: { texto: "aprovada", tom: "verde" },
};

export function PainelMinutas({ processos, iaAtiva, minutasSalvas }: Props) {
  const { avisar, elemento } = useAviso();
  const [lista, setLista] = useState<MinutaSalva[]>(minutasSalvas);
  const [atual, setAtual] = useState<MinutaSalva | null>(null);
  const [processoId, setProcessoId] = useState(processos[0]?.id ?? "");
  const [instrucoes, setInstrucoes] = useState("");
  const [gerando, iniciarGeracao] = useTransition();
  const [salvando, iniciarSalvar] = useTransition();

  // Demonstração (sem IA): estados locais, sem persistir.
  const [demoGerada, setDemoGerada] = useState(false);
  const [demoHumana, setDemoHumana] = useState(false);
  const [demoAprovada, setDemoAprovada] = useState(false);

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

  function textoDoEditor(): string {
    return editor.current?.textContent ?? "";
  }

  function trocarStatus(id: string, status: MinutaSalva["status"], teor: string) {
    setLista((atuais) => atuais.map((m) => (m.id === id ? { ...m, status, teor } : m)));
    setAtual((a) => (a && a.id === id ? { ...a, status, teor } : a));
  }

  function gerarComIa() {
    if (!processoId) return;
    iniciarGeracao(async () => {
      const r = await gerarMinuta(processoId, instrucoes);
      if (r.ok) {
        setAtual(r.minuta);
        setLista((atuais) => [r.minuta, ...atuais]);
        digitar(r.minuta.teor, () =>
          avisar("✨ Minuta gerada e salva — revise, edite e aprove quando estiver de acordo"),
        );
      } else {
        avisar(`⚠️ ${r.erro}`);
      }
    });
  }

  function abrirMinuta(m: MinutaSalva) {
    clearInterval(intervalo.current);
    setAtual(m);
    if (editor.current) editor.current.textContent = m.teor;
  }

  function salvarEdicao() {
    if (!atual || salvando) return;
    const teor = textoDoEditor();
    iniciarSalvar(async () => {
      const r = await salvarEdicaoMinuta(atual.id, teor);
      if (r.ok) {
        trocarStatus(atual.id, "EDITADA", teor);
        avisar("💾 Edição salva como versão humana (v2)");
      } else {
        avisar(`⚠️ ${r.erro}`);
      }
    });
  }

  function aprovar() {
    if (!atual || salvando) return;
    const teor = textoDoEditor();
    iniciarSalvar(async () => {
      const r = await aprovarMinuta(atual.id, teor);
      if (r.ok) {
        trocarStatus(atual.id, "APROVADA", teor);
        avisar("✅ Versão aprovada e registrada — pronta para protocolo manual");
      } else {
        avisar(`⚠️ ${r.erro}`);
      }
    });
  }

  async function excluir(m: MinutaSalva): Promise<void> {
    const r = await excluirMinuta(m.id);
    if (r.ok) {
      setLista((atuais) => atuais.filter((x) => x.id !== m.id));
      if (atual?.id === m.id) {
        setAtual(null);
        if (editor.current) editor.current.textContent = "";
      }
      avisar("Minuta excluída.");
    } else {
      avisar(`⚠️ ${r.erro}`);
    }
  }

  function gerarDemonstracao() {
    setDemoGerada(true);
    digitar(minutaContestacao, () =>
      avisar("✨ Minuta v1 gerada (demonstração) — edite livremente e aprove quando revisada"),
    );
  }

  // Histórico de versões: no modo real vem do status da minuta atual; no
  // modo demonstração, dos estados locais.
  const verIa = iaAtiva ? Boolean(atual) : demoGerada;
  const verHumana = iaAtiva ? atual?.status === "EDITADA" || atual?.status === "APROVADA" : demoHumana;
  const verAprovada = iaAtiva ? atual?.status === "APROVADA" : demoAprovada;
  const mostrarSeloGerado = iaAtiva ? Boolean(atual) : demoGerada;

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
                disabled={demoGerada}
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

        {iaAtiva && lista.length > 0 && (
          <div className="mb-3.5 rounded-xl border border-borda bg-superficie p-4">
            <h3 className="mb-2 text-[13px] font-bold text-navy">Minutas salvas</h3>
            <ul className="space-y-1.5">
              {lista.map((m) => (
                <li
                  key={m.id}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                    atual?.id === m.id ? "border-verde bg-selo-verde" : "border-borda"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => abrirMinuta(m)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate font-mono text-[12px] font-bold text-navy">
                      {m.titulo}
                    </span>
                    <Selo tom={ROTULO_STATUS[m.status].tom}>{ROTULO_STATUS[m.status].texto}</Selo>
                  </button>
                  <BotaoExcluir acao={() => excluir(m)} confirmacao={`Excluir "${m.titulo}"?`} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">Histórico de versões</h3>
          <table className="w-full text-[13px]">
            <tbody>
              {verIa && (
                <tr className="border-b border-plano-2 last:border-b-0">
                  <td className="py-2 pr-2">
                    <SeloIA>v1 IA</SeloIA>
                  </td>
                  <td className="py-2">rascunho gerado</td>
                </tr>
              )}
              {verHumana && (
                <tr className="border-b border-plano-2 last:border-b-0">
                  <td className="py-2 pr-2">
                    <Selo tom="azul">v2 humana</Selo>
                  </td>
                  <td className="py-2">edições do advogado</td>
                </tr>
              )}
              {verAprovada && (
                <tr>
                  <td className="py-2 pr-2">
                    <Selo tom="verde">v3 aprovada</Selo>
                  </td>
                  <td className="py-2">liberada para protocolo manual</td>
                </tr>
              )}
              {!verIa && (
                <tr>
                  <td className="py-2 text-suave" colSpan={2}>
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
          <span className={mostrarSeloGerado ? "" : "invisible"}>
            <SeloIA>Gerado por IA — pendente de revisão humana</SeloIA>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={iaAtiva ? !atual || salvando : false}
              className="rounded-lg border border-borda px-3 py-1.5 text-[11.5px] font-semibold hover:bg-plano disabled:opacity-60"
              onClick={() => {
                if (iaAtiva) salvarEdicao();
                else {
                  setDemoHumana(true);
                  avisar("Suas edições foram salvas como versão humana (v2)");
                }
              }}
            >
              {salvando ? "…" : "Salvar edição"}
            </button>
            <button
              type="button"
              disabled={iaAtiva ? !atual || salvando : false}
              className="rounded-lg bg-verde px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-verde-escuro disabled:opacity-60"
              onClick={() => {
                if (iaAtiva) aprovar();
                else {
                  setDemoAprovada(true);
                  avisar("✅ Versão aprovada e registrada — pronta para protocolo manual");
                }
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
          {iaAtiva
            ? "Escolha o processo, oriente o redator se quiser e clique em “Gerar minuta com IA” — ou abra uma minuta salva."
            : "Clique em “Gerar minuta de contestação” para ver a IA montar a peça com todo o contexto do caso."}
        </div>
      </div>

      {elemento}
    </div>
  );
}
