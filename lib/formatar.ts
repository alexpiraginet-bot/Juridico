/*
 * Formatação em pt-BR para os dados vindos do banco.
 *
 * Datas de vencimento são gravadas como "data pura" (sem hora) e o
 * banco as devolve à meia-noite UTC — por isso todo formato usa
 * timeZone "UTC", evitando o clássico erro de "um dia a menos".
 */

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatarDataCurta(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/*
 * Data + hora para carimbos reais (o log de auditoria grava o instante, não
 * uma "data pura"). Por isso mostramos no fuso de Brasília (America/Sao_Paulo),
 * e não em UTC.
 */
export function formatarDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

/** Quantos dias faltam até o vencimento (negativo = já venceu). */
export function diasAte(vencimento: Date): number {
  const agora = new Date();
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((vencimento.getTime() - hoje) / 86_400_000);
}
