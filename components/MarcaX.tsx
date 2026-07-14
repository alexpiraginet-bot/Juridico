/*
 * MarcaX — o "X" de fita dobrada da LEX TECHNOLOGY, em degradê azul→violeta.
 * É o símbolo da marca; reaproveitado da versão em vídeo (video/src/tema.tsx),
 * agora afinado às cores dos tokens da web (#2e7dff → #7c3aed).
 *
 * `tamanho` em px; `brilho` liga a sombra suave (halo) do acento — bom sobre
 * fundo escuro (barra lateral, login), dispensável em ícones pequenos.
 */

export function MarcaX({
  tamanho = 28,
  brilho = false,
  className,
}: {
  tamanho?: number;
  brilho?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      className={className}
      style={{
        display: "block",
        filter: brilho ? "drop-shadow(0 12px 34px rgba(46,125,255,.42))" : undefined,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="marca-lex" x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2e7dff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M14 8 H34 L86 92 H66 Z" fill="url(#marca-lex)" />
      <path d="M86 8 H66 L14 92 H34 Z" fill="url(#marca-lex)" />
      {/* dobra central da fita — leve entalhe navy que dá o efeito 3D */}
      <path d="M50 40 L58 54 L50 60 L42 54 Z" fill="#0f1729" opacity="0.38" />
    </svg>
  );
}
