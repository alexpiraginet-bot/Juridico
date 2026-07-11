import type { Metadata } from "next";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { exigirSuperadmin } from "@/lib/auth";
import { sair } from "@/lib/acoes/auth";
import { criarEscritorio, excluirEscritorio } from "@/lib/acoes/escritorios";
import { formatarData } from "@/lib/formatar";

export const metadata: Metadata = { title: "Painel central" };
export const dynamic = "force-dynamic";

const entrada =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde";

function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default async function PaginaCentral({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const admin = await exigirSuperadmin();
  const { erro } = await searchParams;

  const escritorios = await bd.team.findMany({
    orderBy: { criadoEm: "desc" },
    include: { _count: { select: { usuarios: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-navy">Painel central</h1>
          <p className="mb-4 mt-0.5 text-xs text-suave">
            Cadastro dos escritórios que usam o LexFlow. Cada um recebe seu nome, logo e o acesso do
            dono.
          </p>
        </div>
        <form action={sair}>
          <button
            type="submit"
            className="rounded-lg border border-borda px-3 py-1.5 text-[12px] font-semibold text-tinta hover:bg-plano"
          >
            Sair ({admin.email})
          </button>
        </form>
      </div>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      {/* Novo escritório */}
      <details className="mb-4 rounded-xl border border-borda bg-superficie">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-[13px] font-semibold text-verde-escuro">
          ＋ Novo escritório
        </summary>
        <form action={criarEscritorio} className="grid gap-3 border-t border-borda p-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">Nome do escritório</span>
            <input name="nome" required className={entrada} placeholder="Ex.: Silva & Associados Advocacia" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">
              Logo (URL de imagem) — opcional
            </span>
            <input name="logoUrl" className={entrada} placeholder="https://…/logo.png" />
          </label>

          <p className="text-[11px] font-semibold uppercase tracking-wide text-suave sm:col-span-2">
            Dono do escritório (primeiro acesso)
          </p>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Nome do dono</span>
            <input name="donoNome" required className={entrada} placeholder="Nome completo" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">E-mail do dono</span>
            <input name="donoEmail" type="email" required className={entrada} placeholder="dono@escritorio.com" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">
              Senha inicial (mín. 6 caracteres)
            </span>
            <input name="donoSenha" type="password" required minLength={6} className={entrada} placeholder="••••••••" />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Criar escritório e acesso do dono
            </button>
          </div>
        </form>
      </details>

      {escritorios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[15px] font-semibold text-navy">Nenhum escritório cadastrado</p>
          <p className="mx-auto mt-1 max-w-md text-[12.5px] text-suave">
            Cadastre o primeiro escritório acima. O dono entra com o e-mail e a senha que você
            definir e passa a gerir a própria equipe.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {escritorios.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-borda bg-superficie p-3.5"
            >
              {e.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.logoUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg border border-borda object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-selo-navy text-[13px] font-bold text-navy">
                  {iniciais(e.nome)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy">{e.nome}</p>
                <p className="text-[11px] text-suave">desde {formatarData(e.criadoEm)}</p>
              </div>
              <Selo tom="cinza">
                {e._count.usuarios} usuário{e._count.usuarios === 1 ? "" : "s"}
              </Selo>
              <BotaoExcluir
                acao={excluirEscritorio.bind(null, e.id)}
                confirmacao={`Excluir o escritório ${e.nome}? Todos os usuários e credenciais dele serão removidos.`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
