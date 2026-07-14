/*
 * Cartão de indicador do dashboard: número grande, rótulo e
 * uma linha de variação (verde quando boa, vermelha quando pede ação).
 */

import type { Kpi } from "@/lib/tipos";

export function CartaoKpi({ valor, rotulo, detalhe, tom, valorDestaque }: Kpi) {
  return (
    <div className="rounded-xl border border-borda bg-superficie p-4">
      <p className={`text-2xl font-bold ${valorDestaque ? "text-vermelho" : "text-navy"}`}>
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
