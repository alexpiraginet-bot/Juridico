import type { Metadata } from "next";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { excluirCliente } from "@/lib/acoes/clientes";
import { bd } from "@/lib/bd";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function PaginaClientes({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const clientes = await bd.cliente.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { processos: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-navy">Clientes</h1>
          <p className="mb-4 mt-0.5 text-xs text-suave">
            {clientes.length === 0
              ? "Cadastro real, gravado no banco de dados na nuvem."
              : `${clientes.length} cliente${clientes.length === 1 ? "" : "s"} no banco de dados.`}
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="rounded-lg bg-verde px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          + Novo cliente
        </Link>
      </div>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      {clientes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-10 text-center">
          <p className="text-[15px] font-semibold text-navy">Nenhum cliente ainda</p>
          <p className="mx-auto mt-1 max-w-md text-[12.5px] text-suave">
            Este cadastro agora é de verdade: cada cliente vai para o banco de dados
            PostgreSQL. Comece cadastrando o primeiro.
          </p>
          <Link
            href="/clientes/novo"
            className="mt-4 inline-block rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
          >
            Cadastrar o primeiro cliente
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-borda bg-superficie p-4">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-borda text-left text-[11px] uppercase tracking-wide text-suave">
                <th className="px-2.5 py-2 font-semibold">Cliente</th>
                <th className="px-2.5 py-2 font-semibold">CPF/CNPJ</th>
                <th className="px-2.5 py-2 font-semibold">Contato</th>
                <th className="px-2.5 py-2 text-right font-semibold">Processos</th>
                <th className="px-2.5 py-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-plano-2 last:border-b-0 hover:bg-realce">
                  <td className="px-2.5 py-2.5">
                    <p className="font-bold">{cliente.nome}</p>
                    {cliente.cidade && <p className="mt-0.5 text-xs text-suave">{cliente.cidade}</p>}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-2.5">{cliente.cpfCnpj}</td>
                  <td className="px-2.5 py-2.5">
                    <p className="text-tinta">{cliente.email ?? "—"}</p>
                    {cliente.telefone && (
                      <p className="mt-0.5 text-xs text-suave">{cliente.telefone}</p>
                    )}
                  </td>
                  <td className="px-2.5 py-2.5 text-right tabular-nums">
                    {cliente._count.processos}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-2.5 text-right">
                    <Link
                      href={`/clientes/${cliente.id}/editar`}
                      className="mr-2 rounded-lg border border-borda px-2.5 py-1 text-[11px] font-semibold hover:bg-plano"
                    >
                      Editar
                    </Link>
                    <BotaoExcluir
                      acao={excluirCliente.bind(null, cliente.id)}
                      confirmacao={`Excluir o cliente "${cliente.nome}"?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
