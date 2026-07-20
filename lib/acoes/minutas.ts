"use server";

/*
 * Ações de servidor das minutas — agora PERSISTIDAS. Junta o contexto real do
 * processo (banco), pede a redação ao Claude e GRAVA a minuta. Edições e
 * aprovação também são salvas. Tudo escopado ao Team e auditado. Regra do
 * produto: o sistema nunca protocola sozinho — aprovar só marca "pronta".
 */

import Anthropic from "@anthropic-ai/sdk";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { formatarData, formatarMoeda } from "@/lib/formatar";
import { gerarMinutaComClaude, iaConfigurada } from "@/lib/ia";
import { AREAS, FASES } from "@/lib/opcoes";

export type MinutaSalva = {
  id: string;
  titulo: string;
  teor: string;
  status: "RASCUNHO_IA" | "EDITADA" | "APROVADA";
};
type ResultadoMinuta = { ok: true; minuta: MinutaSalva } | { ok: false; erro: string };
type ResultadoSimples = { ok: true } | { ok: false; erro: string };

export async function gerarMinuta(processoId: string, instrucoes: string): Promise<ResultadoMinuta> {
  const usuario = await exigirUsuario();
  if (!usuario.teamId) return { ok: false, erro: "Seu usuário não está em um escritório." };
  if (!iaConfigurada()) {
    return { ok: false, erro: "IA não configurada — defina a variável ANTHROPIC_API_KEY." };
  }

  const processo = await bd.processo.findFirst({
    where: { id: processoId, teamId: usuario.teamId },
    include: {
      cliente: true,
      prazos: { where: { concluido: false }, orderBy: { vencimento: "asc" } },
    },
  });
  if (!processo) return { ok: false, erro: "Processo não encontrado no banco de dados." };

  let texto: string;
  try {
    texto = await gerarMinutaComClaude({
      processo: {
        numero: processo.numero,
        titulo: processo.titulo,
        area: AREAS[processo.area],
        fase: FASES[processo.fase].rotulo,
        tribunal: processo.tribunal ?? "não informado",
        valorCausa:
          processo.valorCausa != null ? formatarMoeda(Number(processo.valorCausa)) : "não informado",
        ultimoEvento: processo.ultimoEvento ?? "não informado",
      },
      cliente: {
        nome: processo.cliente.nome,
        cpfCnpj: processo.cliente.cpfCnpj,
        cidade: processo.cliente.cidade ?? "não informada",
      },
      prazosPendentes: processo.prazos.map(
        (prazo) =>
          `${prazo.descricao} — vence ${formatarData(prazo.vencimento)}${prazo.validado ? " (validado)" : " (pendente de validação)"}`,
      ),
      instrucoes: instrucoes.trim(),
    });
  } catch (erro) {
    return { ok: false, erro: traduzErroDaIa(erro) };
  }

  const titulo = `Minuta · ${processo.numero}`;
  try {
    const minuta = await bd.minuta.create({
      data: {
        teamId: usuario.teamId,
        processoId: processo.id,
        titulo,
        teor: texto,
        teorIa: texto,
        status: "RASCUNHO_IA",
        autorNome: usuario.nome,
      },
      select: { id: true },
    });
    await registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      teamId: usuario.teamId,
      acao: "minuta.gerada",
      detalhe: `gerou uma minuta do processo ${processo.numero} com a IA`,
    });
    return { ok: true, minuta: { id: minuta.id, titulo, teor: texto, status: "RASCUNHO_IA" } };
  } catch {
    return { ok: false, erro: "Minuta gerada, mas não consegui salvá-la no banco." };
  }
}

async function atualizarMinuta(
  minutaId: string,
  teor: string,
  status: "EDITADA" | "APROVADA",
): Promise<ResultadoSimples> {
  const usuario = await exigirUsuario();
  if (!usuario.teamId) return { ok: false, erro: "Seu usuário não está em um escritório." };
  const corpo = teor.trim();
  if (!corpo) return { ok: false, erro: "A minuta está vazia." };

  const minuta = await bd.minuta.findFirst({
    where: { id: minutaId, teamId: usuario.teamId },
    select: { id: true },
  });
  if (!minuta) return { ok: false, erro: "Minuta não encontrada neste escritório." };

  await bd.minuta.update({
    where: { id: minutaId },
    data: { teor: corpo, status, autorNome: usuario.nome },
  });
  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId: usuario.teamId,
    acao: status === "APROVADA" ? "minuta.aprovada" : "minuta.editada",
    detalhe:
      status === "APROVADA"
        ? "aprovou uma minuta (pronta para protocolo manual)"
        : "salvou uma edição de minuta",
  });
  return { ok: true };
}

export async function salvarEdicaoMinuta(minutaId: string, teor: string): Promise<ResultadoSimples> {
  return atualizarMinuta(minutaId, teor, "EDITADA");
}

export async function aprovarMinuta(minutaId: string, teor: string): Promise<ResultadoSimples> {
  return atualizarMinuta(minutaId, teor, "APROVADA");
}

export async function excluirMinuta(minutaId: string): Promise<ResultadoSimples> {
  const usuario = await exigirUsuario();
  if (!usuario.teamId) return { ok: false, erro: "Seu usuário não está em um escritório." };
  const minuta = await bd.minuta.findFirst({
    where: { id: minutaId, teamId: usuario.teamId },
    select: { id: true },
  });
  if (!minuta) return { ok: false, erro: "Minuta não encontrada." };
  await bd.minuta.delete({ where: { id: minutaId } });
  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId: usuario.teamId,
    acao: "minuta.excluida",
    detalhe: "excluiu uma minuta",
  });
  return { ok: true };
}

function traduzErroDaIa(erro: unknown): string {
  if (erro instanceof Anthropic.AuthenticationError) {
    return "Chave da API inválida — confira a variável ANTHROPIC_API_KEY.";
  }
  if (erro instanceof Anthropic.RateLimitError) {
    return "Limite de uso da IA atingido — aguarde alguns instantes e tente de novo.";
  }
  if (erro instanceof Anthropic.APIConnectionError) {
    return "Sem conexão com a API do Claude — verifique a rede e tente de novo.";
  }
  if (erro instanceof Anthropic.APIError) {
    return `A API do Claude respondeu com erro (${erro.status ?? "desconhecido"}).`;
  }
  return erro instanceof Error ? erro.message : "Erro inesperado ao gerar a minuta.";
}
