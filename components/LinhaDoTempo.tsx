/*
 * Linha do tempo vertical com marcadores verdes,
 * usada no detalhe do processo e no painel de análise da IA.
 */

import type { EventoTimeline } from "@/lib/tipos";

export function LinhaDoTempo({ eventos }: { eventos: EventoTimeline[] }) {
  return (
    <div className="ml-1 space-y-2 border-l-2 border-verde pl-3">
      {eventos.map((evento) => (
        <div
          key={`${evento.quando}-${evento.texto}`}
          className="relative text-xs leading-relaxed before:absolute before:-left-[18px] before:top-[3px] before:h-2 before:w-2 before:rounded-full before:bg-verde"
        >
          <b className="text-navy">{evento.quando}</b> — {evento.texto}
        </div>
      ))}
    </div>
  );
}
