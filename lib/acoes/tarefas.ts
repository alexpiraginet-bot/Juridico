"use server";

/*
 * Ações do kanban de Tarefas (agora real, gravado no banco). Cada tarefa é do
 * Team do usuário (isolamento). Criar, mover entre colunas e excluir — tudo
 * auditado. `ordem` mantém a posição dentro da coluna (novas vão para o fim).
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { COLUNAS_TAREFA, ORDEM_COLUNAS } from "@/lib/opcoes";
import type { ColunaTarefa, PrioridadeTarefa } from "@/lib/generated/prisma/enums";

function erroUrl(mensagem: string): string {
  return `/tarefas?erro=${encodeURIComponent(mensagem)}`;
}

// Próxima posição livre no fim de uma coluna (para novas/movidas).
async function proximaOrdem(teamId: string, coluna: ColunaTarefa): Promise<number> {
  const agg = await bd.tarefa.aggregate({ where: { teamId, coluna }, _max: { ordem: true } });
  return (agg._max.ordem ?? 0) + 1;
}

export async function criarTarefa(dados: FormData) {
  const usuario = await exigirUsuario();
  if (!usuario.teamId) redirect(erroUrl("Seu usuário não está em um escritório."));
  const teamId = usuario.teamId;

  const titulo = String(dados.get("titulo") ?? "").trim();
  const detalhe = String(dados.get("detalhe") ?? "").trim() || null;
  const prioridadeBruta = String(dados.get("prioridade") ?? "").trim().toUpperCase();
  const prioridade = (["ALTA", "MEDIA", "BAIXA"] as const).includes(prioridadeBruta as PrioridadeTarefa)
    ? (prioridadeBruta as PrioridadeTarefa)
    : null;
  const processoId = String(dados.get("processoId") ?? "").trim() || null;
  const responsavelId = String(dados.get("responsavelId") ?? "").trim() || null;

  if (!titulo) redirect(erroUrl("Dê um título à tarefa."));

  // O responsável precisa ser do mesmo escritório (a tarefa é do Team). Os
  // processos são globais (tabela da Fase 2, sem inquilino) — basta existir.
  if (processoId) {
    const p = await bd.processo.findFirst({ where: { id: processoId }, select: { id: true } });
    if (!p) redirect(erroUrl("Processo inválido."));
  }
  if (responsavelId) {
    const u = await bd.usuario.findFirst({ where: { id: responsavelId, teamId }, select: { id: true } });
    if (!u) redirect(erroUrl("Responsável inválido para este escritório."));
  }

  await bd.tarefa.create({
    data: {
      titulo,
      detalhe,
      prioridade,
      processoId,
      responsavelId,
      teamId,
      coluna: "A_FAZER",
      ordem: await proximaOrdem(teamId, "A_FAZER"),
    },
  });
  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId,
    acao: "tarefa.criada",
    detalhe: `criou a tarefa "${titulo}"`,
  });
  revalidatePath("/tarefas");
  redirect("/tarefas");
}

// Move uma tarefa uma coluna para frente (avancar=true) ou para trás.
export async function moverTarefa(id: string, avancar: boolean) {
  const usuario = await exigirUsuario();
  if (!usuario.teamId) redirect("/tarefas");
  const teamId = usuario.teamId;

  const tarefa = await bd.tarefa.findFirst({
    where: { id, teamId },
    select: { id: true, coluna: true, titulo: true },
  });
  if (!tarefa) redirect("/tarefas");

  const i = ORDEM_COLUNAS.indexOf(tarefa.coluna);
  const destino = Math.min(Math.max(i + (avancar ? 1 : -1), 0), ORDEM_COLUNAS.length - 1);
  if (destino !== i) {
    const novaColuna = ORDEM_COLUNAS[destino];
    await bd.tarefa.update({
      where: { id },
      data: { coluna: novaColuna, ordem: await proximaOrdem(teamId, novaColuna) },
    });
    await registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      teamId,
      acao: "tarefa.movida",
      detalhe: `moveu "${tarefa.titulo}" para ${COLUNAS_TAREFA[novaColuna]}`,
    });
  }
  revalidatePath("/tarefas");
  redirect("/tarefas");
}

export async function excluirTarefa(id: string) {
  const usuario = await exigirUsuario();
  if (!usuario.teamId) redirect("/tarefas");
  const tarefa = await bd.tarefa.findFirst({
    where: { id, teamId: usuario.teamId },
    select: { titulo: true },
  });
  if (tarefa) {
    await bd.tarefa.delete({ where: { id } });
    await registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      teamId: usuario.teamId,
      acao: "tarefa.excluida",
      detalhe: `excluiu a tarefa "${tarefa.titulo}"`,
    });
  }
  revalidatePath("/tarefas");
  redirect("/tarefas");
}
