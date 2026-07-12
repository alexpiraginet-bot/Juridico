/**
 * Vídeo-demo interno do LexFlow.
 * Abertura de marca → tour das telas → foco na IA (✨ + validação humana) → fecho.
 * As telas são capturas fiéis do protótipo (video/assets), animadas com Remotion.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Telas capturadas do protótipo (a "especificação viva")
import painel from "../assets/01-painel.png";
import atendimentos from "../assets/02-atendimentos.png";
import intimacoes from "../assets/05-intimacoes.png";
import prazos from "../assets/06-prazos.png";
import prazosValidado from "../assets/07-prazos-validado.png";
import minutasAntes from "../assets/09-minutas-antes.png";
import minutasDepois from "../assets/10-minutas-depois.png";

export const FPS = 30;

// Duração de cada cena (em frames). O total alimenta a composição.
const CENAS = {
  abertura: 110,
  sistema: 95,
  painel: 120,
  atendimentos: 145,
  intimacoes: 120,
  prazos: 160,
  minutas: 175,
  focoIA: 160,
  fecho: 135,
};
export const DURACAO_TOTAL = Object.values(CENAS).reduce((a, b) => a + b, 0);

// ---- Paleta (marca LexFlow + LEX TECHNOLOGY) ----
const C = {
  navy0: "#0b1220",
  navy: "#1B2A41",
  navy2: "#243a5a",
  creme: "#F4F3EE",
  verde: "#7FA65A",
  verdeClaro: "#a9cc86",
  lexA: "#4c8dff",
  lexB: "#8b3bf0",
  roxo: "#8b6fd0",
  roxoBg: "rgba(139,111,208,.16)",
  texto: "#eef1f6",
  mut: "#aab6ca",
  linha: "rgba(255,255,255,.10)",
};
const SANS = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const gradLex = `linear-gradient(118deg, ${C.lexA}, ${C.lexB})`;

// ---------- utilidades ----------
const fade = (frame: number, dur: number, dIn = 12, dOut = 14) =>
  interpolate(frame, [0, dIn, dur - dOut, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ---------- marca ----------
const MarcaX: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ display: "block" }}>
    <defs>
      <linearGradient id="lexgrad" x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor={C.lexA} />
        <stop offset="1" stopColor={C.lexB} />
      </linearGradient>
    </defs>
    <path d="M14 8 H34 L86 92 H66 Z" fill="url(#lexgrad)" />
    <path d="M86 8 H66 L14 92 H34 Z" fill="url(#lexgrad)" />
    <path d="M50 40 L58 54 L50 60 L42 54 Z" fill={C.navy0} opacity="0.4" />
  </svg>
);

const Assinatura: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      color: "#8391b4",
      fontSize: 22,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 700,
      fontFamily: SANS,
      ...style,
    }}
  >
    <span style={{ width: 9, height: 9, borderRadius: 999, background: gradLex }} />
    por LEX TECHNOLOGY
  </div>
);

// ---------- fundo persistente ----------
const Fundo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(1200px 700px at 82% -18%, rgba(124,58,237,.28), transparent 60%),
        radial-gradient(900px 620px at 4% 118%, rgba(59,130,246,.24), transparent 55%),
        ${C.navy0}`,
    }}
  />
);

// ---------- moldura de navegador com Ken Burns ----------
const Moldura: React.FC<{ src: string | { src: string }; url: string; troca?: string | { src: string }; frameTroca?: number }> = ({
  src,
  url,
  troca,
  frameTroca,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Zoom suave: começa no enquadramento cheio (1.0 = tela inteira visível) e
  // avança devagar, para não cortar o conteúdo importante da direita (painel de IA).
  const escala = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });
  const subir = interpolate(frame, [0, durationInFrames], [0, -12], {
    extrapolateRight: "clamp",
  });
  const usarTroca = troca && frameTroca !== undefined && frame >= frameTroca;
  const opacTroca = usarTroca
    ? interpolate(frame, [frameTroca!, frameTroca! + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const imagem = (s: string | { src: string }) => (typeof s === "string" ? s : s.src);

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        width: "100%",
        boxShadow: "0 40px 90px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06)",
      }}
    >
      <div
        style={{
          height: 40,
          background: "#101a2c",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 999, background: "#ff5f57" }} />
        <span style={{ width: 12, height: 12, borderRadius: 999, background: "#febc2e" }} />
        <span style={{ width: 12, height: 12, borderRadius: 999, background: "#28c840" }} />
        <div
          style={{
            marginLeft: 16,
            flex: 1,
            maxWidth: 520,
            height: 24,
            borderRadius: 999,
            background: "rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#93a1bd",
            fontSize: 14,
            fontFamily: SANS,
            letterSpacing: ".02em",
          }}
        >
          🔒 {url}
        </div>
      </div>
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "1440 / 900" }}>
        <Img
          src={imagem(src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${escala}) translateY(${subir}px)`,
          }}
        />
        {troca && (
          <Img
            src={imagem(troca)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${escala}) translateY(${subir}px)`,
              opacity: opacTroca,
            }}
          />
        )}
      </div>
    </div>
  );
};

// ---------- painel de legenda (lado esquerdo) ----------
const SeloIA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: C.roxoBg,
      color: "#c9b8f2",
      border: "1px solid rgba(139,111,208,.4)",
      padding: "8px 14px",
      borderRadius: 999,
      fontSize: 21,
      fontWeight: 600,
      fontFamily: SANS,
    }}
  >
    ✨ {children}
  </div>
);

const Legenda: React.FC<{ kicker: string; titulo: string; linha: string; selo?: string }> = ({
  kicker,
  titulo,
  linha,
  selo,
}) => {
  const frame = useCurrentFrame();
  const ent = spring({ frame: frame - 4, fps: FPS, config: { damping: 200 } });
  const y = interpolate(ent, [0, 1], [26, 0]);
  return (
    <div style={{ transform: `translateY(${y}px)`, opacity: ent, maxWidth: 560 }}>
      <div
        style={{
          color: C.verdeClaro,
          fontSize: 22,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 700,
          fontFamily: SANS,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          color: C.texto,
          fontSize: 64,
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "16px 0 0",
          fontFamily: SANS,
        }}
      >
        {titulo}
      </div>
      <div style={{ color: C.mut, fontSize: 29, lineHeight: 1.35, margin: "20px 0 0", fontFamily: SANS }}>
        {linha}
      </div>
      {selo && (
        <div style={{ marginTop: 26 }}>
          <SeloIA>{selo}</SeloIA>
        </div>
      )}
    </div>
  );
};

// Cena de tour: legenda à esquerda, tela à direita
const CenaTela: React.FC<{
  kicker: string;
  titulo: string;
  linha: string;
  selo?: string;
  src: string | { src: string };
  url: string;
  troca?: string | { src: string };
  frameTroca?: number;
}> = ({ kicker, titulo, linha, selo, src, url, troca, frameTroca }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity: fade(frame, durationInFrames), padding: "0 96px", flexDirection: "row", alignItems: "center", gap: 64 }}>
      <div style={{ width: 560, flexShrink: 0 }}>
        <Legenda kicker={kicker} titulo={titulo} linha={linha} selo={selo} />
      </div>
      <div style={{ flex: 1 }}>
        <Moldura src={src} url={url} troca={troca} frameTroca={frameTroca} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Abertura ----------
const Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const marca = spring({ frame, fps: FPS, config: { damping: 200 } });
  const nome = spring({ frame: frame - 12, fps: FPS, config: { damping: 200 } });
  const sub = spring({ frame: frame - 24, fps: FPS, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, durationInFrames), alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 56 }}>
      <div style={{ transform: `scale(${interpolate(marca, [0, 1], [0.7, 1])})`, opacity: marca, filter: "drop-shadow(0 22px 60px rgba(76,141,255,.4))" }}>
        <MarcaX tamanho={230} />
      </div>
      <div>
        <div style={{ opacity: sub, color: "#8aa0c6", fontSize: 25, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700, fontFamily: SANS }}>
          Gestão jurídica com IA
        </div>
        <div style={{ transform: `translateY(${interpolate(nome, [0, 1], [24, 0])}px)`, opacity: nome, fontSize: 132, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, margin: "10px 0 0", fontFamily: SANS, color: C.texto }}>
          Lex
          <span style={{ background: gradLex, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Flow</span>
        </div>
        <div style={{ opacity: sub, marginTop: 30 }}>
          <Assinatura />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- O sistema (módulos) ----------
const Sistema: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const titulo = spring({ frame, fps: FPS, config: { damping: 200 } });
  const modulos = ["Atendimentos", "Intimações", "Prazos", "Minutas IA", "Processos", "Clientes", "Tarefas", "Auditoria"];
  return (
    <AbsoluteFill style={{ opacity: fade(frame, durationInFrames), alignItems: "center", justifyContent: "center", padding: "0 120px" }}>
      <div style={{ textAlign: "center", transform: `translateY(${interpolate(titulo, [0, 1], [22, 0])}px)`, opacity: titulo }}>
        <div style={{ color: C.verdeClaro, fontSize: 22, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 700, fontFamily: SANS }}>
          O sistema
        </div>
        <div style={{ color: C.texto, fontSize: 72, fontWeight: 800, letterSpacing: "-0.02em", margin: "14px 0 0", fontFamily: SANS }}>
          O escritório inteiro em um só lugar
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", maxWidth: 1200, marginTop: 54 }}>
        {modulos.map((m, i) => {
          const ap = spring({ frame: frame - 16 - i * 5, fps: FPS, config: { damping: 200 } });
          return (
            <div
              key={m}
              style={{
                transform: `translateY(${interpolate(ap, [0, 1], [18, 0])}px)`,
                opacity: ap,
                padding: "18px 30px",
                borderRadius: 999,
                background: "rgba(255,255,255,.05)",
                border: `1px solid ${C.linha}`,
                color: C.texto,
                fontSize: 30,
                fontWeight: 600,
                fontFamily: SANS,
              }}
            >
              {m}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Foco na IA ----------
const FocoIA: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = spring({ frame: frame - 6, fps: FPS, config: { damping: 200 } });
  const chips = ["Relato fático do atendimento", "Resumo da intimação", "Minuta da peça"];
  return (
    <AbsoluteFill style={{ opacity: fade(frame, durationInFrames) }}>
      <AbsoluteFill style={{ opacity: 0.14, filter: "blur(6px)", transform: "scale(1.15)" }}>
        <Img src={typeof atendimentos === "string" ? atendimentos : (atendimentos as { src: string }).src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(11,18,32,.72)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 140px", textAlign: "center" }}>
        <div style={{ transform: `translateY(${interpolate(t, [0, 1], [24, 0])}px)`, opacity: t }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
          <div style={{ color: C.texto, fontSize: 78, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.06, fontFamily: SANS }}>
            Toda a IA, sempre com<br />
            <span style={{ background: gradLex, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>validação humana</span>
          </div>
          <div style={{ color: C.mut, fontSize: 31, margin: "26px 0 0", fontFamily: SANS }}>
            Cada sugestão vem marcada com ✨ — quem decide é você.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 50, flexWrap: "wrap", justifyContent: "center" }}>
          {chips.map((c, i) => {
            const ap = spring({ frame: frame - 30 - i * 8, fps: FPS, config: { damping: 200 } });
            return (
              <div
                key={c}
                style={{
                  transform: `translateY(${interpolate(ap, [0, 1], [16, 0])}px)`,
                  opacity: ap,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 26px",
                  borderRadius: 999,
                  background: C.roxoBg,
                  border: "1px solid rgba(139,111,208,.42)",
                  color: "#d6c9f5",
                  fontSize: 27,
                  fontWeight: 600,
                  fontFamily: SANS,
                }}
              >
                ✨ {c}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Fecho ----------
const Fecho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const m = spring({ frame, fps: FPS, config: { damping: 200 } });
  const t = spring({ frame: frame - 12, fps: FPS, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, durationInFrames), alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${interpolate(m, [0, 1], [0.8, 1])})`, opacity: m, filter: "drop-shadow(0 22px 60px rgba(76,141,255,.4))" }}>
        <MarcaX tamanho={120} />
      </div>
      <div style={{ opacity: t, textAlign: "center", marginTop: 24 }}>
        <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.03em", fontFamily: SANS, color: C.texto }}>
          Lex<span style={{ background: gradLex, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Flow</span>
        </div>
        <div style={{ color: C.mut, fontSize: 30, marginTop: 14, fontFamily: SANS }}>
          Fale com Alex Teixeira · WhatsApp (27) 99915-9995
        </div>
        <div style={{ color: C.verdeClaro, fontSize: 27, marginTop: 12, fontFamily: SANS, letterSpacing: ".01em" }}>
          juridico-liard.vercel.app/proposta
        </div>
        <div style={{ marginTop: 34, display: "flex", justifyContent: "center" }}>
          <Assinatura />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- montagem ----------
export const VideoDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.navy0 }}>
      <Fundo />
      <Series>
        <Series.Sequence durationInFrames={CENAS.abertura}>
          <Abertura />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.sistema}>
          <Sistema />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.painel}>
          <CenaTela kicker="Painel" titulo="Tudo do dia num relance" linha="Prazos a validar, intimações novas e a agenda — assim que você entra." src={painel} url="app.lexflow.com.br" />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.atendimentos}>
          <CenaTela
            kicker="Atendimentos"
            titulo="WhatsApp que vira caso"
            linha="A IA lê a conversa e redige o relato fático, a linha do tempo e o checklist de documentos."
            selo="Relato fático gerado por IA"
            src={atendimentos}
            url="app.lexflow.com.br/atendimentos"
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.intimacoes}>
          <CenaTela kicker="Intimações" titulo="Captura automática do DJEN" linha="Todo dia o sistema busca as publicações pela OAB e vincula ao processo certo." src={intimacoes} url="app.lexflow.com.br/intimacoes" />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.prazos}>
          <CenaTela
            kicker="Prazos"
            titulo="A IA sugere, você valida"
            linha="Nenhum prazo entra na agenda sem a confirmação do advogado — com o cálculo auditável à vista."
            selo="Prazo validado por você"
            src={prazos}
            troca={prazosValidado}
            frameTroca={92}
            url="app.lexflow.com.br/prazos"
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.minutas}>
          <CenaTela
            kicker="Minutas"
            titulo="A IA redige, o advogado aprova"
            linha="Com o contexto do caso, a IA monta a peça em segundos. O protocolo é sempre ato seu."
            selo="Gerado por IA — pendente de revisão"
            src={minutasAntes}
            troca={minutasDepois}
            frameTroca={95}
            url="app.lexflow.com.br/minutas"
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.focoIA}>
          <FocoIA />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CENAS.fecho}>
          <Fecho />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
