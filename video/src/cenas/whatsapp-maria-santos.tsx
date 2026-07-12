/**
 * Cena "WhatsApp — Maria Santos chega em tempo real" do filme "LexFlow em Movimento".
 *
 * A porta de entrada real do produto: a conversa da cliente surgindo mensagem a
 * mensagem, com indicador de digitação, até anexar a carteira de trabalho — o caso
 * nascendo do WhatsApp. Termina com a barra "✨ IA lendo a conversa…" subindo no
 * rodapé, fazendo a ponte para a próxima cena (a IA assumindo).
 *
 * Ritmo (frames @30fps, duração 230):
 *   12–30  digitando (esquerda)      30  balão CLIENTE · 09:02
 *   78–92  digitando (direita)       92  balão ESCRITÓRIO · 09:06
 *   130    balão CLIENTE · 10:40    150  chip do documento (carteira_trabalho.pdf)
 *   168    a pilha rola para cima   195  barra da IA sobe no rodapé (bridge)
 *   últimos 14 frames: tema.fade()
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, SANS, fade, fundoEscuro, gradVerde, SeloIA } from "../tema";

// ---- marcações de tempo da cena ----
const F_DIG_A: [number, number] = [12, 30]; // digitação da cliente
const F_MSG1 = 30;
const F_DIG_B: [number, number] = [78, 92]; // digitação do escritório
const F_MSG2 = 92;
const F_MSG3 = 130;
const F_DOC = 150;
const F_SCROLL = 168; // a pilha rola para cima
const F_BAR = 195; // a barra da IA sobe

const LARGURA = 660; // largura do cartão
const ALTURA_CORPO = 500; // altura da área de mensagens
const ALTURA_BARRA = 60; // altura da barra da IA

// ---------- reticências animadas (loop por seno, determinístico) ----------
const ReticenciasIA: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, marginLeft: 4 }}>
      {[0, 1, 2].map((i) => {
        const s = (Math.sin(frame * 0.3 - i * 0.9) + 1) / 2;
        return (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: "#d6c9f5",
              opacity: 0.3 + 0.7 * s,
            }}
          />
        );
      })}
    </span>
  );
};

// ---------- ícone de documento (PDF em C.ambar) ----------
const IconeArquivo: React.FC = () => (
  <div
    style={{
      width: 44,
      height: 44,
      borderRadius: 11,
      background: C.ambarSuave,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={22} height={26} viewBox="0 0 24 28" fill="none">
      <path
        d="M4 1.5 h9 l7 7 v16.5 a2.5 2.5 0 0 1 -2.5 2.5 H4 a2.5 2.5 0 0 1 -2.5 -2.5 V4 A2.5 2.5 0 0 1 4 1.5 Z"
        fill={C.ambar}
      />
      <path d="M13 1.5 v7 h7" fill="rgba(255,255,255,.4)" />
      <rect x={6} y={14} width={12} height={2} rx={1} fill="rgba(255,255,255,.92)" />
      <rect x={6} y={18} width={9} height={2} rx={1} fill="rgba(255,255,255,.72)" />
    </svg>
  </div>
);

// ---------- balão de texto ----------
const Balao: React.FC<{
  texto: string;
  hora: string;
  lado: "esq" | "dir";
  aparece: number;
  enviado?: boolean;
}> = ({ texto, hora, lado, aparece, enviado }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ap = spring({ frame: frame - aparece, fps, config: { damping: 200 } });
  const y = interpolate(ap, [0, 1], [18, 0]);
  const esq = lado === "esq";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: esq ? "flex-start" : "flex-end",
        marginTop: 12,
        opacity: ap,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 432,
          background: esq ? C.card : C.verdeSuave,
          color: C.tintaEscura,
          border: esq ? `1px solid ${C.linhaClara}` : "1px solid rgba(127,166,90,.30)",
          borderRadius: esq ? "5px 18px 18px 18px" : "18px 5px 18px 18px",
          boxShadow: "0 1px 1.5px rgba(16,25,40,.10)",
          padding: "10px 14px 7px",
          fontFamily: SANS,
        }}
      >
        <div style={{ fontSize: 18.5, lineHeight: 1.42 }}>{texto}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 5,
            marginTop: 4,
            fontSize: 12.5,
            color: C.mutClaro,
          }}
        >
          <span>{hora}</span>
          {enviado && (
            <span style={{ color: C.azul, fontSize: 13, letterSpacing: "-2px" }}>✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- balão com o documento anexado ----------
const BalaoDocumento: React.FC<{ aparece: number; hora: string }> = ({ aparece, hora }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ap = spring({ frame: frame - aparece, fps, config: { damping: 200 } });
  const y = interpolate(ap, [0, 1], [18, 0]);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginTop: 12,
        opacity: ap,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.linhaClara}`,
          borderRadius: "5px 18px 18px 18px",
          boxShadow: "0 1px 1.5px rgba(16,25,40,.10)",
          padding: "10px 12px 7px",
          fontFamily: SANS,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <IconeArquivo />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 16,
                fontWeight: 600,
                color: C.tintaEscura,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ opacity: 0.55 }}>📎</span>
              <span>carteira_trabalho.pdf</span>
            </div>
            <div style={{ fontSize: 13, color: C.mutClaro, marginTop: 2 }}>PDF · 2,1 MB</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 5,
            marginTop: 6,
            fontSize: 12.5,
            color: C.mutClaro,
          }}
        >
          <span>{hora}</span>
        </div>
      </div>
    </div>
  );
};

// ---------- balão "digitando…" (3 bolinhas pulsando) ----------
const Digitando: React.FC<{ lado: "esq" | "dir"; janela: [number, number] }> = ({
  lado,
  janela,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame: frame - janela[0], fps, config: { damping: 200 } });
  const op = interpolate(
    frame,
    [janela[0], janela[0] + 5, janela[1] - 4, janela[1]],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const y = interpolate(ent, [0, 1], [12, 0]);
  const esq = lado === "esq";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: esq ? "flex-start" : "flex-end",
        marginTop: 12,
        opacity: op,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          background: esq ? C.card : C.verdeSuave,
          border: esq ? `1px solid ${C.linhaClara}` : "1px solid rgba(127,166,90,.30)",
          borderRadius: esq ? "5px 16px 16px 16px" : "16px 5px 16px 16px",
          boxShadow: "0 1px 1.5px rgba(16,25,40,.10)",
          padding: "13px 15px",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => {
          const s = (Math.sin(frame * 0.32 - i * 0.85) + 1) / 2;
          return (
            <span
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background: C.mutClaro,
                opacity: 0.35 + 0.65 * s,
                transform: `translateY(${-4 * s}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// =====================================================================
const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // entrada do cartão
  const entrada = spring({ frame, fps, config: { damping: 200 } });
  const cardY = interpolate(entrada, [0, 1], [30, 0]);
  const cardEscala = interpolate(entrada, [0, 1], [0.96, 1]);
  const fimEscala = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [1, 0.99],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // rolagem da pilha (a base sobe → mensagens rolam para cima, abrindo espaço p/ a barra da IA)
  const rolagem = frame < F_SCROLL ? 0 : spring({ frame: frame - F_SCROLL, fps, config: { damping: 200 } });
  const baseInferior = interpolate(rolagem, [0, 1], [16, ALTURA_BARRA + 16]);

  // barra da IA subindo no rodapé
  const barP = frame < F_BAR ? 0 : spring({ frame: frame - F_BAR, fps, config: { damping: 200 } });
  const barY = interpolate(barP, [0, 1], [ALTURA_BARRA + 6, 0]);

  // ponto verde "online" respirando
  const pulso = (Math.sin(frame * 0.12) + 1) / 2;

  // varredura de leitura da barra da IA
  const varre = (frame * 3) % 100;

  // Monta a pilha na ordem cronológica; o indicador de digitação ocupa o lugar
  // da próxima mensagem enquanto ela não chegou.
  const filhos: React.ReactNode[] = [];
  if (frame >= F_MSG1) {
    filhos.push(
      <Balao
        key="m1"
        lado="esq"
        aparece={F_MSG1}
        hora="09:02"
        texto="Bom dia doutor! Trabalhei 4 anos na empresa e fui demitida semana passada sem receber nada das horas extras. Fazia muita hora extra, quase todo dia até umas 21h."
      />
    );
  } else if (frame >= F_DIG_A[0]) {
    filhos.push(<Digitando key="dA" lado="esq" janela={F_DIG_A} />);
  }
  if (frame >= F_MSG2) {
    filhos.push(
      <Balao
        key="m2"
        lado="dir"
        aparece={F_MSG2}
        hora="09:06"
        enviado
        texto="Bom dia, Maria! Vamos analisar seu caso. Você tem a carteira de trabalho e os últimos holerites?"
      />
    );
  } else if (frame >= F_DIG_B[0]) {
    filhos.push(<Digitando key="dB" lado="dir" janela={F_DIG_B} />);
  }
  if (frame >= F_MSG3) {
    filhos.push(
      <Balao
        key="m3"
        lado="esq"
        aparece={F_MSG3}
        hora="10:40"
        texto="Enviei a carteira de trabalho, doutor. Os holerites procuro hoje à noite."
      />
    );
  }
  if (frame >= F_DOC) {
    filhos.push(<BalaoDocumento key="doc" aparece={F_DOC} hora="10:40" />);
  }

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
      {/* cartão de chat */}
      <div
        style={{
          width: LARGURA,
          maxWidth: LARGURA,
          background: C.card,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 44px 110px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.05)",
          transform: `translateY(${cardY}px) scale(${cardEscala * fimEscala})`,
          opacity: entrada,
        }}
      >
        {/* cabeçalho */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "15px 22px",
            background: C.card,
            borderBottom: `1px solid ${C.linhaClara}`,
            boxShadow: "0 1px 0 rgba(0,0,0,.03)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              background: gradVerde,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "0.02em",
              boxShadow: "0 3px 8px rgba(78,107,51,.35)",
            }}
          >
            MS
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.tintaEscura, lineHeight: 1.1 }}>
              Maria Santos
            </div>
            <div style={{ fontSize: 14, color: C.mutClaro, marginTop: 3 }}>
              Trabalhista · Caso #2024-081
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background: C.verde,
                boxShadow: `0 0 ${5 + 6 * pulso}px rgba(127,166,90,${0.45 + 0.4 * pulso})`,
              }}
            />
            <span style={{ fontSize: 14, color: C.verdeD, fontWeight: 600 }}>online</span>
          </div>
        </div>

        {/* corpo — área das mensagens */}
        <div
          style={{
            position: "relative",
            height: ALTURA_CORPO,
            overflow: "hidden",
            backgroundColor: C.cremeSuave,
            backgroundImage:
              "radial-gradient(rgba(27,42,65,.035) 1.2px, transparent 1.2px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* pilha de balões, ancorada pela base (o mais novo fica sempre visível) */}
          <div
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              bottom: baseInferior,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {filhos}
          </div>

          {/* barra da IA — sobe no rodapé, ponte para a próxima cena */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: ALTURA_BARRA,
              transform: `translateY(${barY}px)`,
              opacity: barP,
              background: "linear-gradient(180deg, #241b3a 0%, #191228 100%)",
              borderTop: "1px solid rgba(139,111,208,.5)",
              boxShadow: "0 -12px 34px rgba(107,79,168,.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* varredura de "leitura" */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent ${varre - 16}%, rgba(139,111,208,.95) ${varre}%, transparent ${varre + 16}%)`,
              }}
            />
            <SeloIA style={{ fontSize: 20 }}>
              IA lendo a conversa
              <ReticenciasIA />
            </SeloIA>
          </div>
        </div>

        {/* rodapé — pílula de input (decorativa) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "13px 18px",
            background: C.card,
            borderTop: `1px solid ${C.linhaClara}`,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 44,
              borderRadius: 999,
              background: C.cremeSuave,
              border: `1px solid ${C.linhaClara}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              color: C.mutClaro,
              fontSize: 16.5,
            }}
          >
            <span>Mensagem</span>
            <span style={{ opacity: 0.5 }}>📎</span>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: gradVerde,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 3px 8px rgba(78,107,51,.30)",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <path d="M4 4 L20 12 L4 20 L8 12 Z" fill="#fff" />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Cena;
