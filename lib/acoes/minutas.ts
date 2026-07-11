"use server";

/*
 * Ação de servidor das minutas: junta o contexto real do processo
 * (banco de dados) e pede a redação ao Claude. Erros da API viram
 * mensagens amigáveis — a tela nunca quebra.
 */

import Anthropic from "@anthropic-ai/sdk";
import { bd } from "@/lib/bd";
import { formatarData, formatarMoeda } from "@/lib/formatar";
import { gerarMinutaComClaude, iaConfigurada } from "@/lib/ia";
import { AREAS, FASES } from "@/lib/opcoes";

export async function gerarMinutaReal(
  processoId: string,
  instrucoes: string,
): Promise<{ ok: true; texto: string } | { ok: false; erro: string }> {
  if (!iaConfigurada()) {
    return { ok: false, erro: "IA não configurada — defina a variável ANTHROPIC_API_KEY." };
  }

  const processo = await bd.processo.findUnique({
    where: { id: processoId },
    include: {
      cliente: true,
      prazos: { where: { concluido: false }, orderBy: { vencimento: "asc" } },
    },
  });
  if (!processo) {
    return { ok: false, erro: "Processo não encontrado no banco de dados." };
  }

  try {
    const texto = await gerarMinutaComClaude({
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

    return { ok: true, texto };
  } catch (erro) {
    return { ok: false, erro: traduzErroDaIa(erro) };
  }
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
