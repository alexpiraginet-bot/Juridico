/**
 * Cena "IA redige o relato fático — palavra a palavra" do filme
 * "LexFlow em Movimento". A cena-herói do princípio central do produto:
 * a IA lê a conversa e ESCREVE o relato fático letra a letra, enquanto a
 * linha do tempo e o checklist de documentos se preenchem — sempre com o
 * selo ✨ e a ressalva de que tudo fica "sujeito à validação do advogado".
 *
 * Duas colunas sobre tema.fundoEscuro:
 *   ESQUERDA (~55%): cartão claro "Relato fático" com SeloIA no topo e a
 *   sublinha em C.roxoForte; corpo escrito por TYPEWRITER com cursor roxo
 *   piscando; rodapé de validação humana (o princípio, tornado gesto).
 *   DIREITA (~45%): em cima a "Linha do tempo" (linha vertical que cresce +
 *   itens escalonados), embaixo os "Documentos" (checklist com o ✔ desenhado
 *   e a barra de progresso enchendo até 25%).
 *
 * Vitrine de técnicas (Remotion 4 / React 19):
 *  - Typewriter por frame: substring via interpolate+round;
 *  - cursor piscante determinístico (frame % 16 < 8), que "para" no fim;
 *  - spring(damping 200) escalonado nos itens da linha do tempo;
 *  - scaleY na linha vertical conectora (transformOrigin top);
 *  - SVG stroke-dasharray/stroke-dashoffset → o ✔ verde se desenhando;
 *  - interpolate na largura da barra de progresso + contador vivo;
 *  - SeloIA / roxoForte / mutClaro do tema; SERIF no corpo do relato;
 *  - pulso final do SeloIA reafirmando o princípio; tema.fade() na saída.
 *
 * Ritmo (frames @30fps, duração 260):
 *   0–14   cartões entram (spring)          18–150  TYPEWRITER do corpo
 *   18–70  linha do tempo cresce (scaleY)   40/58/76/94  itens da linha
 *   120–156 linhas do checklist entram      150–168 o ✔ se desenha
 *   150–185 barra 0%→25% + contador         180     rodapé de validação sobe
 *   210–240 cursor para · SeloIA pulsa      últimos 14: tema.fade()
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
import { C, SANS, SERIF, fade, fundoEscuro, gradVerde, SeloIA } from "../tema";

// Sempre "prender" a interpolação nas pontas.
const PRESO = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Corpo do relato — texto EXATO, escrito letra a letra entre F18 e F150.
const RELATO =
  "A cliente laborou na empresa Comércio Beta Ltda. entre jun/2022 e jul/2026, " +
  "em jornada alegadamente das 8h às 21h, sem pagamento de horas extras. " +
  "Dispensada sem justa causa em 02/07/2026, afirma não ter recebido verbas " +
  "rescisórias integrais.";

// ---- linha do tempo (reconstruída a partir da conversa) ----
type ItemLinha = { at: number; cor: string; data: string; texto: string; nota?: string };
const LINHA: ItemLinha[] = [
  { at: 40, cor: C.navy, data: "jun/2022", texto: "Admissão na Comércio Beta Ltda." },
  {
    at: 58,
    cor: C.ambar,
    data: "2022–2026",
    texto: "Jornada até ~21h, HE não pagas",
    nota: "(a confirmar)",
  },
  { at: 76, cor: C.vermelho, data: "02/07/2026", texto: "Dispensa sem justa causa" },
  { at: 94, cor: C.verde, data: "08/07/2026", texto: "Primeiro contato com o escritório" },
];

// ---- checklist de documentos ----
type ItemDoc = { at: number; texto: string; nota?: string; feito: boolean; desenha?: number };
const DOCS: ItemDoc[] = [
  { at: 120, texto: "Carteira de trabalho", nota: "(recebida hoje)", feito: true, desenha: 150 },
  { at: 132, texto: "Holerites últimos 12 meses", feito: false },
  { at: 144, texto: "Comprovante de rescisão / TRCT", feito: false },
  { at: 156, texto: "Registros de ponto ou testemunhas", feito: false },
];

// ======================= ícones (SVG inline, sem assets) =======================
const IconeEscudo: React.FC<{ tam?: number; cor?: string }> = ({ tam = 18, cor = C.roxoForte }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2 L20 5 V11 C20 16.2 16.6 20 12 22 C7.4 20 4 16.2 4 11 V5 Z"
      fill="rgba(107,79,168,.14)"
      stroke={cor}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <path d="M8.5 12 l2.4 2.4 L15.7 9" stroke={cor} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconeRelogio: React.FC = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke={C.roxoForte} strokeWidth={1.8} />
    <path d="M12 7 v5 l3.4 2" stroke={C.roxoForte} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconePasta: React.FC = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6.5 A1.5 1.5 0 0 1 4.5 5 H9 l2 2 h8.5 A1.5 1.5 0 0 1 21 8.5 V17 A1.5 1.5 0 0 1 19.5 18.5 H4.5 A1.5 1.5 0 0 1 3 17 Z"
      stroke={C.verdeD}
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill="rgba(127,166,90,.12)"
    />
  </svg>
);

// ======================= item da linha do tempo =======================
const LinhaItem: React.FC<ItemLinha> = ({ at, cor, data, texto, nota }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ap = spring({ frame: frame - at, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        display: "flex",
        gap: 22,
        marginBottom: 18,
        position: "relative",
        opacity: ap,
        transform: `translateX(${interpolate(ap, [0, 1], [22, 0])}px)`,
      }}
    >
      {/* nó sobre a linha (o anel branco "fura" o traço) */}
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: cor,
          marginTop: 5,
          marginLeft: 8,
          flexShrink: 0,
          boxShadow: `0 0 0 4px ${C.card}, 0 2px 6px ${cor}55`,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.04em",
            color: C.navy,
            textTransform: "uppercase",
          }}
        >
          {data}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 20, color: C.tintaEscura, marginTop: 3, lineHeight: 1.34 }}>
          {texto}
          {nota && <span style={{ color: C.ambar, fontWeight: 700 }}> {nota}</span>}
        </div>
      </div>
    </div>
  );
};

