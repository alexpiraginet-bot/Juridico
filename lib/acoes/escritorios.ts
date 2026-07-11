"use server";

/*
 * Ações do painel central (super-admin). É onde nós, a plataforma,
 * cadastramos os escritórios (Team) — cada um com nome e logo — e criamos
 * o acesso do dono (DONO_ESCRITORIO). Daí em diante o escritório cuida dos
 * próprios usuários.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirSuperadmin, hashSenha } from "@/lib/auth";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarEscritorio(dados: FormData) {
  await exigirSuperadmin();

  const nome = texto(dados, "nome");
  const logoUrl = texto(dados, "logoUrl") || null;
  const donoNome = texto(dados, "donoNome");
  const donoEmail = texto(dados, "donoEmail").toLowerCase();
  const donoSenha = String(dados.get("donoSenha") ?? "");

  let erro: string | null = null;
  if (!nome || !donoNome || !donoEmail || !donoSenha) {
    erro = "Nome do escritório e os dados do dono (nome, e-mail, senha) são obrigatórios.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donoEmail)) {
    erro = "Informe um e-mail válido para o dono.";
  } else if (donoSenha.length < 6) {
    erro = "A senha do dono deve ter ao menos 6 caracteres.";
  } else {
    try {
      await bd.team.create({
        data: {
          nome,
          logoUrl,
          usuarios: {
            create: {
              nome: donoNome,
              email: donoEmail,
              senhaHash: hashSenha(donoSenha),
              papel: "DONO_ESCRITORIO",
            },
          },
        },
      });
    } catch (excecao) {
      erro =
        (excecao as { code?: string }).code === "P2002"
          ? "Já existe um usuário com esse e-mail."
          : "Não foi possível criar o escritório — verifique a conexão com o banco.";
    }
  }

  if (erro) redirect(`/central?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/central");
  redirect("/central");
}

export async function excluirEscritorio(id: string) {
  await exigirSuperadmin();
  try {
    await bd.team.delete({ where: { id } });
  } catch {
    redirect(
      `/central?erro=${encodeURIComponent("Não foi possível excluir — verifique a conexão com o banco.")}`,
    );
  }
  revalidatePath("/central");
}
