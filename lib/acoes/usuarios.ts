"use server";

/*
 * Ações da equipe do escritório — o DONO_ESCRITORIO cadastra os seus
 * usuários (advogados, assessores, estagiários), cada um com seu login.
 * Tudo escopado ao Team do dono: ele nunca mexe em usuário de outro
 * escritório.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirDono, hashSenha } from "@/lib/auth";

// Papéis que o dono pode atribuir (nunca SUPERADMIN nem outro dono).
const PAPEIS_EQUIPE = ["ADVOGADO", "ASSESSOR", "ESTAGIARIO"] as const;
type PapelEquipe = (typeof PAPEIS_EQUIPE)[number];

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarUsuario(dados: FormData) {
  const dono = await exigirDono();

  const nome = texto(dados, "nome");
  const email = texto(dados, "email").toLowerCase();
  const senha = String(dados.get("senha") ?? "");
  const papelBruto = texto(dados, "papel");
  const papel: PapelEquipe = (PAPEIS_EQUIPE as readonly string[]).includes(papelBruto)
    ? (papelBruto as PapelEquipe)
    : "ADVOGADO";

  let erro: string | null = null;
  if (!nome || !email || !senha) {
    erro = "Nome, e-mail e senha são obrigatórios.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erro = "Informe um e-mail válido.";
  } else if (senha.length < 6) {
    erro = "A senha deve ter ao menos 6 caracteres.";
  } else {
    try {
      await bd.usuario.create({
        data: { nome, email, senhaHash: hashSenha(senha), papel, teamId: dono.teamId },
      });
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
  const dono = await exigirDono();
  try {
    // Só remove membro da própria equipe, e nunca o próprio dono.
    await bd.usuario.deleteMany({
      where: { id, teamId: dono.teamId, papel: { not: "DONO_ESCRITORIO" } },
    });
  } catch {
    redirect(
      `/usuarios?erro=${encodeURIComponent("Não foi possível excluir — verifique a conexão com o banco.")}`,
    );
  }
  revalidatePath("/usuarios");
}
