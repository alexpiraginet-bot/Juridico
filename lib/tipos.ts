/*
 * Tipos das telas de demonstração do LexFlow.
 *
 * Desde a Fase 2, clientes, processos e prazos são tabelas de verdade
 * no banco (prisma/schema.prisma) — os tipos deles vêm do cliente
 * gerado em lib/generated/prisma. Aqui ficam apenas os tipos do
 * conteúdo demonstrativo (dashboard, atendimentos, intimações,
 * tarefas e minutas), que vira funcionalidade real nas Fases 4 e 5.
 */

export type TomSelo = "verde" | "ambar" | "vermelho" | "azul" | "cinza" | "navy";

/** Um pedaço de texto com o tom do selo que o acompanha. */
export interface Rotulo {
  texto: string;
  tom: TomSelo;
}

/* ---- Dashboard ------------------------------------------------------ */

export interface Kpi {
  valor: string;
  rotulo: string;
  detalhe: string;
  tom: "bom" | "ruim";
  valorDestaque?: boolean;
}

export interface ItemAtencao {
  selo: Rotulo;
  titulo: string;
  detalhe: string;
  acao: string;
  primaria?: boolean;
  href: string;
}

export interface AreaAtendimento {
  area: string;
  quantidade: number;
  altura: number; // altura da barra no gráfico, em px (protótipo)
  cor: string; // classe Tailwind da cor da barra
}

export interface Compromisso {
  quando: string;
  titulo: string;
  detalhe: string;
  ia?: string; // observação gerada por IA
  selo?: Rotulo;
}

export interface Produtividade {
  nome: string;
  feito: string;
  selo: Rotulo;
}

/* ---- Linha do tempo (usada em várias telas) --------------------------- */

export interface EventoTimeline {
  quando: string;
  texto: string;
}

/* ---- Intimações ------------------------------------------------------- */

export interface Intimacao {
  id: string;
  data: string;
  processo: string;
  naoVinculada?: boolean;
  tipo: Rotulo;
  status: Rotulo;
  principal?: boolean; // a intimação aberta no painel de análise
  aviso?: string; // mensagem exibida ao clicar (demonstração)
}

export interface ItemAnalise {
  titulo: string;
  texto: string;
  destaque?: string; // trecho em negrito ao final
}

/* ---- Tarefas (kanban) -------------------------------------------------- */

export interface Tarefa {
  titulo: string;
  detalhe: string;
  /** null = tarefa concluída (mostra ✓ no lugar da prioridade) */
  prioridade: Rotulo | null;
}

export interface ColunaKanban {
  titulo: string;
  tarefas: Tarefa[];
}

/* ---- Atendimentos (WhatsApp) -------------------------------------------- */

export interface Mensagem {
  de: "cliente" | "escritorio";
  texto: string;
  hora: string;
  documento?: string; // anexo exibido como cartão de documento
  enviadaAgora?: boolean; // mensagens enviadas na demonstração ganham ✓✓
}

export interface ItemChecklist {
  recebido: boolean;
  texto: string;
}

export interface Conversa {
  id: number;
  nome: string;
  iniciais: string;
  contexto: string; // linha abaixo do nome no cabeçalho do chat
  previa: string; // última mensagem, na lista de conversas
  horario: string;
  situacao: Rotulo;
  mensagens: Mensagem[];
  /* Painel de análise da IA */
  relatoFatico: string;
  linhaDoTempo: EventoTimeline[];
  checklist: ItemChecklist[];
  percentualDocs: number;
  perguntas: string[];
}

/* A análise da IA de um atendimento (o painel da direita). */
export interface AnaliseAtendimento {
  relatoFatico: string;
  linhaDoTempo: EventoTimeline[];
  checklist: ItemChecklist[];
  percentualDocs: number;
  perguntas: string[];
}

/*
 * Forma que o painel de Atendimentos consome — serve tanto para as conversas
 * REAIS do WhatsApp (`analiseDemo` nula; a IA preenche sob demanda) quanto para
 * as de demonstração (`analiseDemo` já vem preenchida). Assim a tela não sabe
 * (nem precisa saber) de onde a conversa veio.
 */
export interface ConversaPainel {
  id: string;
  nome: string;
  iniciais: string;
  contexto: string;
  previa: string;
  horario: string;
  situacao: Rotulo;
  telefone: string | null; // presente nas reais (para responder)
  mensagens: Mensagem[];
  analiseDemo: AnaliseAtendimento | null;
  // ISO do fim da janela de 24h (última mensagem do cliente + 24h). Fora dela,
  // o WhatsApp só aceita modelos aprovados. Null quando não se aplica (demo).
  janelaAbertaAte: string | null;
}
