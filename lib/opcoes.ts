/*
 * Tradução dos enums do banco para os rótulos das telas.
 * O banco guarda "TRABALHISTA"; a tela mostra "Trabalhista".
 */

import type {
  AreaProcesso,
  FaseProcesso,
  ColunaTarefa,
  PrioridadeTarefa,
} from "@/lib/generated/prisma/enums";
import type { TomSelo } from "@/lib/tipos";

export const AREAS: Record<AreaProcesso, string> = {
  TRABALHISTA: "Trabalhista",
  CIVEL: "Cível",
  FAMILIA: "Família",
  TRIBUTARIO: "Tributário",
  CRIMINAL: "Criminal",
  CONSUMIDOR: "Consumidor",
  OUTRA: "Outra",
};

export const FASES: Record<FaseProcesso, { rotulo: string; tom: TomSelo }> = {
  CONHECIMENTO: { rotulo: "Conhecimento", tom: "azul" },
  INSTRUCAO: { rotulo: "Instrução", tom: "azul" },
  SENTENCA: { rotulo: "Sentença", tom: "verde" },
  RECURSAL: { rotulo: "Recursal", tom: "cinza" },
  EXECUCAO: { rotulo: "Execução", tom: "navy" },
  ARQUIVADO: { rotulo: "Arquivado", tom: "cinza" },
};

export const COLUNAS_TAREFA: Record<ColunaTarefa, string> = {
  A_FAZER: "A fazer",
  EM_ANDAMENTO: "Em andamento",
  EM_REVISAO: "Em revisão",
  CONCLUIDA: "Concluído",
};

export const PRIORIDADES_TAREFA: Record<PrioridadeTarefa, { rotulo: string; tom: TomSelo }> = {
  ALTA: { rotulo: "Alta", tom: "vermelho" },
  MEDIA: { rotulo: "Média", tom: "ambar" },
  BAIXA: { rotulo: "Baixa", tom: "cinza" },
};

// Ordem das colunas do kanban, da esquerda para a direita.
export const ORDEM_COLUNAS: ColunaTarefa[] = ["A_FAZER", "EM_ANDAMENTO", "EM_REVISAO", "CONCLUIDA"];

export function rotuloDaArea(area: AreaProcesso): string {
  return AREAS[area];
}

export function seloDaFase(fase: FaseProcesso): { rotulo: string; tom: TomSelo } {
  return FASES[fase];
}
