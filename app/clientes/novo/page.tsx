import type { Metadata } from "next";
import { FormularioCliente } from "@/components/FormularioCliente";
import { criarCliente } from "@/lib/acoes/clientes";

export const metadata: Metadata = { title: "Novo cliente" };

export default async function PaginaNovoCliente({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Novo cliente</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        O cadastro vai direto para o banco de dados.
      </p>
      <FormularioCliente acao={criarCliente} erro={erro} />
    </div>
  );
}
