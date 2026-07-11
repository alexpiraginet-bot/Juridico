import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormularioCliente } from "@/components/FormularioCliente";
import { atualizarCliente } from "@/lib/acoes/clientes";
import { bd } from "@/lib/bd";

export const metadata: Metadata = { title: "Editar cliente" };

export default async function PaginaEditarCliente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const cliente = await bd.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Editar cliente</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">{cliente.nome}</p>
      <FormularioCliente acao={atualizarCliente.bind(null, cliente.id)} cliente={cliente} erro={erro} />
    </div>
  );
}
