"use server";

/*
 * Ações de servidor das credenciais jurídicas (OAB). É o que a varredura
 * automática do DJEN usa para puxar os processos de cada usuário. Só as
 * credenciais `ativa` entram no cron diário.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirSuperadmin } from "@/lib/auth";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarCredencial(dados: FormData) {
  await exigirSuperadmin();
  const numero = texto(dados, "numero").replace(/\D/g, "");
  const uf = texto(dados, "uf").toUpperCase();
  const nomeAdvogado = texto(dados, "nomeAdvogado");
  const usuarioId = texto(dados, "usuarioId");

  let erro: string | null = null;
  if (!numero || !uf || !nomeAdvogado || !usuarioId) {
    erro = "Número da OAB, UF, nome e usuário são obrigatórios.";
  } else if (uf.length !== 2) {
    erro = "UF deve ter 2 letras (ex.: ES).";
  } else {
    try {
      await bd.credencialOab.create({ data: { numero, uf, nomeAdvogado, usuarioId } });
    } catch (excecao) {
      const codigo = (excecao as { code?: string }).code;
      erro =
        codigo === "P2002"
          ? `A OAB ${numero}/${uf} já está cadastrada.`
          : codigo === "P2003"
            ? "Usuário inválido — recarregue a página e tente de novo."
            : "Não foi possível salvar — verifique a conexão com o banco.";
    }
  }

  if (erro) redirect(`/credenciais?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/credenciais");
  redirect("/credenciais");
}

// Liga/desliga uma credencial na varredura automática, sem excluí-la.
export async function alternarCredencial(id: string, ativa: boolean) {
  await exigirSuperadmin();
  try {
    await bd.credencialOab.update({ where: { id }, data: { ativa } });
  } catch {
    redirect(
      `/credenciais?erro=${encodeURIComponent("Não foi possível atualizar — verifique a conexão com o banco.")}`,
    );
  }
  revalidatePath("/credenciais");
}

export async function excluirCredencial(id: string) {
  await exigirSuperadmin();
  try {
    await bd.credencialOab.delete({ where: { id } });
  } catch {
    redirect(
      `/credenciais?erro=${encodeURIComponent("Não foi possível excluir — verifique a conexão com o banco.")}`,
    );
  }
  revalidatePath("/credenciais");
}
