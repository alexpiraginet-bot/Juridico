/**
 * Cena "Minuta — a contestação se escreve sozinha (art. 335 CPC)".
 * Filme: "LexFlow em Movimento".
 *
 * Um documento (peça) sobre fundo navy: a IA digita a contestação em tempo
 * real (typewriter por slice do texto), com o selo ✨ "pendente de revisão".
 * No fim, um realce varre a NOTA DA IA ("verificar antes de protocolar") —
 * reforçando o princípio: a IA redige, o advogado decide.
 *
 * Técnicas: typewriter via interpolate+slice, cursor piscando, spring de
 * entrada do card, varredura de realce (gradiente animado), tema.fade().
 * Duração: 250 frames a 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, SANS, SERIF, fundoEscuro, fade, SeloIA } from "../tema";

const PECA = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 3ª VARA CÍVEL DA COMARCA DE VITÓRIA/ES

Processo nº 0801234-55.2026.8.08.0024

JOÃO PEREIRA, já qualificado nos autos, vem, por seus advogados, com fundamento no art. 335 do CPC, apresentar CONTESTAÇÃO, pelos fundamentos de fato e de direito a seguir.

I — PRELIMINARMENTE: DA INCOMPETÊNCIA TERRITORIAL
O contrato elege o foro da Comarca de Serra/ES (cláusula 14ª). Requer-se a remessa dos autos ao juízo competente, nos termos do art. 64 do CPC.

II — DO MÉRITO: DO PAGAMENTO PARCIAL
Ao contrário do alegado, o Réu adimpliu 3 (três) parcelas via PIX, reduzindo o débito em ao menos R$ 31.500,00.`;

const NOTA = "⚠ NOTA DA IA: os comprovantes PIX ainda não foram recebidos do cliente — verificar antes de protocolar.";

const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const entrada = spring({ frame, fps, config: { damping: 200 } });

  // Digitação da peça: F24–F196
  const chars = Math.round(
    interpolate(frame, [24, 196], [0, PECA.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const visivel = PECA.slice(0, chars);
  const digitando = frame >= 24 && chars < PECA.length;
  const cursor = Math.floor(frame / 8) % 2 === 0;

  // Nota da IA: aparece F200, com varredura de realce F206–F236
  const notaAp = spring({ frame: frame - 200, fps, config: { damping: 200 } });
  const varredura = interpolate(frame, [206, 236], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: fundoEscuro,
        opacity: fade(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
      }}
    >
      {/* rótulo da tela */}
      <div
        style={{
          opacity: interpolate(entrada, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(entrada, [0, 1], [-14, 0])}px)`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div style={{ color: C.verdeClaro, fontSize: 22, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, fontFamily: SANS }}>
          ✍️ Minuta assistida por IA
        </div>
        <SeloIA>Gerado por IA — pendente de revisão humana</SeloIA>
      </div>

      {/* o documento (peça) */}
      <div
        style={{
          width: 1180,
          height: 620,
          transform: `translateY(${interpolate(entrada, [0, 1], [40, 0])}px) scale(${interpolate(entrada, [0, 1], [0.96, 1])})`,
          opacity: entrada,
          background: C.card,
          borderRadius: 16,
          boxShadow: "0 40px 90px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06)",
          padding: "46px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 25,
            lineHeight: 1.6,
            color: C.tintaEscura,
            whiteSpace: "pre-wrap",
          }}
        >
          {visivel}
          <span style={{ opacity: digitando && cursor ? 1 : 0, color: C.roxoForte, fontWeight: 700 }}>|</span>
        </div>

        {/* NOTA DA IA fixada no rodapé do documento, com varredura de realce */}
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 40,
            opacity: notaAp,
            transform: `translateY(${interpolate(notaAp, [0, 1], [12, 0])}px)`,
            background: `linear-gradient(90deg, ${C.ambarSuave} ${varredura}%, #fff ${varredura}%)`,
            border: `1px solid ${C.ambar}`,
            borderRadius: 10,
            padding: "14px 18px",
            fontFamily: SANS,
            fontSize: 21,
            color: "#7a5417",
            fontWeight: 600,
          }}
        >
          {NOTA}
        </div>
      </div>

      {/* legenda inferior */}
      <div
        style={{
          marginTop: 26,
          opacity: interpolate(frame, [210, 232], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          color: C.mut,
          fontSize: 27,
          fontFamily: SANS,
          textAlign: "center",
        }}
      >
        A IA redige a peça em segundos. <span style={{ color: C.texto, fontWeight: 700 }}>O protocolo é sempre ato do advogado.</span>
      </div>
    </AbsoluteFill>
  );
};

export default Cena;
