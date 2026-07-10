/*
 * Selo de status de um processo.
 *
 * A cor nunca carrega o significado sozinha: o texto do selo diz o
 * status por extenso, e a bolinha colorida só reforça a leitura.
 */

import type { StatusProcesso } from "@/lib/tipos";

const configuracao: Record<StatusProcesso, { rotulo: string; corBolinha: string }> = {
  ativo: { rotulo: "Ativo", corBolinha: "bg-status-bom" },
  suspenso: { rotulo: "Suspenso", corBolinha: "bg-status-alerta" },
  arquivado: { rotulo: "Arquivado", corBolinha: "bg-suave" },
  encerrado: { rotulo: "Encerrado", corBolinha: "bg-acento" },
};

export function SeloStatus({ status }: { status: StatusProcesso }) {
  const { rotulo, corBolinha } = configuracao[status];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-borda bg-plano px-2.5 py-0.5 text-xs font-medium text-tinta-2">
      <span className={`h-2 w-2 rounded-full ${corBolinha}`} aria-hidden />
      {rotulo}
    </span>
  );
}
