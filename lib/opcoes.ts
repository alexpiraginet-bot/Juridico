/*
 * Tradução dos enums do banco para os rótulos das telas.
 * O banco guarda "TRABALHISTA"; a tela mostra "Trabalhista".
 */

import type { AreaProcesso, FaseProcesso } from "@/lib/generated/prisma/enums";
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

export function rotuloDaArea(area: AreaProcesso): string {
  return AREAS[area];
}

export function seloDaFase(fase: FaseProcesso): { rotulo: string; tom: TomSelo } {
  return FASES[fase];
}
