/*
 * Selo (tag) de status — as seis variações de cor do protótipo.
 * O texto sempre diz o significado; a cor apenas reforça.
 */

import type { TomSelo } from "@/lib/tipos";

const estilos: Record<TomSelo, string> = {
  verde: "bg-selo-verde text-sucesso-escuro",
  ambar: "bg-selo-ambar text-ambar",
  vermelho: "bg-selo-vermelho text-vermelho",
  azul: "bg-selo-azul text-azul",
  cinza: "bg-selo-cinza text-[#666666]",
  navy: "bg-selo-navy text-navy",
};

export function Selo({ tom, children }: { tom: TomSelo; children: React.ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${estilos[tom]}`}
    >
      {children}
    </span>
  );
}
