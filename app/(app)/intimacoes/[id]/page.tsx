import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { compartilharIntimacao, revogarCompartilhamento } from "@/lib/acoes/compartilhamento";
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

export default async function PaginaIntimacao({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const usuario = await exigirUsuario();
  const { id } = await params;
  const { erro } = await searchParams;

  const intimacao = await bd.intimacao.findUnique({
    where: { id },
    include: {
      usuario: { select: { nome: true } }, // o dono da captura
      compartilhamentos: {
        include: { usuario: { select: { id: true, nome: true, email: true } } },
        orderBy: { criadoEm: "asc" },
      },
    },
  });

  // Quem abre: o dono da captura OU alguém com quem ela foi compartilhada.
  const ehDono = !!intimacao && intimacao.usuarioId === usuario.id;
  const recebida = !!intimacao && intimacao.compartilhamentos.some((c) => c.usuarioId === usuario.id);
  if (!intimacao || (!ehDono && !recebida)) notFound();

  // Só o dono compartilha. Ofereço os colegas do mesmo Team que ainda não têm.
  let colegas: { id: string; nome: string; email: string }[] = [];
  if (ehDono && usuario.teamId) {
    const jaTem = new Set(intimacao.compartilhamentos.map((c) => c.usuarioId));
    const equipe = await bd.usuario.findMany({
      where: { teamId: usuario.teamId, id: { not: usuario.id } },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, email: true },
    });
    colegas = equipe.filter((c) => !jaTem.has(c.id));
  }

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

      {/* Erro de compartilhamento (volta pela URL) */}
      {erro && (
        <p className="mt-4 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      {/* Recebida: aviso de leitura compartilhada */}
      {recebida && !ehDono && (
        <div className="mt-4 rounded-xl border border-[#C9DAEA] bg-selo-azul px-3.5 py-2.5 text-[12.5px] text-azul">
          🤝 Compartilhada com você
          {intimacao.usuario ? (
            <>
              {" "}
              por <b>{intimacao.usuario.nome}</b>
            </>
          ) : null}
          . Acesso de leitura.
        </div>
      )}

      {/* Dono: painel de compartilhamento */}
      {ehDono && (
        <div className="mt-4 rounded-xl border border-borda bg-superficie p-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[13px] font-bold text-navy">🤝 Compartilhar</span>
            <span className="text-[11.5px] text-suave">
              dá acesso de leitura a um colega do escritório
            </span>
          </div>

          {colegas.length > 0 ? (
            <form action={compartilharIntimacao} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="intimacaoId" value={intimacao.id} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-suave">Colega</span>
                <select
                  name="destinatarioId"
                  required
                  defaultValue=""
                  className="w-64 max-w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
                >
                  <option value="" disabled>
                    Escolha um colega…
                  </option>
                  {colegas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} · {c.email}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
              >
                Compartilhar
              </button>
            </form>
          ) : (
            <p className="mt-2 text-[12px] text-suave">
              {intimacao.compartilhamentos.length > 0
                ? "Todos os colegas do escritório já têm acesso a esta publicação."
                : "Cadastre colegas no seu escritório para poder compartilhar."}
            </p>
          )}

          {intimacao.compartilhamentos.length > 0 && (
            <div className="mt-3 border-t border-borda pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-suave">
                Compartilhada com
              </p>
              <ul className="space-y-1.5">
                {intimacao.compartilhamentos.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-tinta">
                      {c.usuario.nome} <span className="text-suave">· {c.usuario.email}</span>
                    </span>
                    <form action={revogarCompartilhamento}>
                      <input type="hidden" name="intimacaoId" value={intimacao.id} />
                      <input type="hidden" name="destinatarioId" value={c.usuario.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-[#E5C4C0] bg-white px-2.5 py-1 text-[11px] font-semibold text-vermelho hover:bg-selo-vermelho"
                      >
                        remover
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
