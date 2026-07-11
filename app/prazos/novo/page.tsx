import type { Metadata } from "next";
import Link from "next/link";
import { criarPrazo } from "@/lib/acoes/prazos";
import { bd } from "@/lib/bd";

export const metadata: Metadata = { title: "Novo prazo" };
export const dynamic = "force-dynamic";

export default async function PaginaNovoPrazo({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const processos = await bd.processo.findMany({
    select: { id: true, numero: true, titulo: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Novo prazo</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Criado à mão por você, o prazo já nasce validado.
      </p>

      {processos.length === 0 ? (
        <div className="max-w-lg rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[14px] font-semibold text-navy">Antes, cadastre um processo</p>
          <p className="mt-1 text-[12.5px] text-suave">
            Todo prazo pertence a um processo — e ainda não há nenhum no banco.
          </p>
          <Link
            href="/processos/novo"
            className="mt-4 inline-block rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
          >
            Cadastrar processo
          </Link>
        </div>
      ) : (
        <form action={criarPrazo} className="max-w-lg rounded-xl border border-borda bg-superficie p-5">
          {erro && (
            <p className="mb-4 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
              ⚠️ {erro}
            </p>
          )}

          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-suave">Processo *</span>
              <select
                name="processoId"
                defaultValue=""
                required
                className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
              >
                <option value="" disabled>
                  Selecione o processo…
                </option>
                {processos.map((processo) => (
                  <option key={processo.id} value={processo.id}>
                    {processo.numero} — {processo.titulo}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-suave">Providência *</span>
              <input
                name="descricao"
                required
                placeholder="Ex.: Apresentar contestação"
                className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-suave">Vencimento *</span>
              <input
                type="date"
                name="vencimento"
                required
                className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-suave">Responsável</span>
              <input
                name="responsavel"
                placeholder="Ex.: Dr. Gustavo"
                className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
              />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Salvar prazo
            </button>
            <Link
              href="/prazos"
              className="rounded-lg border border-borda px-4 py-2 text-[12.5px] font-semibold hover:bg-plano"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
