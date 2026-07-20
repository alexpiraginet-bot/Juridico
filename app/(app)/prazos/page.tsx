import type { Metadata } from "next";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { ChipPrazo } from "@/components/ChipPrazo";
import { Selo } from "@/components/Selo";
import { concluirPrazo, excluirPrazo, validarPrazo } from "@/lib/acoes/prazos";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { bd } from "@/lib/bd";
import { formatarData } from "@/lib/formatar";
import { CalendarioPrazos, mesDeHoje } from "@/components/CalendarioPrazos";

export const metadata: Metadata = { title: "Prazos" };
export const dynamic = "force-dynamic";

export default async function PaginaPrazos({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; vista?: string; mes?: string }>;
}) {
  const usuario = await exigirUsuarioDoEscritorio();
  const { erro, vista, mes } = await searchParams;
  const ehCalendario = vista === "calendario";
  const mesAtual = /^\d{4}-\d{2}$/.test(mes ?? "") ? (mes as string) : mesDeHoje();
  const prazos = await bd.prazo.findMany({
    where: { teamId: usuario.teamId },
    include: { processo: { select: { numero: true, titulo: true } } },
    orderBy: { vencimento: "asc" },
  });

  const pendentes = prazos.filter((prazo) => !prazo.concluido);
  const aguardandoValidacao = pendentes.filter((prazo) => !prazo.validado).length;
  const concluidos = prazos.filter((prazo) => prazo.concluido).reverse();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-navy">Prazos & Agenda</h1>
          <p className="mb-4 mt-0.5 text-xs text-suave">
            {pendentes.length === 0
              ? "Agenda oficial do escritório, gravada no banco de dados."
              : `${pendentes.length} prazo${pendentes.length === 1 ? "" : "s"} em aberto, do mais urgente para o mais distante.`}
          </p>
        </div>
        <Link
          href="/prazos/novo"
          className="rounded-lg bg-verde px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          + Novo prazo
        </Link>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-borda bg-superficie p-0.5 text-[12.5px] font-semibold">
        <Link
          href="/prazos"
          className={`rounded-md px-3 py-1.5 ${!ehCalendario ? "bg-navy text-white" : "text-suave hover:text-tinta"}`}
        >
          Lista
        </Link>
        <Link
          href={`/prazos?vista=calendario&mes=${mesAtual}`}
          className={`rounded-md px-3 py-1.5 ${ehCalendario ? "bg-navy text-white" : "text-suave hover:text-tinta"}`}
        >
          Calendário
        </Link>
      </div>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      {aguardandoValidacao > 0 && (
        <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
          ⏳ {aguardandoValidacao === 1 ? "1 prazo aguarda" : `${aguardandoValidacao} prazos aguardam`}{" "}
          validação de um advogado — prazos não validados não valem como agenda oficial.
        </div>
      )}

      {ehCalendario ? (
        <CalendarioPrazos prazos={prazos} mes={mesAtual} />
      ) : (
        <>
      {pendentes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-10 text-center">
          <p className="text-[15px] font-semibold text-navy">Nenhum prazo em aberto</p>
          <p className="mx-auto mt-1 max-w-md text-[12.5px] text-suave">
            Cadastre um prazo vinculado a um processo — ou valide o prazo sugerido pela IA
            na tela de{" "}
            <Link href="/intimacoes" className="font-semibold text-verde-escuro underline">
              Intimações
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-borda bg-superficie">
          <ul>
            {pendentes.map((prazo) => (
              <li
                key={prazo.id}
                className="flex flex-wrap items-center gap-3 border-b border-plano-2 px-4 py-3.5 last:border-b-0"
              >
                <div className="w-24 shrink-0 rounded-lg border border-borda bg-plano px-2 py-1.5 text-center">
                  <p className="text-[13px] font-bold tabular-nums">{formatarData(prazo.vencimento)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{prazo.descricao}</p>
                  <p className="mt-0.5 truncate text-xs text-suave">
                    <span className="font-mono">{prazo.processo.numero}</span> · {prazo.processo.titulo}
                    {prazo.responsavel && <> · {prazo.responsavel}</>}
                  </p>
                </div>
                <ChipPrazo vencimento={prazo.vencimento} />
                <Selo tom={prazo.validado ? "verde" : "ambar"}>
                  {prazo.validado ? "Validado" : "Pendente de validação"}
                </Selo>
                <span className="flex shrink-0 items-center gap-2">
                  {!prazo.validado && (
                    <form action={validarPrazo.bind(null, prazo.id)}>
                      <button className="rounded-lg bg-verde px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-verde-escuro">
                        ✔ Validar
                      </button>
                    </form>
                  )}
                  <form action={concluirPrazo.bind(null, prazo.id)}>
                    <button className="rounded-lg border border-borda px-2.5 py-1 text-[11px] font-semibold hover:bg-plano">
                      Concluir
                    </button>
                  </form>
                  <BotaoExcluir
                    acao={excluirPrazo.bind(null, prazo.id)}
                    confirmacao={`Excluir o prazo "${prazo.descricao}"?`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {concluidos.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold text-navy">Concluídos</h2>
          <ul className="mt-2 rounded-xl border border-borda bg-superficie">
            {concluidos.map((prazo) => (
              <li
                key={prazo.id}
                className="flex items-center gap-3 border-b border-plano-2 px-4 py-2.5 text-[12.5px] text-suave last:border-b-0"
              >
                <span aria-hidden>✔</span>
                <span className="tabular-nums">{formatarData(prazo.vencimento)}</span>
                <span className="min-w-0 truncate">
                  {prazo.descricao} · <span className="font-mono">{prazo.processo.numero}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
        </>
      )}
    </div>
  );
}
