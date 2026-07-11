"use client";

/*
 * Inbox do WhatsApp em três colunas: lista de conversas, chat e o
 * painel da IA (relato fático, linha do tempo, checklist e perguntas).
 *
 * Componente de cliente: troca de conversa, envio de mensagem e os
 * avisos de demonstração acontecem no navegador.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { LinhaDoTempo } from "@/components/LinhaDoTempo";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { useAviso } from "@/components/useAviso";
import { conversaNaoTriada, conversas } from "@/lib/dados";
import type { Mensagem } from "@/lib/tipos";
import { analisarAtendimento } from "@/lib/acoes/atendimentos";
import type { AnaliseDoAtendimento } from "@/lib/ia";

export function PainelAtendimentos() {
  const { avisar, elemento } = useAviso();
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [mensagens, setMensagens] = useState<Mensagem[]>(conversas[0].mensagens);
  const [rascunho, setRascunho] = useState("");
  // Análise gerada pela IA (relato fático + linha do tempo + checklist +
  // perguntas). Null = mostra o rascunho de demonstração da conversa.
  const [analise, setAnalise] = useState<AnaliseDoAtendimento | null>(null);
  const [erroIA, setErroIA] = useState<string | null>(null);
  const [gerando, iniciarGeracao] = useTransition();
  const fimDoChat = useRef<HTMLDivElement>(null);

  const conversa = conversas[indiceAtivo];

  useEffect(() => {
    fimDoChat.current?.scrollIntoView();
  }, [mensagens]);

  function trocarConversa(indice: number) {
    setIndiceAtivo(indice);
    setMensagens(conversas[indice].mensagens);
    // Cada conversa recomeça no rascunho de demonstração até a IA rodar.
    setAnalise(null);
    setErroIA(null);
  }

  function enviarMensagem() {
    const texto = rascunho.trim();
    if (!texto) return;
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setMensagens((atuais) => [...atuais, { de: "escritorio", texto, hora, enviadaAgora: true }]);
    setRascunho("");
  }

  // Chama a IA (no servidor) para redigir o relato a partir da conversa atual.
  function gerarRelato() {
    setErroIA(null);
    iniciarGeracao(async () => {
      const r = await analisarAtendimento(
        mensagens.map((m) => ({ de: m.de, texto: m.texto, documento: m.documento })),
      );
      if (r.ok) {
        setAnalise(r.analise);
        avisar("✨ IA: relato fático gerado — confira antes de usar");
      } else {
        setErroIA(r.erro);
      }
    });
  }

  // O painel mostra a análise da IA quando existe; senão, o rascunho de
  // demonstração da conversa. O percentual do checklist é derivado.
  const relatoFatico = analise?.relatoFatico ?? conversa.relatoFatico;
  const linhaDoTempo = analise?.linhaDoTempo ?? conversa.linhaDoTempo;
  const checklist = analise?.checklist ?? conversa.checklist;
  const perguntas = analise?.perguntas ?? conversa.perguntas;
  const percentualDocs = analise
    ? Math.round((checklist.filter((i) => i.recebido).length / Math.max(checklist.length, 1)) * 100)
    : conversa.percentualDocs;

  return (
    <div className="grid gap-3.5 lg:h-[calc(100vh-185px)] lg:grid-cols-[260px_1fr_330px]">
      {/* Lista de conversas */}
      <div className="max-h-56 overflow-y-auto rounded-xl border border-borda bg-superficie lg:max-h-none">
        {conversas.map((item, indice) => (
          <button
            key={item.id}
            type="button"
            onClick={() => trocarConversa(indice)}
            className={`block w-full border-b border-plano-2 px-3.5 py-3 text-left hover:bg-realce ${
              indice === indiceAtivo ? "border-l-[3px] border-l-verde bg-selo-verde" : ""
            }`}
          >
            <b className="block text-[13px]">{item.nome}</b>
            <small className="block truncate text-[11.5px] text-suave">{item.previa}</small>
            <span className="mt-1.5 flex items-center justify-between">
              <Selo tom={item.situacao.tom}>{item.situacao.texto}</Selo>
              <small className="text-suave">{item.horario}</small>
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => avisar(conversaNaoTriada.aviso)}
          className="block w-full px-3.5 py-3 text-left hover:bg-realce"
        >
          <b className="block text-[13px]">
            {conversaNaoTriada.nome} <Selo tom="azul">novo</Selo>
          </b>
          <small className="block truncate text-[11.5px] text-suave">{conversaNaoTriada.previa}</small>
          <span className="mt-1.5 flex items-center justify-between">
            <Selo tom={conversaNaoTriada.situacao.tom}>{conversaNaoTriada.situacao.texto}</Selo>
            <small className="text-suave">{conversaNaoTriada.horario}</small>
          </span>
        </button>
      </div>

      {/* Chat */}
      <div className="flex h-[60vh] flex-col overflow-hidden rounded-xl border border-borda bg-chat-fundo lg:h-auto">
        <div className="flex items-center gap-2.5 border-b border-borda bg-superficie px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white">
            {conversa.iniciais}
          </div>
          <div className="min-w-0">
            <b className="block truncate text-[13px]">{conversa.nome}</b>
            <small className="block truncate text-[11px] text-suave">{conversa.contexto}</small>
          </div>
          <Selo tom="navy">WhatsApp API oficial</Selo>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {mensagens.map((mensagem, indice) => (
            <div
              key={indice}
              className={`max-w-[75%] rounded-xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                mensagem.de === "cliente"
                  ? "self-start rounded-tl-sm bg-white"
                  : "self-end rounded-tr-sm bg-chat-bolha"
              }`}
            >
              {mensagem.texto}
              {mensagem.documento && (
                <span className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-borda bg-realce px-2.5 py-2 text-xs">
                  📄 {mensagem.documento} <SeloIA>classificado: doc. trabalhista</SeloIA>
                </span>
              )}
              <small className="mt-1 block text-right text-[10px] text-suave">
                {mensagem.hora}
                {mensagem.enviadaAgora && " ✓✓"}
              </small>
            </div>
          ))}
          <div ref={fimDoChat} />
        </div>

        <div className="flex gap-2 border-t border-borda bg-superficie p-2.5">
          <input
            value={rascunho}
            onChange={(evento) => setRascunho(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === "Enter") enviarMensagem();
            }}
            placeholder="Escreva uma mensagem…"
            className="flex-1 rounded-full border border-borda px-3.5 py-2 text-[13px] outline-none"
          />
          <button
            type="button"
            onClick={enviarMensagem}
            className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Painel da IA */}
      <div className="overflow-y-auto rounded-xl border border-borda bg-superficie p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeloIA>Análise da IA — sujeita à validação do advogado</SeloIA>
          <button
            type="button"
            onClick={gerarRelato}
            disabled={gerando}
            className="ml-auto rounded-lg border border-[#D9CFF0] bg-ia-fundo px-3 py-1.5 text-[11.5px] font-semibold text-ia-tinta hover:brightness-95 disabled:opacity-60"
          >
            {gerando ? "lendo a conversa…" : analise ? "✨ Regerar relato" : "✨ Gerar relato com IA"}
          </button>
        </div>

        <p className="mt-2 text-[11px] text-suave">
          {analise
            ? "✨ Relato redigido pela IA a partir desta conversa — confira antes de usar."
            : "Mostrando o rascunho de demonstração. Gere o relato pela IA a partir das mensagens."}
        </p>

        {erroIA && (
          <p className="mt-2 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12px] font-semibold text-vermelho">
            ⚠️ {erroIA}
          </p>
        )}

        <h4 className="mb-2 mt-3.5 text-xs font-bold uppercase tracking-wide text-navy">
          Relato fático (rascunho)
        </h4>
        {gerando ? (
          <p className="flex items-center gap-2 rounded-lg border border-borda bg-realce p-2.5 text-[12.5px] text-suave">
            <SeloIA>IA</SeloIA> lendo a conversa e redigindo o relato…
          </p>
        ) : (
          <p className="rounded-lg border border-borda bg-realce p-2.5 text-[12.5px] leading-relaxed">
            {relatoFatico}
          </p>
        )}

        <h4 className="mb-2 mt-3.5 text-xs font-bold uppercase tracking-wide text-navy">
          Linha do tempo
        </h4>
        <LinhaDoTempo eventos={linhaDoTempo} />

        <h4 className="mb-2 mt-3.5 text-xs font-bold uppercase tracking-wide text-navy">
          Checklist documental{" "}
          <small className="font-bold text-verde-escuro">· {percentualDocs}% completo</small>
        </h4>
        <div className="mb-1 h-[7px] overflow-hidden rounded-md bg-selo-cinza">
          <i className="block h-full bg-verde" style={{ width: `${percentualDocs}%` }} />
        </div>
        {checklist.map((item) => (
          <p key={item.texto} className="flex items-start gap-2 py-1 text-[12.5px]">
            {item.recebido ? "✔" : <span className="text-vermelho">✘</span>} {item.texto}
          </p>
        ))}

        <h4 className="mb-2 mt-3.5 text-xs font-bold uppercase tracking-wide text-navy">
          Perguntas sugeridas ao cliente
        </h4>
        <ul className="space-y-1 text-[12.5px] leading-relaxed">
          {perguntas.map((pergunta) => (
            <li key={pergunta}>• {pergunta}</li>
          ))}
        </ul>

        <div className="mt-3.5 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-verde px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-verde-escuro"
            onClick={() =>
              avisar("📄 Solicitação de documentos pendentes enviada pelo WhatsApp (após sua revisão)")
            }
          >
            Cobrar docs pendentes
          </button>
          <button
            type="button"
            className="rounded-lg border border-borda px-3 py-1.5 text-[11.5px] font-semibold hover:bg-plano"
            onClick={() => avisar(`✅ Caso atualizado com o novo relato fático`)}
          >
            Atualizar caso
          </button>
        </div>
      </div>

      {elemento}
    </div>
  );
}
