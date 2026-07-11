/*
 * Chip que mostra a urgência de um prazo ("faltam 4 dias", "vence hoje"...).
 * A cor acompanha a urgência, mas o texto sempre diz tudo.
 */

import { diasAte } from "@/lib/formatar";

function urgencia(dias: number): { texto: string; corBolinha: string } {
  if (dias < 0) {
    const atraso = Math.abs(dias);
    return {
      texto: atraso === 1 ? "vencido há 1 dia" : `vencido há ${atraso} dias`,
      corBolinha: "bg-vermelho",
    };
  }
  if (dias === 0) return { texto: "vence hoje", corBolinha: "bg-vermelho" };
  if (dias <= 3) {
    return {
      texto: dias === 1 ? "falta 1 dia" : `faltam ${dias} dias`,
      corBolinha: "bg-ambar",
    };
  }
  if (dias <= 7) return { texto: `faltam ${dias} dias`, corBolinha: "bg-ambar" };
  return { texto: `faltam ${dias} dias`, corBolinha: "bg-suave" };
}

export function ChipPrazo({ vencimento }: { vencimento: Date }) {
  const { texto, corBolinha } = urgencia(diasAte(vencimento));

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-borda bg-realce px-2.5 py-0.5 text-[10.5px] font-semibold text-tinta">
      <span className={`h-2 w-2 rounded-full ${corBolinha}`} aria-hidden />
      {texto}
    </span>
  );
}
