/**
 * Tema compartilhado do "LexFlow em Movimento" (o filme animado).
 * Todas as cenas importam daqui, para ficarem coerentes na marca.
 * Marca LexFlow (navy/verde/creme) + LEX TECHNOLOGY (degradê azul→violeta) + IA (roxo/✨).
 */
import React from "react";
import { interpolate } from "remotion";

export const FPS = 30;

export const C = {
  // fundos
  navy0: "#0b1220",
  navy: "#1B2A41",
  navy2: "#243a5a",
  // superfícies claras (para mockups de tela)
  card: "#FFFFFF",
  creme: "#F4F3EE",
  cremeSuave: "#FBFAF5",
  linhaClara: "#E3E1D8",
  tintaEscura: "#22252A",
  mutClaro: "#7A7E87",
  // acentos do produto
  verde: "#7FA65A",
  verdeD: "#4E6B33",
  verdeSuave: "#EBF2E2",
  verdeClaro: "#a9cc86",
  ambar: "#C98A2D",
  ambarSuave: "#FBF0DC",
  vermelho: "#B4483E",
  azul: "#3D6B9E",
  // IA
  roxo: "#8b6fd0",
  roxoForte: "#6b4fa8",
  roxoBg: "rgba(139,111,208,.16)",
  // LEX TECHNOLOGY (degradê da marca de tecnologia)
  lexA: "#4c8dff",
  lexB: "#8b3bf0",
  // texto sobre navy
  texto: "#eef1f6",
  mut: "#aab6ca",
  linha: "rgba(255,255,255,.10)",
};

export const SANS = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const SERIF = 'Georgia, "Times New Roman", serif';
export const gradLex = `linear-gradient(118deg, ${C.lexA}, ${C.lexB})`;
export const gradVerde = `linear-gradient(118deg, ${C.verde}, ${C.verdeD})`;

// Fundo navy padrão (com brilhos azul/violeta da marca). Use no root de cada cena
// que roda sobre fundo escuro.
export const fundoEscuro = `radial-gradient(1200px 700px at 82% -18%, rgba(124,58,237,.26), transparent 60%),
  radial-gradient(900px 620px at 4% 118%, rgba(59,130,246,.22), transparent 55%),
  ${C.navy0}`;

// Fade de entrada/saída da cena (opacidade). dur = durationInFrames da cena.
export const fade = (frame: number, dur: number, dIn = 12, dOut = 14) =>
  interpolate(frame, [0, dIn, dur - dOut, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// O X da marca LEX, em degradê azul→violeta.
export const MarcaX: React.FC<{ tamanho: number; sombra?: boolean }> = ({ tamanho, sombra = true }) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 100 100"
    style={{ display: "block", filter: sombra ? "drop-shadow(0 18px 50px rgba(76,141,255,.4))" : undefined }}
  >
    <defs>
      <linearGradient id="lexgrad-tema" x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor={C.lexA} />
        <stop offset="1" stopColor={C.lexB} />
      </linearGradient>
    </defs>
    <path d="M14 8 H34 L86 92 H66 Z" fill="url(#lexgrad-tema)" />
    <path d="M86 8 H66 L14 92 H34 Z" fill="url(#lexgrad-tema)" />
    <path d="M50 40 L58 54 L50 60 L42 54 Z" fill={C.navy0} opacity="0.4" />
  </svg>
);

// Selo de conteúdo de IA (✨) — princípio central do produto.
export const SeloIA: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: C.roxoBg,
      color: "#d6c9f5",
      border: "1px solid rgba(139,111,208,.42)",
      padding: "8px 16px",
      borderRadius: 999,
      fontSize: 22,
      fontWeight: 600,
      fontFamily: SANS,
      ...style,
    }}
  >
    ✨ {children}
  </div>
);
