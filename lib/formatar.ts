/*
 * Funções de formatação usadas pelas telas.
 * Tudo em pt-BR: moeda em reais, datas no formato brasileiro.
 */

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Versão curta para os cartões do painel: R$ 477,5 mil */
export function formatarMoedaCompacta(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

/** "2026-07-14" -> "14/07/2026" (meio-dia evita erro de fuso horário) */
export function formatarData(dataIso: string): string {
  return new Date(`${dataIso}T12:00:00`).toLocaleDateString("pt-BR");
}

/** "2026-07-14" -> "14 de julho" */
export function formatarDataCurta(dataIso: string): string {
  return new Date(`${dataIso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

/** Quantos dias faltam (negativo = já venceu) da data de hoje até a data dada. */
export function diasAte(dataIso: string): number {
  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const alvo = new Date(`${dataIso}T00:00:00`);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

export function primeiraMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
