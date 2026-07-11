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

/** Quantos dias faltam até o vencimento (negativo = já venceu). */
export function diasAte(vencimento: Date): number {
  const agora = new Date();
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((vencimento.getTime() - hoje) / 86_400_000);
}
