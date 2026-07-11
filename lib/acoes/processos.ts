"use server";

/*
 * Ações de servidor do cadastro de processos.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { AreaProcesso, FaseProcesso } from "@/lib/generated/prisma/enums";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

function opcional(dados: FormData, campo: string): string | null {
  return texto(dados, campo) || null;
}

interface CamposProcesso {
  numero: string;
  titulo: string;
  area: AreaProcesso;
  tribunal: string | null;
  fase: FaseProcesso;
  ultimoEvento: string | null;
  valorCausa: number | null;
  clienteId: string;
}

function lerCampos(dados: FormData): { campos?: CamposProcesso; erro?: string } {
  const numero = texto(dados, "numero");
  const titulo = texto(dados, "titulo");
  const clienteId = texto(dados, "clienteId");
  const area = texto(dados, "area") as AreaProcesso;
  const fase = texto(dados, "fase") as FaseProcesso;

  if (!numero || !titulo || !clienteId) {
    return { erro: "Número, título e cliente são obrigatórios." };
  }
  if (!(area in AreaProcesso) || !(fase in FaseProcesso)) {
    return { erro: "Área ou fase inválida." };
  }

  const valorBruto = texto(dados, "valorCausa");
  const valorCausa = valorBruto ? Number(valorBruto) : null;
  if (valorCausa !== null && (Number.isNaN(valorCausa) || valorCausa < 0)) {
    return { erro: "Valor da causa inválido." };
  }

  return {
    campos: {
      numero,
      titulo,
      area,
      fase,
      tribunal: opcional(dados, "tribunal"),
      ultimoEvento: opcional(dados, "ultimoEvento"),
      valorCausa,
      clienteId,
    },
  };
}

function traduzErro(erro: unknown): string {
  if ((erro as { code?: string }).code === "P2002") {
    return "Já existe um processo com esse número CNJ.";
  }
  return "Não foi possível salvar — verifique a conexão com o banco.";
}

export async function criarProcesso(dados: FormData) {
  const { campos, erro: erroDeCampos } = lerCampos(dados);

  let erro = erroDeCampos ?? null;
  if (campos) {
    try {
      await bd.processo.create({ data: campos });
    } catch (excecao) {
      erro = traduzErro(excecao);
    }
  }

  if (erro) redirect(`/processos/novo?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/processos");
  redirect("/processos");
}

export async function atualizarProcesso(id: string, dados: FormData) {
  const { campos, erro: erroDeCampos } = lerCampos(dados);

  let erro = erroDeCampos ?? null;
  if (campos) {
    try {
      await bd.processo.update({ where: { id }, data: campos });
    } catch (excecao) {
      erro = traduzErro(excecao);
    }
  }

  if (erro) redirect(`/processos/${id}/editar?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/processos");
  redirect("/processos");
}

export async function excluirProcesso(id: string) {
  try {
    // Os prazos do processo caem junto (onDelete: Cascade no schema).
    await bd.processo.delete({ where: { id } });
  } catch {
    redirect(
      `/processos?erro=${encodeURIComponent("Não foi possível excluir — verifique a conexão com o banco.")}`,
    );
  }
  revalidatePath("/processos");
  revalidatePath("/prazos");
}
