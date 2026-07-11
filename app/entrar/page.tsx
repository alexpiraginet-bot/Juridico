import type { Metadata } from "next";
import { entrar } from "@/lib/acoes/auth";
import { usuarioAtual } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

const entrada =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2.5 text-[14px] outline-none focus:border-verde";

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  // Já logado? Vai direto para dentro.
  const u = await usuarioAtual();
  if (u) redirect(u.papel === "SUPERADMIN" ? "/central" : "/");

  return (
    <div className="mx-auto mt-6 max-w-sm sm:mt-16">
      <div className="mb-5 text-center">
        <p className="text-2xl font-bold tracking-wide text-navy">
          Lex<span className="text-verde">Flow</span>
        </p>
        <p className="mt-1 text-xs tracking-[1px] text-suave">GESTÃO JURÍDICA · IA</p>
      </div>

      <form
        action={entrar}
        className="space-y-3 rounded-2xl border border-borda bg-superficie p-6 shadow-sm"
      >
        <h1 className="text-[15px] font-bold text-navy">Entrar</h1>

        {erro && (
          <p className="rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
            ⚠️ {erro}
          </p>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">E-mail</span>
          <input name="email" type="email" required autoComplete="email" className={entrada} placeholder="voce@escritorio.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">Senha</span>
          <input name="senha" type="password" required autoComplete="current-password" className={entrada} placeholder="••••••••" />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-verde px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-verde-escuro"
        >
          Entrar
        </button>

        <p className="pt-1 text-center text-[11px] text-suave">
          Acesso restrito. Cada escritório recebe o seu do administrador.
        </p>
      </form>
    </div>
  );
}
