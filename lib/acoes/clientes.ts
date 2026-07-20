"use server";

/*
 * Ações de servidor do cadastro de clientes.
 *
 * "use server" faz destas funções endpoints seguros que os formulários
 * chamam direto — sem API manual. O fluxo é sempre: validar, gravar,
 * revalidar a listagem (revalidatePath) e redirecionar. Erros voltam
 * pela própria URL (?erro=...) para a tela mostrar a mensagem.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

function opcional(dados: FormData, campo: string): string | null {
  return texto(dados, campo) || null;
}

function traduzErro(erro: unknown): string {
  if ((erro as { code?: string }).code === "P2002") {
    return "Já existe um cliente com esse CPF/CNPJ neste escritório.";
  }
  return "Não foi possível salvar — verifique a conexão com o banco.";
}

export async function criarCliente(dados: FormData) {
  const usuario = await exigirUsuarioDoEscritorio();
  const nome = texto(dados, "nome");
  const cpfCnpj = texto(dados, "cpfCnpj");

  let erro: string | null = null;
  if (!nome || !cpfCnpj) {
    erro = "Nome e CPF/CNPJ são obrigatórios.";
  } else {
    try {
      await bd.cliente.create({
        data: {
          nome,
          cpfCnpj,
          email: opcional(dados, "email"),
          telefone: opcional(dados, "telefone"),
          cidade: opcional(dados, "cidade"),
          teamId: usuario.teamId,
        },
      });
      await registrarAuditoria({
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        teamId: usuario.teamId,
        acao: "cliente.criado",
        detalhe: `cadastrou o cliente "${nome}"`,
      });
    } catch (excecao) {
      erro = traduzErro(excecao);
    }
  }

  if (erro) redirect(`/clientes/novo?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function atualizarCliente(id: string, dados: FormData) {
  const usuario = await exigirUsuarioDoEscritorio();
  const nome = texto(dados, "nome");
  const cpfCnpj = texto(dados, "cpfCnpj");

  let erro: string | null = null;
  if (!nome || !cpfCnpj) {
    erro = "Nome e CPF/CNPJ são obrigatórios.";
  } else {
    try {
      const atualizado = await bd.cliente.updateMany({
        where: { id, teamId: usuario.teamId },
        data: {
          nome,
          cpfCnpj,
          email: opcional(dados, "email"),
          telefone: opcional(dados, "telefone"),
          cidade: opcional(dados, "cidade"),
        },
      });
      if (atualizado.count === 0) throw new Error("Cliente fora do escritório.");
      await registrarAuditoria({
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        teamId: usuario.teamId,
        acao: "cliente.atualizado",
        detalhe: `atualizou o cliente "${nome}"`,
      });
    } catch (excecao) {
      erro = traduzErro(excecao);
    }
  }

  if (erro) redirect(`/clientes/${id}/editar?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function excluirCliente(id: string) {
  const usuario = await exigirUsuarioDoEscritorio();
  try {
    const cliente = await bd.cliente.findFirst({
      where: { id, teamId: usuario.teamId },
      select: { nome: true },
    });
    if (!cliente) redirect("/clientes");
    await bd.cliente.deleteMany({ where: { id, teamId: usuario.teamId } });
    await registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      teamId: usuario.teamId,
      acao: "cliente.excluido",
      detalhe: `excluiu o cliente "${cliente.nome}"`,
    });
  } catch (excecao) {
    const mensagem =
      (excecao as { code?: string }).code === "P2003"
        ? "Este cliente tem processos vinculados — exclua os processos dele primeiro."
        : "Não foi possível excluir — verifique a conexão com o banco.";
    redirect(`/clientes?erro=${encodeURIComponent(mensagem)}`);
  }
  revalidatePath("/clientes");
}
