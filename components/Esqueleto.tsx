/*
 * Esqueletos de carregamento (feel iOS 26): retângulos que "pulsam" no lugar
 * do conteúdo enquanto a página busca dados no servidor. Usados nos
 * loading.tsx das telas mais pesadas — o clique responde na hora, sem a
 * sensação de "travou".
 */

export function Barra({
  largura = "100%",
  altura = "0.875rem",
  className = "",
}: {
  largura?: string;
  altura?: string;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-plano-2 ${className}`}
      style={{ width: largura, height: altura }}
    />
  );
}

export function CartaoEsqueleto({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-borda bg-superficie p-4">
      <Barra largura="45%" altura="1rem" />
      {Array.from({ length: linhas }).map((_, i) => (
        <Barra key={i} largura={i === linhas - 1 ? "70%" : "100%"} />
      ))}
    </div>
  );
}

export function EsqueletoPagina({
  titulo = "45%",
  cartoes = 3,
}: {
  titulo?: string;
  cartoes?: number;
}) {
  return (
    <div aria-hidden>
      <Barra largura={titulo} altura="1.25rem" className="mb-2" />
      <Barra largura="30%" altura="0.75rem" className="mb-5" />
      <div className="space-y-3">
        {Array.from({ length: cartoes }).map((_, i) => (
          <CartaoEsqueleto key={i} />
        ))}
      </div>
    </div>
  );
}
