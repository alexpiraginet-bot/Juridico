/*
 * Modelo de domínio do LexFlow.
 *
 * Nesta fase os dados são os do protótipo (public/prototipo.html) e
 * vivem em memória (lib/dados.ts). Muitos campos são textos prontos
 * para exibição — quando o banco de dados chegar, eles passam a ser
 * calculados a partir de dados estruturados.
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

/* ---- Clientes e processos ------------------------------------------- */

export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  area: string;
  processos: string;
  documentos: Rotulo;
  situacao: Rotulo;
  responsavel: string;
}

export interface EventoTimeline {
  quando: string;
  texto: string;
}

export interface Processo {
  id: string;
  numero: string;
  cliente: string;
  tribunal: string;
  fase: Rotulo;
  ultimoEvento: Rotulo | string;
  destaque?: boolean;
}

export interface DetalheProcesso {
  numero: string;
  resumo: string;
  timeline: EventoTimeline[];
}

/* ---- Intimações ------------------------------------------------------ */

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

/* ---- Prazos e agenda ------------------------------------------------- */

export interface EventoAgenda {
  texto: string;
  tom: TomSelo;
}

export interface DiaAgenda {
  dia: string;
  eventos: EventoAgenda[];
}

export interface PrazoJudicial {
  vencimento: string;
  providencia: string;
  processo: string;
  responsavel: string;
  status: Rotulo;
  alertas: string;
}

/* ---- Tarefas (kanban) ------------------------------------------------ */

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

/* ---- Atendimentos (WhatsApp) ----------------------------------------- */

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

/* ---- Minutas ---------------------------------------------------------- */

export interface ItemContexto {
  texto: string;
}

export interface VersaoMinuta {
  rotulo: Rotulo | "ia";
  quando: string;
  descricao: string;
}
