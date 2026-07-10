import type { Metadata } from "next";
import { clientes, processosDoCliente } from "@/lib/dados";

export const metadata: Metadata = { title: "Clientes" };

export default function PaginaClientes() {
  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-tinta-2">
          {clientes.length} clientes com processos no escritório.
        </p>
      </header>

      <div className="mt-6 overflow-x-auto rounded-xl border border-borda bg-superficie">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-borda text-xs uppercase tracking-wide text-suave">
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">CPF / CNPJ</th>
              <th className="px-5 py-3 font-medium">Contato</th>
              <th className="px-5 py-3 text-right font-medium">Processos</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => {
              const doCliente = processosDoCliente(cliente.id);
              const ativos = doCliente.filter((processo) => processo.status === "ativo").length;
              return (
                <tr key={cliente.id} className="border-b border-borda last:border-b-0 hover:bg-plano">
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{cliente.nome}</p>
                    <p className="mt-0.5 text-xs text-suave">{cliente.cidade}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-tinta-2">
                    {cliente.cpfCnpj}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-tinta-2">{cliente.email}</p>
                    <p className="mt-0.5 text-xs text-suave">{cliente.telefone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-tinta-2">
                    {doCliente.length}
                    {ativos > 0 && (
                      <span className="text-xs text-suave"> ({ativos} em andamento)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
