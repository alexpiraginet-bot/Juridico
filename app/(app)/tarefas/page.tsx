import type { Metadata } from "next";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { criarTarefa, moverTarefa, excluirTarefa } from "@/lib/acoes/tarefas";
import { COLUNAS_TAREFA, ORDEM_COLUNAS, PRIORIDADES_TAREFA } from "@/lib/opcoes";
import type { ColunaTarefa } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = { title: "Tarefas" };
export const dynamic = "force-dynamic";

const entrada =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde";

export default async function PaginaTarefas({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const usuario = await exigirUsuarioDoEscritorio();
  const { erro } = await searchParams;
  const teamId = usuario.teamId;

  const [tarefas, processos, usuarios] = await Promise.all([
    bd.tarefa.findMany({
      where: { teamId },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      include: {
        processo: { select: { numero: true } },
        responsavel: { select: { nome: true } },
      },
    }),
    bd.processo.findMany({
      where: { teamId },
      orderBy: { criadoEm: "desc" },
      select: { id: true, numero: true, titulo: true },
    }),
    bd.usuario.findMany({
      where: { teamId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const porColuna = new Map<ColunaTarefa, typeof tarefas>(ORDEM_COLUNAS.map((c) => [c, []]));
  for (const t of tarefas) porColuna.get(t.coluna)?.push(t);

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Tarefas &amp; Fluxos</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Quadro do escritório, gravado no banco · mova os cards com ◀ ▶ entre as colunas.
      </p>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      {/* Nova tarefa */}
      <details className="mb-4 rounded-xl border border-borda bg-superficie">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-[13px] font-semibold text-verde-escuro">
          ＋ Nova tarefa
        </summary>
        <form action={criarTarefa} className="grid gap-3 border-t border-borda p-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">Título</span>
            <input name="titulo" required className={entrada} placeholder="Ex.: Protocolar contestação" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">Detalhe (opcional)</span>
            <input name="detalhe" className={entrada} placeholder="Contexto rápido da tarefa" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Prioridade</span>
            <select name="prioridade" defaultValue="" className={entrada}>
              <option value="">— sem prioridade —</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Responsável</span>
            <select name="responsavelId" defaultValue="" className={entrada}>
              <option value="">— ninguém —</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">Processo (opcional)</span>
            <select name="processoId" defaultValue="" className={entrada}>
              <option value="">— nenhum —</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numero} · {p.titulo}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Criar tarefa
            </button>
          </div>
        </form>
      </details>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ORDEM_COLUNAS.map((col, idxCol) => {
          const lista = porColuna.get(col) ?? [];
          return (
            <div key={col} className="rounded-xl bg-plano-2 p-2.5">
              <h5 className="flex justify-between px-1.5 pb-2.5 pt-1 text-[11.5px] font-semibold uppercase tracking-wide text-suave">
                {COLUNAS_TAREFA[col]} <span>{lista.length}</span>
              </h5>
              {lista.map((t) => (
                <div key={t.id} className="mb-2 rounded-lg border border-borda bg-superficie p-3 text-[12.5px]">
                  <b className="mb-1 block text-navy">{t.titulo}</b>
                  {t.detalhe && <p className="text-suave">{t.detalhe}</p>}
                  {(t.processo || t.responsavel) && (
                    <p className="mt-1 truncate text-[11px] text-suave">
                      {t.processo && <span className="font-mono">{t.processo.numero}</span>}
                      {t.processo && t.responsavel && " · "}
                      {t.responsavel?.nome}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {t.prioridade ? (
                      <Selo tom={PRIORIDADES_TAREFA[t.prioridade].tom}>
                        {PRIORIDADES_TAREFA[t.prioridade].rotulo}
                      </Selo>
                    ) : col === "CONCLUIDA" ? (
                      <Selo tom="verde">✓</Selo>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1">
                      {idxCol > 0 && (
                        <form action={moverTarefa.bind(null, t.id, false)}>
                          <button
                            type="submit"
                            aria-label="Mover para a coluna anterior"
                            className="rounded-md bg-selo-cinza px-2 py-0.5 text-[11px] font-bold hover:bg-borda"
                          >
                            ◀
                          </button>
                        </form>
                      )}
                      {idxCol < ORDEM_COLUNAS.length - 1 && (
                        <form action={moverTarefa.bind(null, t.id, true)}>
                          <button
                            type="submit"
                            aria-label="Mover para a próxima coluna"
                            className="rounded-md bg-selo-cinza px-2 py-0.5 text-[11px] font-bold hover:bg-borda"
                          >
                            ▶
                          </button>
                        </form>
                      )}
                      <BotaoExcluir
                        acao={excluirTarefa.bind(null, t.id)}
                        confirmacao={`Excluir a tarefa "${t.titulo}"?`}
                      />
                    </span>
                  </div>
                </div>
              ))}
              {lista.length === 0 && <p className="px-1.5 py-1 text-[11px] text-suave">—</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
