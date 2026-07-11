import type { Metadata } from "next";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { excluirProcesso } from "@/lib/acoes/processos";
import { bd } from "@/lib/bd";
import { formatarMoeda } from "@/lib/formatar";
import { AreaProcesso } from "@/lib/generated/prisma/enums";
import { AREAS, seloDaFase } from "@/lib/opcoes";

export const metadata: Metadata = { title: "Processos" };
export const dynamic = "force-dynamic";

export default async function PaginaProcessos({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; erro?: string }>;
}) {
  const { area, erro } = await searchParams;
  const areaFiltrada =
    area && area in AreaProcesso ? (area as AreaProcesso) : undefined;

  const [processos, contagemPorArea, total] = await Promise.all([
    bd.processo.findMany({
      where: areaFiltrada ? { area: areaFiltrada } : undefined,
      include: {
        cliente: { select: { nome: true } },
        _count: { select: { prazos: true } },
      },
      orderBy: { criadoEm: "desc" },
    }),
    bd.processo.groupBy({ by: ["area"], _count: { _all: true } }),
    bd.processo.count(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-navy">Processos</h1>
          <p className="mb-4 mt-0.5 text-xs text-suave">
            {total === 0
              ? "Carteira real, gravada no banco de dados na nuvem."
              : `${total} processo${total === 1 ? "" : "s"} no banco de dados.`}
          </p>
        </div>
        <Link
          href="/processos/novo"
          className="rounded-lg bg-verde px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          + Novo processo
        </Link>
      </div>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      {total > 0 && (
        <div className="mb-3.5 flex flex-wrap gap-2">
          <Link href="/processos">
            <Selo tom={areaFiltrada ? "cinza" : "navy"}>Todos ({total})</Selo>
          </Link>
          {contagemPorArea.map((grupo) => (
            <Link key={grupo.area} href={`/processos?area=${grupo.area}`}>
              <Selo tom={areaFiltrada === grupo.area ? "navy" : "cinza"}>
                {AREAS[grupo.area]} ({grupo._count._all})
              </Selo>
            </Link>
          ))}
        </div>
      )}

      {total === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-10 text-center">
          <p className="text-[15px] font-semibold text-navy">Nenhum processo ainda</p>
          <p className="mx-auto mt-1 max-w-md text-[12.5px] text-suave">
            Cadastre o primeiro processo — se o cliente dele ainda não existir,{" "}
            <Link href="/clientes/novo" className="font-semibold text-verde-escuro underline">
              cadastre o cliente antes
            </Link>
            .
          </p>
          <Link
            href="/processos/novo"
            className="mt-4 inline-block rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
          >
            Cadastrar o primeiro processo
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-borda bg-superficie p-4">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-borda text-left text-[11px] uppercase tracking-wide text-suave">
                <th className="px-2.5 py-2 font-semibold">Processo</th>
                <th className="px-2.5 py-2 font-semibold">Cliente</th>
                <th className="px-2.5 py-2 font-semibold">Área</th>
                <th className="px-2.5 py-2 font-semibold">Fase</th>
                <th className="px-2.5 py-2 text-right font-semibold">Valor da causa</th>
                <th className="px-2.5 py-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processos.map((processo) => {
                const fase = seloDaFase(processo.fase);
                return (
                  <tr key={processo.id} className="border-b border-plano-2 last:border-b-0 hover:bg-realce">
                    <td className="max-w-sm px-2.5 py-2.5">
                      <p className="truncate font-bold">{processo.titulo}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-suave">{processo.numero}</p>
                      {processo.tribunal && (
                        <p className="mt-0.5 truncate text-xs text-suave">{processo.tribunal}</p>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5">{processo.cliente.nome}</td>
                    <td className="whitespace-nowrap px-2.5 py-2.5">{AREAS[processo.area]}</td>
                    <td className="px-2.5 py-2.5">
                      <Selo tom={fase.tom}>{fase.rotulo}</Selo>
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2.5 text-right tabular-nums">
                      {processo.valorCausa != null ? formatarMoeda(Number(processo.valorCausa)) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2.5 text-right">
                      <Link
                        href={`/processos/${processo.id}/editar`}
                        className="mr-2 rounded-lg border border-borda px-2.5 py-1 text-[11px] font-semibold hover:bg-plano"
                      >
                        Editar
                      </Link>
                      <BotaoExcluir
                        acao={excluirProcesso.bind(null, processo.id)}
                        confirmacao={`Excluir o processo ${processo.numero}? Os ${processo._count.prazos} prazo(s) dele serão excluídos junto.`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
