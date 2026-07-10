/*
 * Cartão de indicador do painel (stat tile):
 * rótulo pequeno em cima, valor grande no meio, texto de apoio embaixo.
 */

interface Props {
  rotulo: string;
  valor: string;
  apoio?: string;
}

export function CartaoIndicador({ rotulo, valor, apoio }: Props) {
  return (
    <div className="rounded-xl border border-borda bg-superficie p-5">
      <p className="text-sm text-suave">{rotulo}</p>
      <p className="mt-2 text-3xl font-semibold text-tinta">{valor}</p>
      {apoio && <p className="mt-1 text-sm text-tinta-2">{apoio}</p>}
    </div>
  );
}
