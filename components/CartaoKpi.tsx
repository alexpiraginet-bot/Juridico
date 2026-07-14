/*
 * Cartão de indicador do dashboard (feel iOS 26): número grande, rótulo e
 * uma linha de variação (verde quando boa, vermelha quando pede ação).
 * Squircle + sombra em camadas + faixa fina de acento no topo — degradê da
 * marca no geral, vermelho quando o cartão exige ação.
 */

import type { Kpi } from "@/lib/tipos";

export function CartaoKpi({ valor, rotulo, detalhe, tom, valorDestaque }: Kpi) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--shadow-ios)]">
      <span
        className={`absolute inset-x-0 top-0 h-0.5 ${valorDestaque ? "bg-vermelho" : "grad-lex"}`}
      />
      <p className={`text-3xl font-bold tabular-nums ${valorDestaque ? "text-vermelho" : "text-navy"}`}>
        {valor}
      </p>
      <p className="mt-1 text-[11.5px] leading-snug text-suave">{rotulo}</p>
      <p
        className={`mt-1.5 text-[11px] font-semibold ${
          tom === "bom" ? "text-sucesso-escuro" : "text-vermelho"
        }`}
      >
        {detalhe}
      </p>
    </div>
  );
}
