import type { Metadata } from "next";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { criarUsuario, excluirUsuario } from "@/lib/acoes/usuarios";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

const CARGOS = ["Advogado(a)", "Estagiário(a)", "Secretaria", "Administrador(a)"];

const entrada =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde";

export default async function PaginaUsuarios({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  const usuarios = await bd.usuario.findMany({
    orderBy: { criadoEm: "asc" },
    include: { _count: { select: { credenciais: true } } },
  });

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Usuários</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        A equipe do escritório. Cada usuário pode ter suas credenciais de OAB para a captura
        automática de processos.
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
            <span className="mb-1 block text-xs font-semibold text-suave">E-mail</span>
            <input name="email" type="email" required className={entrada} placeholder="nome@escritorio.com" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Cargo</span>
            <select name="cargo" defaultValue={CARGOS[0]} className={entrada}>
              {CARGOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Cadastrar usuário
            </button>
          </div>
        </form>
      </details>

      {usuarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[15px] font-semibold text-navy">Nenhum usuário cadastrado ainda</p>
          <p className="mx-auto mt-1 max-w-md text-[12.5px] text-suave">
            Cadastre o primeiro usuário acima. Depois, em <b>Credenciais</b>, vincule a OAB dele
            para a captura automática.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {usuarios.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-borda bg-superficie p-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy">{u.nome}</p>
                <p className="truncate text-[12px] text-suave">{u.email}</p>
              </div>
              {u.cargo && <Selo tom="cinza">{u.cargo}</Selo>}
              <Link
                href="/credenciais"
                className="rounded-lg border border-borda px-2.5 py-1 text-[11px] font-semibold text-tinta hover:bg-plano"
              >
                🔑 {u._count.credenciais} OAB
              </Link>
              <BotaoExcluir
                acao={excluirUsuario.bind(null, u.id)}
                confirmacao={`Excluir ${u.nome}? As credenciais de OAB dele também serão removidas.`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
