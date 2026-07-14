import type { Metadata } from "next";
import { entrar } from "@/lib/acoes/auth";
import { usuarioAtual } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MarcaX } from "@/components/MarcaX";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

const entrada =
  "w-full rounded-[12px] border border-borda bg-superficie px-3 py-2.5 text-[14px] outline-none transition focus:border-lex-azul focus:ring-2 focus:ring-lex-azul/25";

// Fundo claro com brilhos sutis azul/violeta da marca (feel iOS 26).
const fundo =
  "radial-gradient(680px 460px at 50% -12%, rgba(46,125,255,.14), transparent 60%)," +
  "radial-gradient(560px 420px at 100% 112%, rgba(124,58,237,.12), transparent 58%)";

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
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{ backgroundImage: fundo }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <MarcaX tamanho={52} brilho />
          <p className="mt-3 text-2xl font-bold tracking-wide text-navy">
            Lex<span className="text-grad-lex">Flow</span>
          </p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-suave">
            LEX TECHNOLOGY
          </p>
          <p className="mt-1.5 text-[11px] tracking-[1px] text-suave">GESTÃO JURÍDICA · IA</p>
        </div>

        <form
          action={entrar}
          className="space-y-3 rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-[var(--shadow-ios-lg)] backdrop-blur-xl"
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
            className="w-full rounded-[14px] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(46,125,255,.6)] transition hover:brightness-[1.06] active:scale-[.99] grad-lex"
          >
            Entrar
          </button>

          <p className="pt-1 text-center text-[11px] text-suave">
            Acesso restrito. Cada escritório recebe o seu do administrador.
          </p>
        </form>
      </div>
    </div>
  );
}
