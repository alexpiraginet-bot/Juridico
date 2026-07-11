import type { Metadata } from "next";
import { BotaoNovoCliente } from "@/components/BotaoNovoCliente";
import { Selo } from "@/components/Selo";
import { clientes } from "@/lib/dados";

export const metadata: Metadata = { title: "Clientes" };

export default function PaginaClientes() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Clientes</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Cadastro único com deduplicação automática e checagem de conflito de interesses
      </p>

      <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
        💡 Ao cadastrar uma nova parte, o sistema cruza CPF/CNPJ com toda a base e alerta
        conflitos de interesse automaticamente.
      </div>

      <div className="overflow-x-auto rounded-xl border border-borda bg-superficie p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[13px] font-bold text-navy">Base de clientes</h3>
          <BotaoNovoCliente />
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-borda text-left text-[11px] uppercase tracking-wide text-suave">
              <th className="px-2.5 py-2 font-semibold">Nome</th>
              <th className="px-2.5 py-2 font-semibold">CPF/CNPJ</th>
              <th className="px-2.5 py-2 font-semibold">Área</th>
              <th className="px-2.5 py-2 font-semibold">Processos</th>
              <th className="px-2.5 py-2 font-semibold">Docs</th>
              <th className="px-2.5 py-2 font-semibold">Status</th>
              <th className="px-2.5 py-2 font-semibold">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-b border-plano-2 last:border-b-0 hover:bg-realce">
                <td className="px-2.5 py-2.5 font-bold">{cliente.nome}</td>
                <td className="px-2.5 py-2.5">{cliente.cpfCnpj}</td>
                <td className="px-2.5 py-2.5">{cliente.area}</td>
                <td className="px-2.5 py-2.5">{cliente.processos}</td>
                <td className="px-2.5 py-2.5">
                  <Selo tom={cliente.documentos.tom}>{cliente.documentos.texto}</Selo>
                </td>
                <td className="px-2.5 py-2.5">
                  <Selo tom={cliente.situacao.tom}>{cliente.situacao.texto}</Selo>
                </td>
                <td className="px-2.5 py-2.5">{cliente.responsavel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
