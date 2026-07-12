/**
 * Cena "Números de impacto — contadores e o custo".
 * Filme: "LexFlow em Movimento".
 *
 * Contadores sobem (142 processos, 8 min de 1ª resposta, 41% de conversão) e,
 * abaixo, duas barras comparam o custo: construir do zero (R$180k–350k) x
 * ter pronto (~R$8,4k no 1º ano) — com o selo "~30× mais barato".
 *
 * Técnicas: contadores animados (interpolate+Math.round), barras que crescem,
 * spring nos tiles, gradientes da marca, tema.fade().
 * Duração: 200 frames a 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, SANS, gradLex, gradVerde, fundoEscuro, fade } from "../tema";

const conta = (frame: number, ini: number, dur: number, alvo: number) =>
  Math.round(interpolate(frame, [ini, ini + dur], [0, alvo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

const Tile: React.FC<{ frame: number; fps: number; delay: number; valor: string; rotulo: string }> = ({ frame, fps, delay, valor, rotulo }) => {
  const ap = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        flex: 1,
        transform: `translateY(${interpolate(ap, [0, 1], [26, 0])}px)`,
        opacity: ap,
        background: "rgba(255,255,255,.05)",
        border: `1px solid ${C.linha}`,
        borderRadius: 20,
        padding: "34px 30px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: SANS, background: gradLex, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
        {valor}
      </div>
      <div style={{ marginTop: 14, color: C.mut, fontSize: 25, fontFamily: SANS }}>{rotulo}</div>
    </div>
  );
};

const Barra: React.FC<{ frame: number; ini: number; larguraAlvo: number; grad: string; rotulo: string; valor: string; delayTexto: number }> = ({ frame, ini, larguraAlvo, grad, rotulo, valor, delayTexto }) => {
  const w = interpolate(frame, [ini, ini + 34], [0, larguraAlvo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opTexto = interpolate(frame, [ini + delayTexto, ini + delayTexto + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 300, textAlign: "right", color: C.texto, fontSize: 27, fontFamily: SANS, fontWeight: 600 }}>{rotulo}</div>
      <div style={{ flex: 1, height: 46, background: "rgba(255,255,255,.05)", borderRadius: 10, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${w}%`, background: grad, borderRadius: 10 }} />
      </div>
      <div style={{ width: 300, color: C.texto, fontSize: 27, fontFamily: SANS, fontWeight: 700, opacity: opTexto }}>{valor}</div>
    </div>
  );
};

const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const titulo = spring({ frame, fps, config: { damping: 200 } });
  const selo = interpolate(frame, [150, 172], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: fundoEscuro, opacity: fade(frame, durationInFrames), justifyContent: "center", padding: "0 130px" }}>
      <div style={{ textAlign: "center", opacity: titulo, transform: `translateY(${interpolate(titulo, [0, 1], [18, 0])}px)`, marginBottom: 44 }}>
        <div style={{ color: C.verdeClaro, fontSize: 22, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 700, fontFamily: SANS }}>Por que vale a pena</div>
        <div style={{ color: C.texto, fontSize: 60, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 12, fontFamily: SANS }}>O escritório sente a diferença</div>
      </div>

      {/* contadores */}
      <div style={{ display: "flex", gap: 26, marginBottom: 54 }}>
        <Tile frame={frame} fps={fps} delay={16} valor={`${conta(frame, 20, 45, 142)}`} rotulo="processos ativos monitorados" />
        <Tile frame={frame} fps={fps} delay={24} valor={`${conta(frame, 28, 45, 8)} min`} rotulo="tempo médio de 1ª resposta" />
        <Tile frame={frame} fps={fps} delay={32} valor={`${conta(frame, 36, 45, 41)}%`} rotulo="conversão em contratos" />
      </div>

      {/* comparação de custo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Barra frame={frame} ini={96} larguraAlvo={100} grad={`linear-gradient(90deg, ${C.ambar}, ${C.vermelho})`} rotulo="Construir do zero" valor="R$ 180k – 350k" delayTexto={30} />
        <Barra frame={frame} ini={116} larguraAlvo={4.5} grad={gradVerde} rotulo="Pronto, com a gente" valor="~ R$ 8,4k / 1º ano" delayTexto={12} />
      </div>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <span
          style={{
            display: "inline-block",
            opacity: selo,
            transform: `scale(${interpolate(selo, [0, 1], [0.8, 1])})`,
            background: gradVerde,
            color: "#fff",
            fontFamily: SANS,
            fontSize: 30,
            fontWeight: 800,
            padding: "12px 30px",
            borderRadius: 999,
          }}
        >
          ~30× mais barato
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Cena;
