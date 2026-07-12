/**
 * Cena "Fecho de marca — LexFlow por LEX TECHNOLOGY".
 * Filme: "LexFlow em Movimento".
 *
 * Fecho: o X da LEX assenta com um halo pulsando, o wordmark LexFlow resolve,
 * a tagline reforça o princípio (validação humana) e a autoria + o link da
 * proposta encerram.
 *
 * Técnicas: spring de entrada, halo radial animado, anel de pontos determinístico,
 * gradiente da marca no wordmark, tema.fade().
 * Duração: 150 frames a 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, SANS, gradLex, fundoEscuro, fade, MarcaX } from "../tema";

const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const marca = spring({ frame, fps, config: { damping: 200 } });
  const nome = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const tag = interpolate(frame, [30, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rodape = interpolate(frame, [48, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const link = interpolate(frame, [64, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // halo pulsando atrás do logo
  const pulso = 1 + 0.06 * Math.sin(frame / 10);

  // anel de pontos (posições determinísticas por índice)
  const pontos = Array.from({ length: 12 }, (_, i) => {
    const ang = (i / 12) * Math.PI * 2;
    const brilho = 0.35 + 0.35 * Math.sin(frame / 8 + i);
    return { x: Math.cos(ang) * 200, y: Math.sin(ang) * 200, o: brilho };
  });

  return (
    <AbsoluteFill style={{ background: fundoEscuro, opacity: fade(frame, durationInFrames), alignItems: "center", justifyContent: "center" }}>
      {/* logo + halo + anel */}
      <div style={{ position: "relative", width: 460, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(76,141,255,.28), rgba(139,59,240,.14) 46%, transparent 70%)",
            filter: "blur(18px)",
            opacity: marca,
            transform: `scale(${pulso})`,
          }}
        />
        {pontos.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 7,
              height: 7,
              borderRadius: 999,
              background: gradLex,
              opacity: marca * p.o,
              transform: `translate(${p.x * marca}px, ${p.y * marca}px)`,
            }}
          />
        ))}
        <div style={{ transform: `scale(${interpolate(marca, [0, 1], [0.7, 1])})`, opacity: marca }}>
          <MarcaX tamanho={150} />
        </div>
      </div>

      {/* wordmark */}
      <div
        style={{
          transform: `translateY(${interpolate(nome, [0, 1], [22, 0])}px)`,
          opacity: nome,
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          fontFamily: SANS,
          color: C.texto,
          marginTop: 6,
        }}
      >
        Lex
        <span style={{ background: gradLex, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Flow</span>
      </div>

      {/* tagline */}
      <div style={{ opacity: tag, color: C.mut, fontSize: 30, fontFamily: SANS, marginTop: 14, textAlign: "center" }}>
        Gestão jurídica com IA — sempre com <span style={{ color: C.verdeClaro, fontWeight: 700 }}>validação humana</span>.
      </div>

      {/* link da proposta */}
      <div style={{ opacity: link, color: C.verdeClaro, fontSize: 26, fontFamily: SANS, marginTop: 22, letterSpacing: ".01em" }}>
        juridico-liard.vercel.app/proposta
      </div>

      {/* autoria */}
      <div
        style={{
          opacity: rodape,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 26,
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
    </AbsoluteFill>
  );
};

export default Cena;
