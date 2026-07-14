import { Barra, CartaoEsqueleto } from "@/components/Esqueleto";

// Esqueleto da tela do processo enquanto o cabeçalho (banco) e depois o
// DataJud carregam. O clique responde na hora.
export default function Carregando() {
  return (
    <div aria-hidden>
      <Barra largura="6rem" altura="0.75rem" className="mb-3" />
      <Barra largura="55%" altura="1.25rem" className="mb-2" />
      <Barra largura="35%" altura="0.75rem" className="mb-4" />
      <div className="mb-5 flex gap-2">
        <Barra largura="5rem" altura="1.25rem" />
        <Barra largura="6rem" altura="1.25rem" />
      </div>
      <CartaoEsqueleto linhas={4} />
    </div>
  );
}
