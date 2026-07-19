import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormularioProcesso } from "@/components/FormularioProcesso";
import { atualizarProcesso } from "@/lib/acoes/processos";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { bd } from "@/lib/bd";

export const metadata: Metadata = { title: "Editar processo" };

export default async function PaginaEditarProcesso({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const usuario = await exigirUsuarioDoEscritorio();
  const { id } = await params;
  const { erro } = await searchParams;

  const [processo, clientes] = await Promise.all([
    bd.processo.findFirst({ where: { id, teamId: usuario.teamId } }),
    bd.cliente.findMany({
      where: { teamId: usuario.teamId },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);
  if (!processo) notFound();

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Editar processo</h1>
      <p className="mb-4 mt-0.5 font-mono text-xs text-suave">{processo.numero}</p>
      <FormularioProcesso
        acao={atualizarProcesso.bind(null, processo.id)}
        clientes={clientes}
        processo={{ ...processo, valorCausa: processo.valorCausa != null ? Number(processo.valorCausa) : null }}
        erro={erro}
      />
    </div>
  );
}
