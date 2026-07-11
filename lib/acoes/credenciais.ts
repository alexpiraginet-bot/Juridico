"use server";

/*
 * Ações das credenciais jurídicas (OAB) — o DONO_ESCRITORIO cadastra as
 * OABs dos usuários da SUA equipe. É o que a varredura automática do DJEN
 * usa para puxar os processos de cada um. Só as credenciais `ativa` entram
 * no cron diário. Tudo escopado ao Team do dono.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirDono } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarCredencial(dados: FormData) {
  const dono = await exigirDono();

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
    // O usuário-alvo precisa ser da equipe do dono.
    const alvo = await bd.usuario.findFirst({ where: { id: usuarioId, teamId: dono.teamId } });
    if (!alvo) {
      erro = "Usuário inválido — escolha alguém da sua equipe.";
    } else {
      try {
        await bd.credencialOab.create({ data: { numero, uf, nomeAdvogado, usuarioId } });
      } catch (excecao) {
        erro =
          (excecao as { code?: string }).code === "P2002"
            ? `A OAB ${numero}/${uf} já está cadastrada.`
            : "Não foi possível salvar — verifique a conexão com o banco.";
      }
    }
  }

  if (erro) redirect(`/credenciais?erro=${encodeURIComponent(erro)}`);
  await registrarAuditoria({
    usuarioId: dono.id,
    usuarioNome: dono.nome,
    teamId: dono.teamId,
    acao: "credencial.criada",
    detalhe: `cadastrou a OAB ${numero}/${uf} (${nomeAdvogado})`,
  });
  revalidatePath("/credenciais");
  redirect("/credenciais");
}

export async function alternarCredencial(id: string, ativa: boolean) {
  const dono = await exigirDono();
  try {
    await bd.credencialOab.updateMany({
      where: { id, usuario: { teamId: dono.teamId } },
      data: { ativa },
    });
  } catch {
    redirect(
      `/credenciais?erro=${encodeURIComponent("Não foi possível atualizar — verifique a conexão com o banco.")}`,
    );
  }
  revalidatePath("/credenciais");
}

export async function excluirCredencial(id: string) {
  const dono = await exigirDono();
  let removida: { numero: string; uf: string } | null = null;
  try {
    const alvo = await bd.credencialOab.findFirst({
      where: { id, usuario: { teamId: dono.teamId } },
      select: { numero: true, uf: true },
    });
    if (alvo) {
      await bd.credencialOab.deleteMany({ where: { id, usuario: { teamId: dono.teamId } } });
      removida = alvo;
    }
  } catch {
    redirect(
      `/credenciais?erro=${encodeURIComponent("Não foi possível excluir — verifique a conexão com o banco.")}`,
    );
  }
  if (removida) {
    await registrarAuditoria({
      usuarioId: dono.id,
      usuarioNome: dono.nome,
      teamId: dono.teamId,
      acao: "credencial.removida",
      detalhe: `removeu a OAB ${removida.numero}/${removida.uf}`,
    });
  }
  revalidatePath("/credenciais");
}
