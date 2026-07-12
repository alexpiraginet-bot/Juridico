/**
 * "LexFlow em Movimento" — o filme animado (UI viva, sem screenshots).
 * Monta as 7 cenas numa TransitionSeries com transições variadas.
 * As cenas foram construídas por agentes (video/src/cenas/), cada uma
 * autossuficiente e coerente com o tema (video/src/tema.tsx).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { C, FPS } from "./tema";

import abertura from "./cenas/abertura-lex-sting";
import whatsapp from "./cenas/whatsapp-maria-santos";
import relato from "./cenas/relato-fatico-ia";
import prazo from "./cenas/prazo-validacao-humana";
import minuta from "./cenas/minuta-contestacao-335";
import numeros from "./cenas/numeros-impacto";
import fecho from "./cenas/fecho-marca-lex";

export { FPS };

const DUR_TRANSICAO = 14;

const CENAS = [
  { comp: abertura, dur: 130 },
  { comp: whatsapp, dur: 230 },
  { comp: relato, dur: 260 },
  { comp: prazo, dur: 210 },
  { comp: minuta, dur: 250 },
  { comp: numeros, dur: 200 },
  { comp: fecho, dur: 150 },
];

// Transições entre as cenas (uma a menos que o número de cenas).
const TRANSICOES = [
  fade(),
  slide({ direction: "from-right" }),
  fade(),
  wipe({ direction: "from-left" }),
  fade(),
  slide({ direction: "from-bottom" }),
];

// Numa TransitionSeries as transições sobrepõem as cenas vizinhas,
// então o total = soma das durações − soma das transições.
export const DURACAO_FILME =
  CENAS.reduce((a, b) => a + b.dur, 0) - TRANSICOES.length * DUR_TRANSICAO;

export const Filme: React.FC = () => {
  const filhos: React.ReactNode[] = [];
  CENAS.forEach((cena, i) => {
    const Cena = cena.comp;
    filhos.push(
      <TransitionSeries.Sequence key={`cena-${i}`} durationInFrames={cena.dur}>
        <Cena />
      </TransitionSeries.Sequence>
    );
    if (i < CENAS.length - 1) {
      filhos.push(
        <TransitionSeries.Transition
          key={`trans-${i}`}
          presentation={TRANSICOES[i]}
          timing={linearTiming({ durationInFrames: DUR_TRANSICAO })}
        />
      );
    }
  });

  return (
    <AbsoluteFill style={{ background: C.navy0 }}>
      <TransitionSeries>{filhos}</TransitionSeries>
    </AbsoluteFill>
  );
};
