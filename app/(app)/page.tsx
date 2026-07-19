import Link from "next/link";
import { CartaoKpi } from "@/components/CartaoKpi";
import { ChipPrazo } from "@/components/ChipPrazo";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { formatarData } from "@/lib/formatar";
import { COLUNAS_TAREFA, ORDEM_COLUNAS } from "@/lib/opcoes";
import type { ColunaTarefa } from "@/lib/generated/prisma/enums";

export const dynamic = "force-dynamic";

function saudacaoDe(hora: number): string {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function PaginaDashboard() {
  const usuario = await exigirUsuarioDoEscritorio();
  const teamId = usuario.teamId;

  const agora = new Date();
  const hoje = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
  const em7 = new Date(hoje.getTime() + 7 * 86_400_000);
  const seteDiasAtras = new Date(agora.getTime() - 7 * 86_400_000);

  // Todas as consultas operacionais são carimbadas pelo escritório do usuário.
  // As duas ondas seguem paralelas para manter a home rápida.
  const carteiraP = Promise.all([
    bd.processo.count({ where: { teamId } }).catch(() => 0),
    bd.prazo.count({ where: { teamId, validado: false, concluido: false } }).catch(() => 0),
    bd.prazo
      .count({ where: { teamId, concluido: false, vencimento: { gte: hoje, lte: em7 } } })
      .catch(() => 0),
    bd.prazo
      .findMany({
        where: { teamId, concluido: false },
        orderBy: { vencimento: "asc" },
        take: 6,
        include: { processo: { select: { numero: true, titulo: true } } },
      })
      .catch(() => []),
    bd.prazo
      .findMany({
        where: { teamId, validado: false, concluido: false },
        orderBy: { vencimento: "asc" },
        take: 4,
        include: { processo: { select: { numero: true } } },
      })
      .catch(() => []),
  ]);

  const doTimeP = Promise.all([
    bd.tarefa.groupBy({ by: ["coluna"], where: { teamId }, _count: true }).catch(() => []),
    bd.intimacao
      .count({
        where: {
          criadoEm: { gte: seteDiasAtras },
          OR: [
            { destinatarios: { some: { usuario: { teamId } } } },
            { usuario: { teamId } }, // compatibilidade com capturas anteriores à migração
          ],
        },
      })
      .catch(() => 0),
    bd.conversaWhatsapp.count({ where: { teamId } }).catch(() => 0),
    bd.minuta.groupBy({ by: ["status"], where: { teamId }, _count: true }).catch(() => []),
  ]);

  const [processosAtivos, prazosAValidar, prazosAVencer, prazosProximos, aValidarLista] =
    await carteiraP;

  const tarefasPorColuna: Record<ColunaTarefa, number> = {
    A_FAZER: 0,
    EM_ANDAMENTO: 0,
    EM_REVISAO: 0,
    CONCLUIDA: 0,
  };
  const minutasPorStatus: Record<string, number> = {};
  let intimacoesNovas = 0;
  let conversas = 0;
  const [grpTarefas, intims, convs, grpMinutas] = await doTimeP;
  for (const g of grpTarefas) tarefasPorColuna[g.coluna] = g._count;
  for (const g of grpMinutas) minutasPorStatus[g.status] = g._count;
  intimacoesNovas = intims;
  conversas = convs;
  const tarefasAbertas =
    tarefasPorColuna.A_FAZER + tarefasPorColuna.EM_ANDAMENTO + tarefasPorColuna.EM_REVISAO;
  const minutasAprovadas = minutasPorStatus.APROVADA ?? 0;
  const minutasEmAndamento = (minutasPorStatus.RASCUNHO_IA ?? 0) + (minutasPorStatus.EDITADA ?? 0);

  const horaBRT = Number(
    new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }).format(agora),
  );
  const primeiroNome = usuario.nome.split(/\s+/)[0];
  const dataHojeBruta = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(agora);
  const dataHoje = dataHojeBruta.charAt(0).toUpperCase() + dataHojeBruta.slice(1);

  const kpis = [
    {
      valor: String(prazosAValidar),
      rotulo: "Prazos a validar",
      detalhe: prazosAValidar > 0 ? "exige sua ação" : "tudo validado",
      tom: (prazosAValidar > 0 ? "ruim" : "bom") as "ruim" | "bom",
      valorDestaque: prazosAValidar > 0,
    },
    {
      valor: String(prazosAVencer),
      rotulo: "Prazos a vencer (7 dias)",
      detalhe: prazosAVencer > 0 ? "de olho na agenda" : "nada nos próximos 7 dias",
      tom: "bom" as const,
      valorDestaque: false,
    },
    {
      valor: String(intimacoesNovas),
      rotulo: "Intimações novas (7 dias)",
      detalhe: "capturadas do DJEN",
      tom: "bom" as const,
      valorDestaque: false,
    },
    {
      valor: String(tarefasAbertas),
      rotulo: "Tarefas em aberto",
      detalhe: `${tarefasPorColuna.CONCLUIDA} concluída${tarefasPorColuna.CONCLUIDA === 1 ? "" : "s"}`,
      tom: "bom" as const,
      valorDestaque: false,
    },
    {
      valor: String(processosAtivos),
      rotulo: "Processos no sistema",
      detalhe: `${conversas} atendimento${conversas === 1 ? "" : "s"} no WhatsApp`,
      tom: "bom" as const,
      valorDestaque: false,
    },
  ];

  const maxColuna = Math.max(1, ...ORDEM_COLUNAS.map((c) => tarefasPorColuna[c]));

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">
        {saudacaoDe(horaBRT)}, {primeiroNome}
      </h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">{dataHoje} · Visão geral do escritório</p>

      <section className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <CartaoKpi key={kpi.rotulo} {...kpi} />
        ))}
      </section>

      <div className="grid gap-3.5 xl:grid-cols-2">
        {/* Exige atenção — prazos a validar */}
        <section className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--shadow-ios)]">
          <h3 className="mb-3 flex items-center justify-between text-[13px] font-bold text-navy">
            ⚠️ Exige sua atenção
            <Link href="/prazos" className="text-[11.5px] font-semibold text-verde-escuro hover:underline">
              ver prazos
            </Link>
          </h3>
          {aValidarLista.length === 0 ? (
            <p className="rounded-lg border border-dashed border-borda bg-plano px-3 py-4 text-center text-[12.5px] text-suave">
              Nenhum prazo aguardando validação — tudo em dia. ✓
            </p>
          ) : (
            <table className="w-full text-[13px]">
              <tbody>
                {aValidarLista.map((prazo) => (
                  <tr key={prazo.id} className="border-b border-plano-2 last:border-b-0">
                    <td className="py-2.5 pr-2">
                      <Selo tom="ambar">a validar</Selo>
                    </td>
                    <td className="py-2.5 pr-2">
                      <b>{prazo.descricao}</b>
                      <br />
                      <small className="font-mono text-suave">{prazo.processo.numero}</small>
                    </td>
                    <td className="py-2.5 text-right">
                      <ChipPrazo vencimento={prazo.vencimento} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Próximos prazos */}
        <section className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--shadow-ios)]">
          <h3 className="mb-3 flex items-center justify-between text-[13px] font-bold text-navy">
            ⏱️ Próximos prazos
            <Link
              href="/prazos?vista=calendario"
              className="text-[11.5px] font-semibold text-verde-escuro hover:underline"
            >
              calendário
            </Link>
          </h3>
          {prazosProximos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-borda bg-plano px-3 py-4 text-center text-[12.5px] text-suave">
              Nenhum prazo em aberto.
            </p>
          ) : (
            <table className="w-full text-[13px]">
              <tbody>
                {prazosProximos.map((prazo) => (
                  <tr key={prazo.id} className="border-b border-plano-2 last:border-b-0">
                    <td className="whitespace-nowrap py-2.5 pr-3 align-top tabular-nums text-tinta">
                      {formatarData(prazo.vencimento)}
                    </td>
                    <td className="py-2.5 pr-2">
                      <b className="block truncate">{prazo.descricao}</b>
                      <small className="text-suave">{prazo.processo.titulo}</small>
                    </td>
                    <td className="py-2.5 text-right">
                      {prazo.validado ? <Selo tom="verde">validado</Selo> : <ChipPrazo vencimento={prazo.vencimento} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Tarefas por coluna */}
        <section className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--shadow-ios)]">
          <h3 className="mb-3 flex items-center justify-between text-[13px] font-bold text-navy">
            🗂️ Tarefas do escritório
            <Link href="/tarefas" className="text-[11.5px] font-semibold text-verde-escuro hover:underline">
              abrir quadro
            </Link>
          </h3>
          <div className="space-y-2.5">
            {ORDEM_COLUNAS.map((col) => (
              <div key={col} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[12px] text-tinta">{COLUNAS_TAREFA[col]}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-plano-2">
                  <div
                    className={`h-full rounded-full ${col === "CONCLUIDA" ? "bg-verde" : "bg-navy"}`}
                    style={{ width: `${(tarefasPorColuna[col] / maxColuna) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-[12.5px] font-bold tabular-nums text-navy">
                  {tarefasPorColuna[col]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Minutas */}
        <section className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--shadow-ios)]">
          <h3 className="mb-3 flex items-center justify-between text-[13px] font-bold text-navy">
            ✍️ Minutas assistidas por IA
            <Link href="/minutas" className="text-[11.5px] font-semibold text-verde-escuro hover:underline">
              abrir
            </Link>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-borda bg-plano p-3 text-center">
              <p className="text-2xl font-bold text-navy">{minutasEmAndamento}</p>
              <p className="mt-1 text-[11.5px] text-suave">em elaboração (IA + edição)</p>
            </div>
            <div className="rounded-lg border border-[#BFD8BF] bg-selo-verde p-3 text-center">
              <p className="text-2xl font-bold text-sucesso-escuro">{minutasAprovadas}</p>
              <p className="mt-1 text-[11.5px] text-sucesso-escuro">aprovadas p/ protocolo</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-suave">
            🔒 A IA redige e o advogado decide — nada é protocolado automaticamente.
          </p>
        </section>
      </div>
    </div>
  );
}
