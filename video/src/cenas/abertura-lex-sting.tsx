/**
 * Cena "Sting de marca — o X da LEX se desenhando".
 * Filme: "LexFlow em Movimento".
 *
 * Abre com força de autoria: os DOIS traços do X de LEX TECHNOLOGY se
 * traçam sozinhos no degradê azul→violeta, o preenchimento gradiente
 * floresce, o losango navy central assenta e a assinatura resolve em
 * "LexFlow · por LEX TECHNOLOGY" — plantando a marca antes do produto.
 *
 * Vitrine de técnicas (Remotion 4 / React 19):
 *  - SVG stroke-dasharray/stroke-dashoffset  → draw-on dos dois traços;
 *  - fill-opacity via interpolate            → o preenchimento assume o contorno;
 *  - spring(damping 200)                     → wordmark, kicker e losango;
 *  - translateY + opacity                    → cascata da assinatura;
 *  - interpolate no glow (drop-shadow+disco) → brilho floresce atrás do X;
 *  - gradLex em WebkitBackgroundClip         → "Flow" e o ponto da autoria;
 *  - tema.fade()                             → entrada/saída suave da cena.
 *
 * Duração: 130 frames a 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, SANS, gradLex, fundoEscuro, fade } from "../tema";

// Caminhos do X (os mesmos do MarcaX do tema, aqui adaptados para o modo
// traço→preenchimento). O losango é a fenda navy no miolo da marca.
const TRACO_A = "M14 8 H34 L86 92 H66 Z";
const TRACO_B = "M86 8 H66 L14 92 H34 Z";
const LOSANGO = "M50 40 L58 54 L50 60 L42 54 Z";

// Comprimento de cada contorno, em unidades do viewBox 0 0 100 100
// (perímetro do triângulo ≈ 20 + 98.8 + 20 + 98.8 ≈ 237.6). Um respiro a mais
// garante o traço cheio no fim do desenho e o vazio total no começo.
const COMPRIMENTO = 240;

// Atalho: sempre "prender" a interpolação nas pontas.
const PRESO = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // --- desenho dos dois traços: stroke-dashoffset de escondido (COMPRIMENTO) a cheio (0) ---
  // Traço A risca de F0 a F52; traço B, atrasado, de F14 a F68.
  const offsetA = interpolate(frame, [0, 52], [COMPRIMENTO, 0], {
    ...PRESO,
    easing: Easing.inOut(Easing.ease),
  });
  const offsetB = interpolate(frame, [14, 68], [COMPRIMENTO, 0], {
    ...PRESO,
    easing: Easing.inOut(Easing.ease),
  });

  // --- o preenchimento gradiente floresce entre F58–F82 ---
  const preenchimento = interpolate(frame, [58, 82], [0, 1], PRESO);
  // --- e o contorno recua entre F74–F94, entregando a forma ao preenchimento ---
  const contorno = interpolate(frame, [74, 94], [1, 0], PRESO);

  // --- losango navy central: surge em F74 com leve escala (assenta em opacity .4) ---
  const losango = spring({ frame: frame - 74, fps, config: { damping: 200 } });

  // --- brilho florescendo atrás do X em F60–92 (disco radial + drop-shadow duplo) ---
  const brilho = interpolate(frame, [60, 92], [0, 1], PRESO);
  const filtroBrilho =
    `drop-shadow(0 22px ${interpolate(brilho, [0, 1], [24, 60])}px rgba(76,141,255,${0.4 * brilho}))` +
    ` drop-shadow(0 6px ${interpolate(brilho, [0, 1], [12, 40])}px rgba(139,59,240,${0.3 * brilho}))`;

  // --- assinatura à direita, em cascata: kicker (F80) → wordmark (F86) → autoria (F108) ---
  const kicker = spring({ frame: frame - 80, fps, config: { damping: 200 } });
  const nome = spring({ frame: frame - 86, fps, config: { damping: 200 } });
  const autoria = interpolate(frame, [108, 126], [0, 1], PRESO);

  return (
    <AbsoluteFill
      style={{
        background: fundoEscuro,
        opacity: fade(frame, durationInFrames),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 56,
      }}
    >
      {/* ==================== o X que se desenha ==================== */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* disco de brilho ambiente, atrás do X */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(76,141,255,.30), rgba(139,59,240,.16) 46%, transparent 70%)",
            filter: "blur(16px)",
            opacity: brilho,
            transform: `scale(${interpolate(brilho, [0, 1], [0.7, 1.12])})`,
            zIndex: 0,
          }}
        />
        {/* o X em si (drop-shadow do glow acompanha a silhueta) */}
        <div style={{ position: "relative", zIndex: 1, filter: filtroBrilho }}>
          <svg width={230} height={230} viewBox="0 0 100 100" style={{ display: "block" }}>
            <defs>
              <linearGradient id="lexgrad-tema" x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
                <stop stopColor={C.lexA} />
                <stop offset="1" stopColor={C.lexB} />
              </linearGradient>
            </defs>

            {/* traço A — risca via dashoffset, depois recebe o preenchimento */}
            <path
              d={TRACO_A}
              fill="url(#lexgrad-tema)"
              fillOpacity={preenchimento}
              stroke="url(#lexgrad-tema)"
              strokeOpacity={contorno}
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={COMPRIMENTO}
              strokeDashoffset={offsetA}
            />
            {/* traço B — mesmo desenho, atrasado */}
            <path
              d={TRACO_B}
              fill="url(#lexgrad-tema)"
              fillOpacity={preenchimento}
              stroke="url(#lexgrad-tema)"
              strokeOpacity={contorno}
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={COMPRIMENTO}
              strokeDashoffset={offsetB}
            />
            {/* losango navy central — surge com leve escala, assenta em opacity .4 */}
            <path
              d={LOSANGO}
              fill={C.navy0}
              opacity={interpolate(losango, [0, 1], [0, 0.4])}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: `scale(${interpolate(losango, [0, 1], [0.4, 1])})`,
              }}
            />
          </svg>
        </div>
      </div>

      {/* ==================== bloco da assinatura ==================== */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {/* kicker */}
        <div
          style={{
            opacity: kicker,
            transform: `translateY(${interpolate(kicker, [0, 1], [16, 0])}px)`,
            color: "#8aa0c6",
            fontSize: 25,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: SANS,
          }}
        >
          Gestão jurídica com IA
        </div>

        {/* wordmark LexFlow ("Flow" no degradê da marca) */}
        <div
          style={{
            opacity: nome,
            transform: `translateY(${interpolate(nome, [0, 1], [24, 0])}px)`,
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            margin: "10px 0 0",
            fontFamily: SANS,
            color: C.texto,
          }}
        >
          Lex
          <span
            style={{
              background: gradLex,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Flow
          </span>
        </div>

        {/* autoria — "• por LEX TECHNOLOGY" (ponto no degradê da marca) */}
        <div
          style={{
            opacity: autoria,
            transform: `translateY(${interpolate(autoria, [0, 1], [8, 0])}px)`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 30,
            color: "#8391b4",
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: SANS,
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 999, background: gradLex }} />
          por LEX TECHNOLOGY
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Cena;
