import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { bd } from "@/lib/bd";
import { formatarData, formatarMoeda } from "@/lib/formatar";
import { AREAS, seloDaFase } from "@/lib/opcoes";
import { consultarProcesso, type ProcessoDetalhado } from "@/lib/juris/datajud";
import { iaConfigurada, resumirProcessoComClaude, type AndamentoParaIa } from "@/lib/ia";

export const metadata: Metadata = { title: "Processo" };
export const dynamic = "force-dynamic";
// Consulta o DataJud (CNJ) e chama a IA — roda em São Paulo, com folga de tempo.
export const preferredRegion = "gru1";
export const runtime = "nodejs";
export const maxDuration = 60;

function dataCurta(d: Date): string {
  return formatarData(d);
}

// Cartão do resumo da IA — componente assíncrono próprio para carregar
// dentro de um <Suspense>: a página aparece na hora e o resumo entra
// quando fica pronto (a IA leva alguns segundos).
async function ResumoIA({
  numero,
  classe,
  assuntos,
  orgaoJulgador,
  grau,
  andamentos,
}: {
  numero: string;
  classe: string;
  assuntos: string[];
  orgaoJulgador: string;
  grau: string;
  andamentos: AndamentoParaIa[];
}) {
  let resumo;
  try {
    resumo = await resumirProcessoComClaude({ numero, classe, assuntos, orgaoJulgador, grau, andamentos });
  } catch {
    return (
      <div className="rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
        Não foi possível gerar o resumo agora — os andamentos abaixo continuam disponíveis.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#D9CFF0] bg-ia-fundo p-4">
      <div className="mb-2 flex items-center gap-2">
        <SeloIA>Resumo da IA</SeloIA>
        <span className="text-[11px] text-suave">leitura automática · confira sempre nos autos</span>
      </div>
      <p className="text-[13.5px] leading-relaxed text-tinta">{resumo.resumo}</p>

      <p className="mt-3 text-[12.5px]">
        <span className="font-semibold text-navy">Fase provável:</span>{" "}
        <span className="text-tinta">{resumo.faseProvavel}</span>
      </p>

      {resumo.ultimosAndamentos.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-suave">
            Últimos andamentos, em miúdos
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[12.5px] text-tinta">
            {resumo.ultimosAndamentos.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {resumo.pontosDeAtencao.length > 0 && (
        <div className="mt-3 rounded-lg border border-[#E7D4A8] bg-selo-ambar px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ambar">
            Pontos de atenção
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[12.5px] text-tinta">
            {resumo.pontosDeAtencao.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CarregandoResumo() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
      <SeloIA>Resumo da IA</SeloIA>
      lendo os andamentos e preparando o resumo…
    </div>
  );
}

export default async function PaginaProcesso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const processo = await bd.processo.findUnique({
    where: { id },
    include: {
      cliente: { select: { nome: true } },
      prazos: { where: { concluido: false }, orderBy: { vencimento: "asc" } },
    },
  });
  if (!processo) notFound();

  const fase = seloDaFase(processo.fase);

  // Andamentos (DataJud) e intimações já salvas (DJEN) em paralelo.
  const [consulta, intimacoes] = await Promise.all([
    consultarProcesso(processo.numero),
    bd.intimacao
      .findMany({ where: { numeroProcesso: processo.numero }, orderBy: { dataDisponibilizacao: "desc" }, take: 10 })
      .catch(() => [] as Awaited<ReturnType<typeof bd.intimacao.findMany>>),
  ]);
  const detalhe: ProcessoDetalhado | null = consulta.processo;

  const andamentosParaIa: AndamentoParaIa[] = (detalhe?.movimentos ?? []).map((m) => ({
    nome: m.nome,
    data: dataCurta(m.data),
  }));

  return (
    <div>
      <Link href="/processos" className="text-xs font-semibold text-verde-escuro hover:underline">
        ← Processos
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-navy">{processo.titulo}</h1>
          <p className="mt-0.5 font-mono text-[12px] text-suave">{processo.numero}</p>
        </div>
        <Link
          href={`/processos/${processo.id}/editar`}
          className="rounded-lg border border-borda px-3 py-1.5 text-[12px] font-semibold hover:bg-plano"
        >
          Editar
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Selo tom="cinza">{AREAS[processo.area]}</Selo>
        <Selo tom={fase.tom}>{fase.rotulo}</Selo>
        {processo.tribunal && <span className="text-xs text-suave">{processo.tribunal}</span>}
        <span className="text-xs text-suave">
          cliente: <b className="text-tinta">{processo.cliente.nome}</b>
        </span>
        {processo.valorCausa != null && (
          <span className="text-xs text-suave">
            valor: <b className="text-tinta">{formatarMoeda(Number(processo.valorCausa))}</b>
          </span>
        )}
      </div>

      {/* Resumo da IA — a partir dos andamentos do DataJud */}
      <div className="mt-5">
        {consulta.erro ? (
          <div className="rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
            {consulta.erro}
          </div>
        ) : detalhe && detalhe.movimentos.length > 0 && iaConfigurada() ? (
          <Suspense fallback={<CarregandoResumo />}>
            <ResumoIA
              numero={detalhe.numero}
              classe={detalhe.classe}
              assuntos={detalhe.assuntos}
              orgaoJulgador={detalhe.orgaoJulgador}
              grau={detalhe.grau}
              andamentos={andamentosParaIa}
            />
          </Suspense>
        ) : detalhe && detalhe.movimentos.length > 0 ? (
          <div className="rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
            Configure a <b>ANTHROPIC_API_KEY</b> para ver o resumo da IA. Os andamentos abaixo já vêm do DataJud.
          </div>
        ) : (
          <div className="rounded-xl border border-borda bg-superficie p-4 text-[12.5px] text-suave">
            Sem andamentos públicos no DataJud para este número ainda.
          </div>
        )}
      </div>

      {/* Andamentos (linha do tempo) */}
      {detalhe && detalhe.movimentos.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[13px] font-bold text-navy">Andamentos (DataJud/CNJ)</h2>
          <ol className="space-y-2 border-l-2 border-borda pl-4">
            {detalhe.movimentos.slice(0, 25).map((m, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-verde" />
                <p className="text-[12.5px] text-tinta">{m.nome}</p>
                <p className="text-[11px] text-suave">{dataCurta(m.data)}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Intimações capturadas do DJEN para este processo (Passo 18) */}
      {intimacoes.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[13px] font-bold text-navy">Intimações capturadas (DJEN)</h2>
          <ul className="space-y-2">
            {intimacoes.map((it) => (
              <li key={it.id} className="rounded-lg border border-borda bg-superficie p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {it.tipo && <Selo tom="vermelho">{it.tipo}</Selo>}
                  {it.tribunal && <Selo tom="cinza">{it.tribunal}</Selo>}
                  {it.dataDisponibilizacao && (
                    <span className="text-[11px] text-suave">{it.dataDisponibilizacao}</span>
                  )}
                </div>
                {(it.orgao || it.classe) && (
                  <p className="mt-1 text-[12px] text-tinta">
                    {[it.orgao, it.classe].filter(Boolean).join(" · ")}
                  </p>
                )}
                {it.resumo && <p className="mt-1 text-[11.5px] leading-relaxed text-suave">{it.resumo}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
