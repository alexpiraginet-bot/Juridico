import type { Metadata } from "next";
import { SeloStatus } from "@/components/SeloStatus";
import { clientePorId, processos } from "@/lib/dados";
import { formatarData, formatarMoeda } from "@/lib/formatar";

export const metadata: Metadata = { title: "Processos" };

export default function PaginaProcessos() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold">Processos</h1>
        <p className="mt-1 text-sm text-tinta-2">
          {processos.length} processos cadastrados no escritório.
        </p>
      </header>

      <div className="mt-6 overflow-x-auto rounded-xl border border-borda bg-superficie">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-borda text-xs uppercase tracking-wide text-suave">
              <th className="px-5 py-3 font-medium">Processo</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Área</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Valor da causa</th>
              <th className="px-5 py-3 text-right font-medium">Abertura</th>
            </tr>
          </thead>
          <tbody>
            {processos.map((processo) => (
              <tr key={processo.id} className="border-b border-borda last:border-b-0 hover:bg-plano">
                <td className="max-w-xs px-5 py-3.5">
                  <p className="truncate font-medium">{processo.titulo}</p>
                  <p className="mt-0.5 font-mono text-xs text-suave">{processo.numero}</p>
                  <p className="mt-0.5 truncate text-xs text-suave">{processo.vara}</p>
                </td>
                <td className="px-5 py-3.5 text-tinta-2">
                  {clientePorId(processo.clienteId)?.nome}
                </td>
                <td className="px-5 py-3.5 text-tinta-2">{processo.area}</td>
                <td className="px-5 py-3.5">
                  <SeloStatus status={processo.status} />
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums text-tinta-2">
                  {processo.valorCausa > 0 ? formatarMoeda(processo.valorCausa) : "—"}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums text-tinta-2">
                  {formatarData(processo.aberturaEm)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