// ======================= marcador ✔ desenhado =======================
const CHECK_LEN = 24; // comprimento aproximado do traço do "✔"
const Marcador: React.FC<{ feito: boolean; desenha: number }> = ({ feito, desenha }) => {
  const frame = useCurrentFrame();
  if (!feito) {
    // pendente (✘): anel apagado com um leve ✕
    return (
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: C.cremeSuave,
          border: `2px solid ${C.linhaClara}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: C.mutClaro,
          fontSize: 14,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 12 12">
          <path d="M3 3 L9 9 M9 3 L3 9" stroke={C.mutClaro} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
        </svg>
      </span>
    );
  }
  const preenche = interpolate(frame, [desenha, desenha + 10], [0, 1], PRESO);
  const traca = interpolate(frame, [desenha, desenha + 18], [CHECK_LEN, 0], PRESO);
  return (
    <span style={{ position: "relative", width: 30, height: 30, flexShrink: 0 }}>
      {/* anel base */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: C.cremeSuave,
          border: `2px solid ${C.linhaClara}`,
        }}
      />
      {/* disco verde que floresce */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: gradVerde,
          opacity: preenche,
          boxShadow: `0 4px 12px rgba(78,107,51,${0.35 * preenche})`,
        }}
      />
      {/* o ✔ se desenhando */}
      <svg width={30} height={30} viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }} fill="none">
        <path
          d="M6 12.5 l3.6 3.6 L18 7"
          stroke="#ffffff"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CHECK_LEN}
          strokeDashoffset={traca}
        />
      </svg>
    </span>
  );
};

// ======================= linha do checklist =======================
const DocItem: React.FC<ItemDoc> = ({ at, texto, nota, feito, desenha = 150 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ap = spring({ frame: frame - at, fps, config: { damping: 200 } });
  const fundo = feito ? interpolate(frame, [desenha, desenha + 12], [0, 1], PRESO) : 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 14px",
        borderRadius: 13,
        background: feito ? `rgba(127,166,90,${0.12 * fundo})` : "transparent",
        opacity: ap,
        transform: `translateX(${interpolate(ap, [0, 1], [20, 0])}px)`,
      }}
    >
      <Marcador feito={feito} desenha={desenha} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 20,
            fontWeight: feito ? 700 : 500,
            color: feito ? C.tintaEscura : C.mutClaro,
          }}
        >
          {texto}
        </span>
        {nota && <span style={{ fontFamily: SANS, fontSize: 16, color: C.verdeD, fontWeight: 600 }}> {nota}</span>}
      </div>
      <span
        style={{
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: feito ? C.verdeD : C.mutClaro,
          opacity: feito ? fundo : 0.7,
        }}
      >
        {feito ? "recebido" : "pendente"}
      </span>
    </div>
  );
};

// ======================= cabeçalho de cartão da direita =======================
const CabecalhoCartao: React.FC<{ icone: React.ReactNode; titulo: string; sub: string }> = ({
  icone,
  titulo,
  sub,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 11,
        background: C.cremeSuave,
        border: `1px solid ${C.linhaClara}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icone}
    </span>
    <div>
      <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 800, color: C.navy, lineHeight: 1.05 }}>
        {titulo}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 15, color: C.mutClaro, marginTop: 2 }}>{sub}</div>
    </div>
  </div>
);

