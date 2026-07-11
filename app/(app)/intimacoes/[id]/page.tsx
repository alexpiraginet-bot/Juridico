import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { iaConfigurada, resumirIntimacaoComClaude } from "@/lib/ia";

export const metadata: Metadata = { title: "Publicação · DJEN" };
export const dynamic = "force-dynamic";
// Chama a IA para resumir — roda em São Paulo, com folga de tempo.
export const preferredRegion = "gru1";
export const runtime = "nodejs";
export const maxDuration = 60;

async function ResumoIA({
  numeroProcesso,
  tipo,
  orgao,
  classe,
  teor,
}: {
  numeroProcesso: string;
  tipo: string;
  orgao: string;
  classe: string;
  teor: string;
}) {
  let r;
  try {
    r = await resumirIntimacaoComClaude({ numeroProcesso, tipo, orgao, classe, teor });
  } catch {
    return (
      <div className="rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
        Não foi possível gerar o resumo agora — o texto completo está logo abaixo.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#D9CFF0] bg-ia-fundo p-4">
      <div className="mb-2 flex items-center gap-2">
        <SeloIA>Resumo da IA</SeloIA>
        <span className="text-[11px] text-suave">leitura automática · confira no texto oficial</span>
      </div>
      <p className="text-[13.5px] leading-relaxed text-tinta">{r.resumo}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-borda bg-superficie px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-suave">O que pede</p>
          <p className="mt-0.5 text-[12.5px] text-tinta">{r.oQuePede}</p>
        </div>
        <div className="rounded-lg border border-[#E7D4A8] bg-selo-ambar px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ambar">
            Prazo mencionado no texto
          </p>
          <p className="mt-0.5 text-[12.5px] text-tinta">{r.prazoMencionado}</p>
        </div>
      </div>

      {r.pontosDeAtencao.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-suave">
            Pontos de atenção
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[12.5px] text-tinta">
            {r.pontosDeAtencao.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-[11px] text-suave">
        ⚠️ A IA não protocola nem lança prazo sozinha — a decisão é sempre do advogado.
      </p>
    </div>
  );
}

function CarregandoResumo() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
      <SeloIA>Resumo da IA</SeloIA>
      lendo a publicação e preparando o resumo…
    </div>
  );
}

export default async function PaginaIntimacao({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario();
  const { id } = await params;

  const intimacao = await bd.intimacao.findUnique({ where: { id } });
  // Isolamento: só o dono da captura abre a publicação.
  if (!intimacao || intimacao.usuarioId !== usuario.id) notFound();

  const teor = intimacao.teor ?? intimacao.resumo ?? "";

  return (
    <div>
      <Link href="/djen" className="text-xs font-semibold text-verde-escuro hover:underline">
        ← Meus processos
      </Link>

      <h1 className="mt-2 font-mono text-[15px] font-bold text-navy">
        {intimacao.numeroProcesso || "Publicação"}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {intimacao.tipo && <Selo tom="vermelho">{intimacao.tipo}</Selo>}
        {intimacao.tribunal && <Selo tom="cinza">{intimacao.tribunal}</Selo>}
        {intimacao.dataDisponibilizacao && (
          <span className="text-xs text-suave">{intimacao.dataDisponibilizacao}</span>
        )}
      </div>
      {(intimacao.orgao || intimacao.classe) && (
        <p className="mt-1.5 text-[12.5px] text-tinta">
          {[intimacao.orgao, intimacao.classe].filter(Boolean).join(" · ")}
        </p>
      )}

      {intimacao.numeroProcesso && (
        <Link
          href={`/processos`}
          className="mt-1 inline-block text-[11.5px] text-suave hover:text-verde-escuro hover:underline"
        >
          ver este processo na carteira →
        </Link>
      )}

      {/* Resumo da IA */}
      <div className="mt-5">
        {teor && iaConfigurada() ? (
          <Suspense fallback={<CarregandoResumo />}>
            <ResumoIA
              numeroProcesso={intimacao.numeroProcesso}
              tipo={intimacao.tipo ?? ""}
              orgao={intimacao.orgao ?? ""}
              classe={intimacao.classe ?? ""}
              teor={teor}
            />
          </Suspense>
        ) : teor ? (
          <div className="rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
            Configure a <b>ANTHROPIC_API_KEY</b> para ver o resumo da IA. O texto completo está abaixo.
          </div>
        ) : null}
      </div>

      {/* Publicação na íntegra */}
      <div className="mt-6">
        <h2 className="mb-2 text-[13px] font-bold text-navy">Publicação na íntegra</h2>
        <div className="rounded-xl border border-borda bg-superficie p-4">
          {teor ? (
            <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-tinta">{teor}</p>
          ) : (
            <p className="text-[12.5px] text-suave">Teor não disponível para esta publicação.</p>
          )}
        </div>
        <p className="mt-2 text-[11px] text-suave">
          Fonte: DJEN / CNJ (API Comunica). Texto capturado pela sua OAB.
        </p>
      </div>
    </div>
  );
}
