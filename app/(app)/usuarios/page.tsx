import type { Metadata } from "next";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { exigirDono } from "@/lib/auth";
import { criarUsuario, excluirUsuario } from "@/lib/acoes/usuarios";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

const PAPEL: Record<string, string> = {
  DONO_ESCRITORIO: "Dono",
  ADVOGADO: "Advogado(a)",
  ASSESSOR: "Assessor(a)",
  ESTAGIARIO: "Estagiário(a)",
};

const entrada =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde";

export default async function PaginaUsuarios({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const dono = await exigirDono();
  const { erro } = await searchParams;

  const usuarios = await bd.usuario.findMany({
    where: { teamId: dono.teamId },
    orderBy: { criadoEm: "asc" },
    include: { _count: { select: { credenciais: true } } },
  });

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Equipe · {dono.team?.nome}</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Os usuários do seu escritório. Cada um entra com o próprio login; assessores e estagiários
        costumam ser só consulta.
      </p>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      {/* Novo usuário */}
      <details className="mb-4 rounded-xl border border-borda bg-superficie">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-[13px] font-semibold text-verde-escuro">
          ＋ Novo usuário
        </summary>
        <form action={criarUsuario} className="grid gap-3 border-t border-borda p-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Nome</span>
            <input name="nome" required className={entrada} placeholder="Nome completo" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">E-mail (login)</span>
            <input name="email" type="email" required className={entrada} placeholder="nome@escritorio.com" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Papel</span>
            <select name="papel" defaultValue="ADVOGADO" className={entrada}>
              <option value="ADVOGADO">Advogado(a)</option>
              <option value="ASSESSOR">Assessor(a) — só consulta</option>
              <option value="ESTAGIARIO">Estagiário(a) — só consulta</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Senha inicial (mín. 6)</span>
            <input name="senha" type="password" required minLength={6} className={entrada} placeholder="••••••••" />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Cadastrar usuário
            </button>
          </div>
        </form>
      </details>

      <ul className="space-y-2.5">
        {usuarios.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-borda bg-superficie p-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-navy">
                {u.nome}
                {u.id === dono.id && (
                  <span className="ml-2 text-[11px] font-normal text-suave">(você)</span>
                )}
              </p>
              <p className="truncate text-[12px] text-suave">{u.email}</p>
            </div>
            <Selo tom={u.papel === "DONO_ESCRITORIO" ? "navy" : "cinza"}>
              {PAPEL[u.papel] ?? u.papel}
            </Selo>
            <Link
              href="/credenciais"
              className="rounded-lg border border-borda px-2.5 py-1 text-[11px] font-semibold text-tinta hover:bg-plano"
            >
              🔑 {u._count.credenciais} OAB
            </Link>
            {u.papel !== "DONO_ESCRITORIO" && (
              <BotaoExcluir
                acao={excluirUsuario.bind(null, u.id)}
                confirmacao={`Excluir ${u.nome}? As credenciais de OAB dele também serão removidas.`}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