// =====================================================================
const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // --- entrada escalonada dos cartões (F0–14) ---
  const entEsq = spring({ frame, fps, config: { damping: 200 } });
  const entDirA = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const entDirB = spring({ frame: frame - 8, fps, config: { damping: 200 } });

  // --- TYPEWRITER: quantos caracteres já foram escritos (F18–150) ---
  const visiveis = Math.round(interpolate(frame, [18, 150], [0, RELATO.length], PRESO));
  const escrito = RELATO.slice(0, visiveis);

  // --- cursor roxo: pisca (frame % 16 < 8) enquanto escreve; "para" no fim ---
  const pisca = frame % 16 < 8 ? 1 : 0;
  const cursorParado = interpolate(frame, [206, 214], [1, 0], PRESO);
  const cursorOp = frame >= 18 ? pisca * cursorParado : 0;
  const escrevendo = frame >= 18 && frame <= 152;
  const respira = (Math.sin(frame * 0.22) + 1) / 2; // sopro do acento/cursor enquanto escreve

  // --- linha vertical conectora crescendo (F18–70) ---
  const crescerLinha = interpolate(frame, [18, 70], [0, 1], {
    ...PRESO,
    easing: Easing.out(Easing.cubic),
  });

  // --- barra de progresso dos documentos (F150–185) ---
  const larguraPct = interpolate(frame, [150, 185], [0, 25], PRESO);
  const docsFeitos = frame >= 150 ? 1 : 0;
  const rotuloOp = interpolate(frame, [150, 166], [0, 1], PRESO);

  // --- rodapé de validação humana subindo (F180) ---
  const rodape = spring({ frame: frame - 180, fps, config: { damping: 200 } });

  // --- pulso final do SeloIA reafirmando o princípio (F210–240) ---
  const pulso = interpolate(frame, [210, 224, 240], [0, 1, 0], PRESO);
  const escalaSelo = 1 + 0.07 * pulso;
  const glowSelo = `0 0 ${18 * pulso}px rgba(139,111,208,${0.55 * pulso})`;

  const sombraCartao = "0 40px 100px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05)";

  return (
    <AbsoluteFill
      style={{
        background: fundoEscuro,
        opacity: fade(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 1720, height: 860, display: "flex", gap: 44 }}>
        {/* ==================== ESQUERDA · Relato fático ==================== */}
        <div
          style={{
            flex: "55 1 0",
            background: C.card,
            borderRadius: 26,
            boxShadow: sombraCartao,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            opacity: entEsq,
            transform: `translateY(${interpolate(entEsq, [0, 1], [30, 0])}px) scale(${interpolate(
              entEsq,
              [0, 1],
              [0.96, 1]
            )})`,
          }}
        >
          {/* topo: caso · rascunho · título · SeloIA + sublinha de validação */}
          <div style={{ padding: "40px 46px 24px", borderBottom: `1px solid ${C.linhaClara}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: C.mutClaro,
                }}
              >
                Maria Santos · Caso #2024-081
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.ambar,
                  background: C.ambarSuave,
                  border: "1px solid rgba(201,138,45,.35)",
                  borderRadius: 999,
                  padding: "5px 12px",
                }}
              >
                Rascunho
              </span>
            </div>

            <div
              style={{
                fontFamily: SERIF,
                fontSize: 48,
                fontWeight: 700,
                color: C.navy,
                letterSpacing: "-0.01em",
                marginTop: 10,
              }}
            >
              Relato fático
            </div>

            {/* SeloIA (adaptado ao cartão claro) + a ressalva de validação */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 20, flexWrap: "wrap" }}>
              <SeloIA
                style={{
                  background: "rgba(107,79,168,.12)",
                  color: C.roxoForte,
                  border: "1px solid rgba(107,79,168,.4)",
                  fontSize: 20,
                  transform: `scale(${escalaSelo})`,
                  boxShadow: glowSelo,
                }}
              >
                Relato fático gerado por IA
              </SeloIA>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <IconeEscudo />
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 19,
                    fontWeight: 700,
                    color: C.roxoForte,
                    textShadow: pulso > 0 ? `0 0 ${10 * pulso}px rgba(107,79,168,${0.5 * pulso})` : undefined,
                  }}
                >
                  sujeita à validação do advogado
                </span>
              </span>
            </div>
          </div>

          {/* corpo: acento roxo (a IA "escrevendo") + parágrafo por typewriter */}
          <div style={{ flex: 1, display: "flex", gap: 22, padding: "34px 46px 10px" }}>
            <span
              style={{
                width: 4,
                borderRadius: 4,
                background: `linear-gradient(180deg, ${C.roxo}, ${C.roxoForte})`,
                flexShrink: 0,
                alignSelf: "stretch",
                opacity: escrevendo ? 0.65 + 0.35 * respira : 0.35,
                boxShadow: escrevendo ? `0 0 ${10 + 8 * respira}px rgba(139,111,208,.5)` : "none",
              }}
            />
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontSize: 32,
                lineHeight: 1.68,
                color: C.tintaEscura,
                letterSpacing: "0.004em",
              }}
            >
              {escrito}
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 30,
                  verticalAlign: "-4px",
                  marginLeft: 3,
                  borderRadius: 2,
                  background: C.roxo,
                  opacity: cursorOp,
                  boxShadow: escrevendo ? "0 0 10px rgba(139,111,208,.7)" : "none",
                }}
              />
            </p>
          </div>

          {/* rodapé: o princípio virando gesto — validação humana */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 46px",
              borderTop: `1px solid ${C.linhaClara}`,
              background: C.cremeSuave,
              opacity: rodape,
              transform: `translateY(${interpolate(rodape, [0, 1], [24, 0])}px)`,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 999,
                  background: C.ambar,
                  boxShadow: `0 0 ${6 + 6 * respira}px rgba(201,138,45,.6)`,
                }}
              />
              <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 600, color: C.mutClaro }}>
                Aguardando validação
              </span>
            </span>
            <span style={{ display: "inline-flex", gap: 12 }}>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.navy,
                  border: `1.5px solid ${C.linhaClara}`,
                  borderRadius: 11,
                  padding: "10px 20px",
                }}
              >
                Editar
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  background: gradVerde,
                  borderRadius: 11,
                  padding: "10px 22px",
                  boxShadow: "0 6px 16px rgba(78,107,51,.35)",
                }}
              >
                Validar relato
              </span>
            </span>
          </div>
        </div>

        {/* ==================== DIREITA · linha do tempo + documentos ==================== */}
        <div style={{ flex: "45 1 0", display: "flex", flexDirection: "column", gap: 40 }}>
          {/* ---- Linha do tempo ---- */}
          <div
            style={{
              flex: "400 1 0",
              background: C.card,
              borderRadius: 26,
              boxShadow: sombraCartao,
              padding: "30px 34px",
              opacity: entDirA,
              transform: `translateY(${interpolate(entDirA, [0, 1], [30, 0])}px) scale(${interpolate(
                entDirA,
                [0, 1],
                [0.96, 1]
              )})`,
            }}
          >
            <CabecalhoCartao
              icone={<IconeRelogio />}
              titulo="Linha do tempo"
              sub="reconstruída a partir da conversa"
            />
            <div style={{ position: "relative", paddingLeft: 6 }}>
              {/* traço vertical que cresce (scaleY) */}
              <span
                style={{
                  position: "absolute",
                  left: 15,
                  top: 12,
                  bottom: 26,
                  width: 2,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${C.roxo}, ${C.verdeClaro})`,
                  transformOrigin: "top center",
                  transform: `scaleY(${crescerLinha})`,
                }}
              />
              {LINHA.map((it) => (
                <LinhaItem key={it.data} {...it} />
              ))}
            </div>
          </div>

          {/* ---- Documentos ---- */}
          <div
            style={{
              flex: "420 1 0",
              background: C.card,
              borderRadius: 26,
              boxShadow: sombraCartao,
              padding: "30px 34px",
              display: "flex",
              flexDirection: "column",
              opacity: entDirB,
              transform: `translateY(${interpolate(entDirB, [0, 1], [30, 0])}px) scale(${interpolate(
                entDirB,
                [0, 1],
                [0.96, 1]
              )})`,
            }}
          >
            <CabecalhoCartao icone={<IconePasta />} titulo="Documentos" sub="checklist para instruir o caso" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {DOCS.map((d) => (
                <DocItem key={d.texto} {...d} />
              ))}
            </div>

            {/* barra de progresso 0%→25% + contador vivo */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  height: 12,
                  borderRadius: 999,
                  background: C.linhaClara,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${larguraPct}%`,
                    borderRadius: 999,
                    background: gradVerde,
                    boxShadow: "0 0 12px rgba(127,166,90,.5)",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.mutClaro,
                  marginTop: 11,
                  opacity: rotuloOp,
                }}
              >
                <span style={{ color: C.verdeD }}>{Math.round(larguraPct)}%</span> · {docsFeitos} de 4 documentos
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Cena;
