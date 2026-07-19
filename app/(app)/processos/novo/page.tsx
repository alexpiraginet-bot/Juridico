import type { Metadata } from "next";
import Link from "next/link";
import { FormularioProcesso } from "@/components/FormularioProcesso";
import { criarProcesso } from "@/lib/acoes/processos";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { bd } from "@/lib/bd";

export const metadata: Metadata = { title: "Novo processo" };
export const dynamic = "force-dynamic";

export default async function PaginaNovoProcesso({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const usuario = await exigirUsuarioDoEscritorio();
  const { erro } = await searchParams;
  const clientes = await bd.cliente.findMany({
    where: { teamId: usuario.teamId },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Novo processo</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        O processo é vinculado a um cliente já cadastrado.
      </p>

      {clientes.length === 0 ? (
        <div className="max-w-lg rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[14px] font-semibold text-navy">Antes, cadastre um cliente</p>
          <p className="mt-1 text-[12.5px] text-suave">
            Todo processo pertence a um cliente — e ainda não há nenhum no banco.
          </p>
          <Link
            href="/clientes/novo"
            className="mt-4 inline-block rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
          >
            Cadastrar cliente
          </Link>
        </div>
      ) : (
        <FormularioProcesso acao={criarProcesso} clientes={clientes} erro={erro} />
      )}
    </div>
  );
}
