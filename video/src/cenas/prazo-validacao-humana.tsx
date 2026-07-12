/**
 * Cena "Prazo — a IA sugere, o humano valida" do filme "LexFlow em Movimento".
 *
 * O coração do produto encenado em um só cartão: a IA propõe uma
 * "Contestação · 31/07/2026" a partir da intimação — mas NADA entra na
 * agenda sem o advogado. O cursor desliza até "Validar prazo", o clique
 * dá a ondinha, um grande check verde se desenha, a pílula de status vira
 * de âmbar ("aguardando validação") para verde ("✓ Validado por Dr.
 * Gustavo") e o botão assume a aparência de concluído. Princípio central:
 * todo conteúdo de IA é sinalizado (selo ✨) e depende de validação humana.
 *
 * Vitrine de técnicas (Remotion 4 / React 19):
 *  - spring(damping 200)                → entrada do cartão + cascata do conteúdo;
 *  - interpolate no trajeto x/y          → o cursor desliza do canto até o botão;
 *  - spring de "press" (scale 1→.94→1)   → o botão afunda e volta com mola;
 *  - anel de pulso (scale+opacity, loop) → ondas de celebração no check;
 *  - SVG stroke-dashoffset                → o grande check verde se desenhando;
 *  - interpolateColors (âmbar→verde)      → pílula e espinha de status trocando;
 *  - gate de frame + crossfade            → troca dos textos "aguardando"→"validado";
 *  - tema.fade()                          → entrada/saída suave da cena.
 *
 * Ritmo (frames @30fps, duração 210):
 *   0–16   cartão entra (spring), conteúdo em cascata
 *   16–90  data assenta (mola + sublinhado) · pílula âmbar pulsa (atenção)
 *   95–120 cursor desliza do canto inferior-direito até "Validar" · botão levanta
 *   120–130 clique: botão scale 1→.94→1 (mola) + ondinha
 *   128–165 grande check verde se desenha (dashoffset) + anéis de pulso
 *   150–175 pílula âmbar→verde (cor + texto) · botão vira "Validado" (desabilitado)
 *   175–210 assenta · tema.fade() na saída
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, SANS, fade, fundoEscuro, gradVerde, SeloIA } from "../tema";

// Sempre "prender" a interpolação nas pontas (sem extrapolar).
const PRESO = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// --- geometria do cartão (coordenadas internas usadas pelo cursor/overlay) ---
const W = 900; // largura do cartão
const H = 640; // altura do cartão
const CENTRO_X = W / 2; // eixo central horizontal (para o check)
const CHECK_CY = 296; // centro vertical do grande check (sobre a data)
// O cartão fica centralizado no palco 1920x1080 → canto superior-esquerdo:
const CARD_X = (1920 - W) / 2; // 510
const CARD_Y = (1080 - H) / 2; // 220

// Comprimento do traço do check (viewBox 0 0 120 120): dois segmentos
// ≈ 24.1 + 49.7 ≈ 73.8; um respiro a mais garante começo vazio e fim cheio.
const CHECK_LEN = 78;

// ---------- glifo de calendário (cabeçalho navy, dia marcado em verde) ----------
const IconeCalendario: React.FC = () => (
  <svg width={78} height={78} viewBox="0 0 64 64" fill="none" style={{ display: "block", flexShrink: 0 }}>
    {/* argolas */}
    <rect x={17} y={6} width={5} height={13} rx={2.5} fill={C.navy} />
    <rect x={42} y={6} width={5} height={13} rx={2.5} fill={C.navy} />
    {/* corpo */}
    <rect x={6} y={12} width={52} height={46} rx={8} fill={C.card} stroke={C.navy} strokeWidth={2.5} />
    {/* faixa do cabeçalho (cantos superiores arredondados) */}
    <path d="M6 26 V20 a8 8 0 0 1 8 -8 H50 a8 8 0 0 1 8 8 V26 Z" fill={C.navy} />
    {/* dias esmaecidos */}
    <rect x={13} y={32} width={9} height={4} rx={2} fill={C.linhaClara} />
    <rect x={27} y={32} width={9} height={4} rx={2} fill={C.linhaClara} />
    <rect x={41} y={32} width={9} height={4} rx={2} fill={C.linhaClara} />
    <rect x={13} y={44} width={9} height={4} rx={2} fill={C.linhaClara} />
    {/* dia marcado (o prazo) */}
    <rect x={27} y={41} width={23} height={11} rx={3} fill={C.verdeSuave} stroke={C.verde} strokeWidth={2} />
  </svg>
);

