"use server";

/*
 * Ação do atendimento — gera o relato fático (e a análise) do atendimento
 * por IA, a partir da conversa. A IA roda SÓ no servidor (a chave fica em
 * ANTHROPIC_API_KEY, nunca no cliente). Degrada com elegância: sem a chave,
 * a tela mantém o rascunho de demonstração e avisa.
 */

import { exigirUsuario } from "@/lib/auth";
import {
  gerarAnaliseDoAtendimentoComClaude,
  iaConfigurada,
  type AnaliseDoAtendimento,
  type MensagemParaIa,
} from "@/lib/ia";

export type ResultadoAnalise =
  | { ok: true; analise: AnaliseDoAtendimento }
  | { ok: false; erro: string };

export async function analisarAtendimento(
  mensagens: MensagemParaIa[],
): Promise<ResultadoAnalise> {
  // App atrás do login: só usuário autenticado dispara a IA (custo + acesso).
  await exigirUsuario();

  if (!iaConfigurada()) {
    return {
      ok: false,
      erro: "Configure a ANTHROPIC_API_KEY para gerar o relato pela IA. Enquanto isso, fica o rascunho de demonstração.",
    };
  }

  if (!mensagens.length) {
    return { ok: false, erro: "Conversa vazia — nada para analisar." };
  }

  try {
    const analise = await gerarAnaliseDoAtendimentoComClaude(mensagens);
    return { ok: true, analise };
  } catch (excecao) {
    return {
      ok: false,
      erro:
        excecao instanceof Error
          ? excecao.message
          : "Não foi possível gerar o relato agora — tente novamente.",
    };
  }
}
