import type { Metadata } from "next";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { exigirDono } from "@/lib/auth";
import { alternarCredencial, criarCredencial, excluirCredencial } from "@/lib/acoes/credenciais";

export const metadata: Metadata = { title: "Credenciais jurídicas" };
export const dynamic = "force-dynamic";

const entrada =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde";

export default async function PaginaCredenciais({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const dono = await exigirDono();
  const { erro } = await searchParams;

  const [usuarios, credenciais] = await Promise.all([
    bd.usuario.findMany({
      where: { teamId: dono.teamId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    bd.credencialOab.findMany({
      where: { usuario: { teamId: dono.teamId } },
      orderBy: { criadoEm: "asc" },
      include: { usuario: { select: { nome: true } } },
    }),
  ]);

  const ativas = credenciais.filter((c) => c.ativa).length;

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Credenciais jurídicas</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        A OAB de cada usuário do seu escritório. Toda manhã, a captura automática do DJEN varre as
        credenciais <b>ativas</b> e traz os processos de cada um.
      </p>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
        🔑 As credenciais <b>ativas</b> ({ativas}) são varridas automaticamente às <b>08h</b> (São
        Paulo). Pause uma credencial para tirá-la da automação sem apagá-la.
      </div>

      {/* Nova credencial */}
      <details className="mb-4 rounded-xl border border-borda bg-superficie">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-[13px] font-semibold text-verde-escuro">
          ＋ Nova credencial de OAB
        </summary>
        <form action={criarCredencial} className="grid gap-3 border-t border-borda p-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">Usuário</span>
            <select name="usuarioId" required defaultValue="" className={entrada}>
              <option value="" disabled>
                Escolha o usuário…
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Número da OAB</span>
            <input name="numero" required inputMode="numeric" className={entrada} placeholder="Ex.: 12345" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">UF</span>
            <input name="uf" required maxLength={2} className={`${entrada} uppercase`} placeholder="ES" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">
              Nome do(a) advogado(a) (como consta na OAB)
            </span>
            <input name="nomeAdvogado" required className={entrada} placeholder="Nome completo" />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Cadastrar credencial
            </button>
          </div>
        </form>
      </details>

      {credenciais.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center text-[12.5px] text-suave">
          Nenhuma credencial cadastrada. Adicione a primeira OAB acima.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {credenciais.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-borda bg-superficie p-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[13px] font-bold text-navy">
                  OAB {c.numero}/{c.uf}
                </p>
                <p className="truncate text-[12px] text-tinta">{c.nomeAdvogado}</p>
                <p className="truncate text-[11px] text-suave">{c.usuario.nome}</p>
              </div>
              <Selo tom={c.ativa ? "verde" : "cinza"}>{c.ativa ? "ativa" : "pausada"}</Selo>
              <form action={alternarCredencial.bind(null, c.id, !c.ativa)}>
                <button
                  type="submit"
                  className="rounded-lg border border-borda px-2.5 py-1 text-[11px] font-semibold text-tinta hover:bg-plano"
                >
                  {c.ativa ? "Pausar" : "Ativar"}
                </button>
              </form>
              <BotaoExcluir
                acao={excluirCredencial.bind(null, c.id)}
                confirmacao={`Excluir a credencial OAB ${c.numero}/${c.uf}?`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