// ---------- cursor (seta) desenhado em SVG ----------
const Cursor: React.FC = () => (
  <svg width={30} height={34} viewBox="0 0 30 34" style={{ display: "block", filter: "drop-shadow(0 6px 12px rgba(11,18,32,.45))" }}>
    <path
      d="M6 4 L6 27 L12 21.4 L15.7 30 L19.4 28.4 L15.7 20 L24 20 Z"
      fill={C.navy}
      stroke="#fff"
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </svg>
);

// =====================================================================
const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // ---- entrada do cartão (F0–16) ----
  const ent = spring({ frame, fps, config: { damping: 200, mass: 0.9 } });
  const cardY = interpolate(ent, [0, 1], [42, 0]);
  const cardScale = interpolate(ent, [0, 1], [0.94, 1]);

  // ---- cascata do conteúdo (mola por elemento, leve atraso) ----
  const cascata = (atraso: number) =>
    spring({ frame: frame - atraso, fps, config: { damping: 200 } });
  const apHeader = cascata(2);
  const apMain = cascata(8);
  const apSub = cascata(20);
  const apFund = cascata(24);

  // ---- a data assenta (F14+): mola de escala + sublinhado que varre (F22–52) ----
  const dataAssenta = cascata(14);
  const dataScale = interpolate(dataAssenta, [0, 1], [1.05, 1]);
  const dataY = interpolate(dataAssenta, [0, 1], [10, 0]);
  const sublinhado = interpolate(frame, [22, 52], [0, 1], PRESO);

  // ---- pílula âmbar pulsa por atenção (F16–~116) ----
  const envPulso = interpolate(frame, [16, 26, 96, 116], [0, 1, 1, 0], PRESO);
  const pulso = (Math.sin((frame - 16) * 0.17) + 1) / 2; // 0..1
  const glowPulso = envPulso * (0.4 + 0.6 * pulso);

  // ---- transição de validação (âmbar→verde) F150–175 ----
  const validaT = interpolate(frame, [150, 175], [0, 1], PRESO);
  const pillBg = interpolateColors(frame, [150, 175], [C.ambarSuave, C.verdeSuave]);
  const pillTxCor = interpolateColors(frame, [150, 175], [C.ambar, C.verdeD]);
  const pillBorda = interpolateColors(
    frame,
    [150, 175],
    ["rgba(201,138,45,.34)", "rgba(127,166,90,.42)"]
  );
  const espinha = interpolateColors(frame, [150, 175], [C.ambar, C.verde]);
  // pílula cresce ao trocar o texto curto pelo longo
  const pillW = interpolate(frame, [150, 175], [268, 470], PRESO);
  // crossfade dos rótulos da pílula
  const opAguardando = interpolate(frame, [150, 159], [1, 0], PRESO);
  const opValidado = interpolate(frame, [158, 172], [0, 1], PRESO);

  // ---- cursor: desliza do canto inferior-direito até o botão (F95–120) ----
  const cursorP = interpolate(frame, [95, 120], [0, 1], {
    ...PRESO,
    easing: Easing.inOut(Easing.ease),
  });
  const cursorLeft = interpolate(cursorP, [0, 1], [1439, 1212]); // coords do palco
  const cursorTop = interpolate(cursorP, [0, 1], [921, 768]);
  const cursorOp = interpolate(frame, [90, 98, 132, 140], [0, 1, 1, 0], PRESO);

  // ---- botão: levanta no hover, afunda no clique (mola de press) ----
  const hover = interpolate(frame, [110, 118, 126, 133], [0, 1, 1, 0], PRESO);
  const pressDown = interpolate(frame, [120, 123], [0, 1], PRESO);
  const reboundP = frame < 123 ? 0 : spring({ frame: frame - 123, fps, config: { damping: 10, stiffness: 180, mass: 0.7 } });
  const pressScale = 1 - 0.06 * pressDown * (1 - reboundP); // 1 → .94 → volta com mola
  const btnLift = -5 * hover;

  // ---- ondinha (ripple) no clique (F121+) ----
  const rippleP = frame < 121 ? 0 : spring({ frame: frame - 121, fps, config: { damping: 200 } });
  const rippleScale = interpolate(rippleP, [0, 1], [0.25, 1.9]);
  const rippleOp = interpolate(rippleP, [0, 1], [0.5, 0]);

  // ---- botão concluído (aparência desabilitada) ----
  const btnTxCor = interpolateColors(frame, [150, 175], ["#ffffff", C.verdeD]);
  const opLabelValidar = interpolate(frame, [150, 160], [1, 0], PRESO);
  const opLabelFeito = interpolate(frame, [158, 172], [0, 1], PRESO);

  // ---- grande check verde (F128–165) ----
  const checkPop = frame < 128 ? 0 : spring({ frame: frame - 128, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });
  const checkScale = interpolate(checkPop, [0, 1], [0.4, 1]);
  const checkDraw = interpolate(frame, [134, 164], [CHECK_LEN, 0], PRESO); // dashoffset
  const grpIn = interpolate(frame, [128, 144], [0, 1], PRESO);
  const grpOut = interpolate(frame, [172, 190], [1, 0], PRESO); // some ao fim, deixando o estado resolvido
  const checkGrupoOp = grpIn * grpOut;
  const glowCheck = interpolate(frame, [128, 150], [0, 0.9], PRESO) * grpOut;

  // véu claro sobre o conteúdo enquanto o check floresce → o overlay de
  // sucesso fica intencional (a barra de ação abaixo segue visível, para
  // se ver a pílula/botão transicionando ao vivo)
  const veuOp = interpolate(frame, [130, 146, 172, 186], [0, 0.6, 0.6, 0], PRESO);

  // ---- anéis de pulso ao redor do check (loop curto) ----
  const envAneis = interpolate(frame, [128, 142, 168, 182], [0, 1, 1, 0], PRESO);
  const anel = (atraso: number) => {
    const local = frame - 128 - atraso;
    if (local < 0) return { escala: 0.6, op: 0 };
    const periodo = 26;
    const ph = (local % periodo) / periodo;
    return {
      escala: interpolate(ph, [0, 1], [0.55, 1.95]),
      op: interpolate(ph, [0, 1], [0.5, 0], PRESO) * envAneis,
    };
  };
  const anel1 = anel(0);
  const anel2 = anel(13);

  // saída suave: o cartão recua de leve nos últimos frames
  const fimScale = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0.99], PRESO);

  return (
    <AbsoluteFill
      style={{
        background: fundoEscuro,
        opacity: fade(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SANS,
      }}
    >
      {/* ==================== o cartão ==================== */}
      <div
        style={{
          position: "relative",
          width: W,
          height: H,
          background: C.card,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 44px 110px rgba(0,0,0,.52), 0 0 0 1px rgba(255,255,255,.05)",
          transform: `translateY(${cardY}px) scale(${cardScale * fimScale})`,
          opacity: ent,
        }}
      >
        {/* espinha de status à esquerda (âmbar → verde) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: espinha,
          }}
        />

        {/* ---- conteúdo do cartão ---- */}
        <div style={{ position: "absolute", left: 52, right: 48, top: 46 }}>
          {/* cabeçalho: selo de IA + título do cartão */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: apHeader,
              transform: `translateY(${interpolate(apHeader, [0, 1], [12, 0])}px)`,
            }}
          >
            {/* SeloIA adaptado para a superfície clara (roxo mais forte) */}
            <SeloIA
              style={{
                fontSize: 20,
                background: "rgba(107,79,168,.10)",
                color: C.roxoForte,
                border: "1px solid rgba(107,79,168,.32)",
              }}
            >
              Sugerido pela IA a partir da intimação
            </SeloIA>
            <span
              style={{
                fontSize: 13.5,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: C.mutClaro,
              }}
            >
              Prazo sugerido
            </span>
          </div>

          {/* linha principal: rótulo + número do processo */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginTop: 30,
              opacity: apMain,
              transform: `translateY(${interpolate(apMain, [0, 1], [12, 0])}px)`,
            }}
          >
            <span style={{ fontSize: 42, fontWeight: 800, color: C.navy, letterSpacing: "-0.01em" }}>
              Contestação
            </span>
            <span
              style={{
                fontSize: 19,
                fontWeight: 600,
                color: C.mutClaro,
                background: C.creme,
                border: `1px solid ${C.linhaClara}`,
                borderRadius: 9,
                padding: "5px 12px",
              }}
            >
              Proc. 0801234-55
            </span>
          </div>

          {/* bloco de data grande: calendário + 31/07/2026 + sexta-feira */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginTop: 20,
              transform: `translateY(${dataY}px)`,
            }}
          >
            <IconeCalendario />
            <div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: C.navy,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  transform: `scale(${dataScale})`,
                  transformOrigin: "left center",
                }}
              >
                31/07/2026
              </div>
              {/* sublinhado que varre sob a data (cálculo "assentando") */}
              <div
                style={{
                  height: 5,
                  marginTop: 10,
                  width: 320,
                  borderRadius: 999,
                  background: gradVerde,
                  transform: `scaleX(${sublinhado})`,
                  transformOrigin: "left center",
                }}
              />
              <div style={{ fontSize: 22, color: C.mutClaro, marginTop: 12, fontWeight: 500 }}>
                sexta-feira
              </div>
            </div>
          </div>

          {/* sub: parâmetros do cálculo */}
          <div
            style={{
              fontSize: 19,
              color: C.tintaEscura,
              marginTop: 22,
              opacity: apSub * 0.92,
              transform: `translateY(${interpolate(apSub, [0, 1], [10, 0])}px)`,
            }}
          >
            15 dias úteis · termo inicial 10/07 · art. 224 CPC
          </div>

          {/* fundamento: rastreabilidade do motor de prazos */}
          <div
            style={{
              fontSize: 14,
              color: C.mutClaro,
              marginTop: 8,
              opacity: apFund,
              transform: `translateY(${interpolate(apFund, [0, 1], [8, 0])}px)`,
            }}
          >
            Art. 335, III c/c art. 224 CPC · motor de prazos v2.4 · cálculo determinístico e auditável
          </div>
        </div>

        {/* divisória acima da barra de ação */}
        <div style={{ position: "absolute", left: 52, right: 48, bottom: 128, height: 1, background: C.linhaClara }} />

        {/* ---- barra de ação: pílula de status (esq.) + botão (dir.) ---- */}
        <div
          style={{
            position: "absolute",
            left: 52,
            right: 48,
            bottom: 40,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* pílula de status — âmbar "aguardando" → verde "validado" */}
          <div
            style={{
              position: "relative",
              height: 46,
              width: pillW,
              borderRadius: 999,
              background: pillBg,
              border: `1px solid ${pillBorda}`,
              overflow: "hidden",
              boxShadow: `0 0 ${10 + 26 * glowPulso}px rgba(201,138,45,${0.10 + 0.32 * glowPulso}), 0 8px 20px rgba(127,166,90,${0.20 * validaT})`,
              transform: `scale(${1 + 0.02 * glowPulso})`,
            }}
          >
            {/* estado "aguardando validação" */}
            <div
              style={{
                position: "absolute",
                left: 18,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                whiteSpace: "nowrap",
                opacity: opAguardando,
                color: pillTxCor,
                fontSize: 19,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 999,
                  background: C.ambar,
                  opacity: 0.55 + 0.45 * pulso,
                  transform: `scale(${1 + 0.25 * pulso})`,
                }}
              />
              aguardando validação
            </div>
            {/* estado "✓ Validado por Dr. Gustavo · 12/07 10:15" */}
            <div
              style={{
                position: "absolute",
                left: 18,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 9,
                whiteSpace: "nowrap",
                opacity: opValidado,
                color: pillTxCor,
                fontSize: 19,
                fontWeight: 600,
              }}
            >
              <span style={{ color: C.verde, fontWeight: 800 }}>✓</span>
              Validado por Dr. Gustavo · 12/07 10:15
            </div>
          </div>

          {/* botão "Validar prazo" → "✓ Validado" (desabilitado) */}
          <div
            style={{
              position: "relative",
              width: 230,
              height: 64,
              borderRadius: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${btnLift}px) scale(${pressScale})`,
              transformOrigin: "center",
              opacity: interpolate(validaT, [0, 1], [1, 0.92]),
            }}
          >
            {/* preenchimento ativo (gradiente verde) — some ao validar */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 15,
                background: gradVerde,
                opacity: 1 - validaT,
                boxShadow: `0 ${8 + 6 * hover}px ${20 + 12 * hover}px rgba(78,107,51,${(0.34 + 0.16 * hover) * (1 - validaT)})`,
              }}
            />
            {/* preenchimento concluído (suave, desabilitado) — surge ao validar */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 15,
                background: C.verdeSuave,
                border: `1.5px solid ${C.verde}`,
                opacity: validaT,
              }}
            />
            {/* ondinha do clique */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 64,
                height: 64,
                marginLeft: -32,
                marginTop: -32,
                borderRadius: 999,
                background: "rgba(255,255,255,.55)",
                opacity: rippleOp,
                transform: `scale(${rippleScale})`,
              }}
            />
            {/* rótulo "Validar prazo" */}
            <span
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontSize: 20,
                fontWeight: 700,
                color: btnTxCor,
                opacity: opLabelValidar,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5 L10 17.5 L19.5 6.5" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Validar prazo
            </span>
            {/* rótulo "✓ Validado" */}
            <span
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 20,
                fontWeight: 700,
                color: btnTxCor,
                opacity: opLabelFeito,
              }}
            >
              <span style={{ fontWeight: 800 }}>✓</span> Validado
            </span>
          </div>
        </div>

        {/* véu de sucesso sobre o conteúdo (não cobre a barra de ação) */}
        <div
          style={{
            position: "absolute",
            left: 8,
            right: 0,
            top: 0,
            bottom: 132,
            background: "#ffffff",
            opacity: veuOp,
            pointerEvents: "none",
          }}
        />

        {/* ==================== grande check + anéis de pulso ==================== */}
        <div
          style={{
            position: "absolute",
            left: CENTRO_X - 130,
            top: CHECK_CY - 130,
            width: 260,
            height: 260,
            opacity: checkGrupoOp,
            pointerEvents: "none",
          }}
        >
          {/* brilho verde ao fundo */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(127,166,90,.42), rgba(127,166,90,.10) 55%, transparent 72%)",
              opacity: glowCheck,
              transform: `scale(${interpolate(glowCheck, [0, 0.9], [0.7, 1.15])})`,
            }}
          />
          {/* anéis de pulso */}
          {[anel1, anel2].map((a, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 150,
                height: 150,
                marginLeft: -75,
                marginTop: -75,
                borderRadius: "50%",
                border: "3px solid rgba(127,166,90,.8)",
                opacity: a.op,
                transform: `scale(${a.escala})`,
              }}
            />
          ))}
          {/* o check em si (disco verde + traço branco que se desenha) */}
          <svg
            width={210}
            height={210}
            viewBox="0 0 120 120"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              marginLeft: -105,
              marginTop: -105,
              transform: `scale(${checkScale})`,
              filter: `drop-shadow(0 16px 40px rgba(78,107,51,${0.45 * glowCheck}))`,
            }}
          >
            <defs>
              <linearGradient id="prazo-check" x1="16" y1="12" x2="104" y2="108" gradientUnits="userSpaceOnUse">
                <stop stopColor={C.verde} />
                <stop offset="1" stopColor={C.verdeD} />
              </linearGradient>
            </defs>
            <circle cx={60} cy={60} r={52} fill="url(#prazo-check)" />
            <path
              d="M38 62 L54 80 L86 42"
              fill="none"
              stroke="#ffffff"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_LEN}
              strokeDashoffset={checkDraw}
            />
          </svg>
        </div>
      </div>

      {/* ==================== cursor (fora do recorte do cartão) ==================== */}
      <div
        style={{
          position: "absolute",
          left: cursorLeft,
          top: cursorTop,
          opacity: cursorOp,
          zIndex: 5,
        }}
      >
        <Cursor />
      </div>
    </AbsoluteFill>
  );
};

export default Cena;
