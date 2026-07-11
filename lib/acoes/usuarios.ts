"use server";

/*
 * Ações de servidor do cadastro de usuários (Fase 3). Mesmo fluxo das
 * outras telas de banco: validar → gravar → revalidar → redirecionar;
 * erro volta pela URL (?erro=). Por ora é gestão de cadastro — o login
 * com senha é uma etapa seguinte.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarUsuario(dados: FormData) {
  const nome = texto(dados, "nome");
  const email = texto(dados, "email").toLowerCase();
  const cargo = texto(dados, "cargo") || null;

  let erro: string | null = null;
  if (!nome || !email) {
    erro = "Nome e e-mail são obrigatórios.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erro = "Informe um e-mail válido.";
  } else {
    try {
      await bd.usuario.create({ data: { nome, email, cargo } });
    } catch (excecao) {
      erro =
        (excecao as { code?: string }).code === "P2002"
          ? "Já existe um usuário com esse e-mail."
          : "Não foi possível salvar — verifique a conexão com o banco.";
    }
  }

  if (erro) redirect(`/usuarios?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function excluirUsuario(id: string) {
  try {
    await bd.usuario.delete({ where: { id } });
  } catch {
    redirect(
      `/usuarios?erro=${encodeURIComponent("Não foi possível excluir — verifique a conexão com o banco.")}`,
    );
  }
  revalidatePath("/usuarios");
}
