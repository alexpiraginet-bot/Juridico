/*
 * Dados do protótipo LexFlow (public/prototipo.html), tipados.
 *
 * O "mundo" do protótipo é congelado em sexta-feira, 10/07/2026:
 * a citação foi publicada dia 09/07, o prazo de contestação vence
 * 31/07 e a agenda mostra a semana de 13 a 17/07. Quando o banco de
 * dados chegar (Fase 2), estes arquivos dão lugar a dados reais.
 */

import type {
  AreaAtendimento,
  Cliente,
  ColunaKanban,
  Compromisso,
  Conversa,
  DetalheProcesso,
  DiaAgenda,
  Intimacao,
  ItemAnalise,
  ItemAtencao,
  Kpi,
  PrazoJudicial,
  Processo,
  Produtividade,
  Rotulo,
} from "./tipos";

/* ---- Escritório ------------------------------------------------------ */

export const usuario = {
  nome: "Dr. Gustavo Shimabuco",
  cargo: "Sócio · OAB/ES 12.345",
  saudacao: "Bom dia, Dr. Gustavo",
  dataDeHoje: "Sexta-feira, 10 de julho",
};

/* ---- Dashboard ------------------------------------------------------- */

export const kpis: Kpi[] = [
  {
    valor: "12",
    rotulo: "Novos atendimentos (semana)",
    detalhe: "▲ 33% vs. semana anterior",
    tom: "bom",
  },
  { valor: "41%", rotulo: "Conversão em contratos", detalhe: "▲ 5 p.p.", tom: "bom" },
  { valor: "142", rotulo: "Processos ativos", detalhe: "98% monitorados", tom: "bom" },
  {
    valor: "1",
    rotulo: "Prazo pendente de validação",
    detalhe: "exige ação hoje",
    tom: "ruim",
    valorDestaque: true,
  },
  {
    valor: "8 min",
    rotulo: "Tempo médio de 1ª resposta",
    detalhe: "▼ era 3h antes do sistema",
    tom: "bom",
  },
];

export const exigeAtencao: ItemAtencao[] = [
  {
    selo: { texto: "PRAZO", tom: "vermelho" },
    titulo: "Contestação — Proc. 0801234-55",
    detalhe: "IA sugeriu vencimento 31/07 · aguardando sua validação",
    acao: "Validar",
    primaria: true,
    href: "/intimacoes",
  },
  {
    selo: { texto: "DOCS", tom: "ambar" },
    titulo: "Maria Santos — Trabalhista",
    detalhe: "3 documentos pendentes há 2 dias · cobrar via WhatsApp",
    acao: "Abrir",
    href: "/atendimentos",
  },
  {
    selo: { texto: "NOVA", tom: "azul" },
    titulo: "2 intimações capturadas do DJEN hoje",
    detalhe: "vinculadas automaticamente aos processos",
    acao: "Ver",
    href: "/intimacoes",
  },
];

export const atendimentosPorArea: AreaAtendimento[] = [
  { area: "Trabalhista", quantidade: 18, altura: 120, cor: "bg-verde" },
  { area: "Cível", quantidade: 13, altura: 88, cor: "bg-navy" },
  { area: "Família", quantidade: 9, altura: 60, cor: "bg-[#A8C186]" },
  { area: "Consumidor", quantidade: 6, altura: 38, cor: "bg-[#6E82A0]" },
  { area: "Outros", quantidade: 3, altura: 22, cor: "bg-[#CBD5C0]" },
];

export const compromissos: Compromisso[] = [
  {
    quando: "Seg 13/07 · 09:30",
    titulo: "Audiência de instrução",
    detalhe: "Proc. 0805566-21 (TRT-17)",
    ia: "dossiê de véspera será enviado dom. 20h",
  },
  {
    quando: "Ter 14/07 · 14:00",
    titulo: "Reunião",
    detalhe: "João Pereira (proposta de acordo)",
  },
  {
    quando: "Sex 31/07 · prazo",
    titulo: "Contestação",
    detalhe: "Proc. 0801234-55",
    selo: { texto: "minuta IA pronta p/ revisão", tom: "ambar" },
  },
];

export const produtividade: Produtividade[] = [
  {
    nome: "Dr. Gustavo Shimabuco",
    feito: "9 tarefas concluídas",
    selo: { texto: "2 minutas aprovadas", tom: "verde" },
  },
  {
    nome: "Dr. Carlos Mendes",
    feito: "7 tarefas concluídas",
    selo: { texto: "1 audiência", tom: "verde" },
  },
  {
    nome: "Júlia (estagiária)",
    feito: "12 conferências documentais",
    selo: { texto: "4 atendimentos triados", tom: "azul" },
  },
];

/* ---- Clientes --------------------------------------------------------- */

export const clientes: Cliente[] = [
  {
    id: "c1",
    nome: "Maria Santos",
    cpfCnpj: "111.222.333-44",
    area: "Trabalhista",
    processos: "1 em análise",
    documentos: { texto: "3 pendentes", tom: "ambar" },
    situacao: { texto: "Em negociação", tom: "ambar" },
    responsavel: "Dr. Gustavo",
  },
  {
    id: "c2",
    nome: "João Pereira",
    cpfCnpj: "555.666.777-88",
    area: "Cível",
    processos: "2 ativos",
    documentos: { texto: "completo", tom: "verde" },
    situacao: { texto: "Contratado", tom: "verde" },
    responsavel: "Dr. Carlos",
  },
  {
    id: "c3",
    nome: "Transportes Vitória Ltda.",
    cpfCnpj: "12.345.678/0001-90",
    area: "Trabalhista",
    processos: "6 ativos",
    documentos: { texto: "completo", tom: "verde" },
    situacao: { texto: "Contratado", tom: "verde" },
    responsavel: "Dr. Gustavo",
  },
  {
    id: "c4",
    nome: "Helena Costa",
    cpfCnpj: "999.888.777-66",
    area: "Família",
    processos: "1 ativo",
    documentos: { texto: "completo", tom: "verde" },
    situacao: { texto: "Encerrado", tom: "cinza" },
    responsavel: "Dr. Carlos",
  },
];

/* ---- Processos --------------------------------------------------------- */

export const filtrosProcessos: Rotulo[] = [
  { texto: "Todos (142)", tom: "navy" },
  { texto: "Trabalhista (61)", tom: "cinza" },
  { texto: "Cível (44)", tom: "cinza" },
  { texto: "Família (22)", tom: "cinza" },
  { texto: "Com prazo aberto (7)", tom: "cinza" },
  { texto: "Aguardando sentença (12)", tom: "cinza" },
];

export const processos: Processo[] = [
  {
    id: "p1",
    numero: "0801234-55.2026.8.08.0024",
    cliente: "João Pereira",
    tribunal: "TJES · 3ª Vara Cível",
    fase: { texto: "Conhecimento", tom: "azul" },
    ultimoEvento: { texto: "Citação — contestar até 31/07", tom: "vermelho" },
    destaque: true,
  },
  {
    id: "p2",
    numero: "0805566-21.2026.5.17.0004",
    cliente: "Transportes Vitória",
    tribunal: "TRT-17 · 4ª VT",
    fase: { texto: "Instrução", tom: "azul" },
    ultimoEvento: "Audiência designada 13/07",
  },
  {
    id: "p3",
    numero: "0803344-12.2025.8.08.0035",
    cliente: "Helena Costa",
    tribunal: "TJES · 1ª Vara Família",
    fase: { texto: "Sentença", tom: "verde" },
    ultimoEvento: "Sentença procedente 02/07",
  },
  {
    id: "p4",
    numero: "0808877-90.2025.5.17.0141",
    cliente: "Transportes Vitória",
    tribunal: "TRT-17 · 14ª VT",
    fase: { texto: "Recursal", tom: "cinza" },
    ultimoEvento: "Contrarrazões protocoladas",
  },
];

export const detalheProcesso: DetalheProcesso = {
  numero: "0801234-55.2026.8.08.0024",
  resumo:
    "Ação de cobrança · Valor da causa R$ 85.000 · Cliente no polo passivo · Dr. Gustavo + Dr. Carlos",
  timeline: [
    { quando: "10/07 · IA", texto: "Minuta de contestação gerada, aguardando revisão" },
    {
      quando: "09/07 · DJEN",
      texto: "Citação capturada e vinculada automaticamente · prazo sugerido 31/07",
    },
    {
      quando: "08/07 · WhatsApp",
      texto: "Cliente enviou contrato assinado (PDF classificado pela IA)",
    },
    { quando: "05/07 · Sistema", texto: "Processo importado no onboarding via OAB" },
    { quando: "28/06 · Tribunal", texto: "Distribuição por sorteio · 3ª Vara Cível de Vitória" },
  ],
};

/* ---- Intimações --------------------------------------------------------- */

export const intimacoes: Intimacao[] = [
  {
    id: "i1",
    data: "09/07",
    processo: "0801234-55 · João Pereira",
    tipo: { texto: "Citação", tom: "vermelho" },
    status: { texto: "prazo a validar", tom: "ambar" },
    principal: true,
  },
  {
    id: "i2",
    data: "10/07",
    processo: "0805566-21 · Transportes Vitória",
    tipo: { texto: "Despacho", tom: "azul" },
    status: { texto: "nova", tom: "cinza" },
    aviso: "Intimação de demonstração — mesmo fluxo de análise",
  },
  {
    id: "i3",
    data: "10/07",
    processo: "0803344-12 · Helena Costa",
    tipo: { texto: "Sentença", tom: "verde" },
    status: { texto: "nova", tom: "cinza" },
    aviso: "Intimação de demonstração",
  },
  {
    id: "i4",
    data: "08/07",
    processo: "não vinculada",
    naoVinculada: true,
    tipo: { texto: "Edital", tom: "cinza" },
    status: { texto: "conferência manual", tom: "ambar" },
    aviso: "Publicações sem vínculo automático caem na fila de conferência manual",
  },
];

export const teorPublicacao =
  "PODER JUDICIÁRIO DO ESTADO DO ESPÍRITO SANTO — 3ª VARA CÍVEL DE VITÓRIA. " +
  "Processo nº 0801234-55.2026.8.08.0024. AÇÃO DE COBRANÇA. Autor: Construtora " +
  "Alfa Ltda. Réu: João Pereira. FICA O RÉU CITADO para, querendo, apresentar " +
  "contestação no prazo de 15 (quinze) dias úteis, nos termos do art. 335 do " +
  "CPC, sob pena de revelia…";

export const analiseIntimacao: ItemAnalise[] = [
  {
    titulo: "Resumo",
    texto:
      "Citação do réu João Pereira em ação de cobrança (R$ 85.000) movida por Construtora Alfa. Abre-se prazo para contestação.",
  },
  {
    titulo: "Providência sugerida",
    texto:
      "Elaborar e protocolar contestação. Avaliar preliminar de incompetência territorial (contrato elege foro de Serra/ES).",
  },
  {
    titulo: "Prazo identificado",
    texto: "15 dias úteis · termo inicial 10/07 (1º dia útil após publicação no DJEN, art. 224 CPC) → ",
    destaque: "vencimento sugerido: 31/07/2026",
  },
  {
    titulo: "Fundamento do cálculo",
    texto:
      "Art. 335, III c/c art. 224 CPC · calendário TJES (sem suspensões no período) · motor de prazos v2.4 — cálculo determinístico, não gerado por IA",
  },
  {
    titulo: "Documentos necessários",
    texto: "Contrato (✔ recebido via WhatsApp) · comprovantes de pagamento (✘ solicitar ao cliente)",
  },
  {
    titulo: "Risco apontado",
    texto: "Cliente mencionou na conversa ter pago 3 parcelas — verificar antes de definir a tese.",
  },
];

/* ---- Prazos & agenda ----------------------------------------------------- */

export const agendaSemana: DiaAgenda[] = [
  {
    dia: "SEG 13/07",
    eventos: [
      { texto: "09:30 Audiência instrução · TRT-17", tom: "azul" },
      { texto: "Conferir docs Maria Santos", tom: "verde" },
    ],
  },
  { dia: "TER 14/07", eventos: [{ texto: "14:00 Reunião João Pereira", tom: "azul" }] },
  { dia: "QUA 15/07", eventos: [{ texto: "Revisar minuta contestação (interno)", tom: "ambar" }] },
  { dia: "QUI 16/07", eventos: [] },
  { dia: "SEX 17/07", eventos: [{ texto: "Retorno cliente Helena (sentença)", tom: "verde" }] },
];

export const prazosJudiciais: PrazoJudicial[] = [
  {
    vencimento: "31/07",
    providencia: "Contestação",
    processo: "0801234-55 · João Pereira",
    responsavel: "Dr. Gustavo",
    status: { texto: "pendente de validação", tom: "ambar" },
    alertas: "D-7 · D-2 · véspera · sem minuta",
  },
  {
    vencimento: "05/08",
    providencia: "Contrarrazões de apelação",
    processo: "0808877-90 · Transportes Vitória",
    responsavel: "Dr. Carlos",
    status: { texto: "validado", tom: "verde" },
    alertas: "D-7 · D-2 · véspera",
  },
  {
    vencimento: "12/08",
    providencia: "Manifestação sobre laudo",
    processo: "0805566-21 · Transportes Vitória",
    responsavel: "Dr. Gustavo",
    status: { texto: "validado", tom: "verde" },
    alertas: "D-5 · véspera",
  },
];

/* ---- Tarefas (kanban) ----------------------------------------------------- */

export const colunasKanban: ColunaKanban[] = [
  {
    titulo: "A fazer",
    tarefas: [
      {
        titulo: "Solicitar comprovantes de pagamento",
        detalhe: "Maria Santos · WhatsApp",
        prioridade: { texto: "alta", tom: "ambar" },
      },
      {
        titulo: "Conferência documental",
        detalhe: "Proc. 0801234-55 · fluxo automático",
        prioridade: { texto: "média", tom: "cinza" },
      },
    ],
  },
  {
    titulo: "Em andamento",
    tarefas: [
      {
        titulo: "Revisar minuta de contestação",
        detalhe: "Gerada pela IA · prazo interno 15/07",
        prioridade: { texto: "urgente", tom: "vermelho" },
      },
    ],
  },
  {
    titulo: "Em revisão",
    tarefas: [
      {
        titulo: "Comunicado de sentença ao cliente",
        detalhe: "Helena Costa · aprovação do sócio",
        prioridade: { texto: "média", tom: "cinza" },
      },
    ],
  },
  {
    titulo: "Concluído",
    tarefas: [
      { titulo: "Triagem do atendimento", detalhe: "Maria Santos · IA + Júlia", prioridade: null },
      { titulo: "Cadastro do processo", detalhe: "0801234-55 · importado via OAB", prioridade: null },
    ],
  },
];

/* ---- Atendimentos (WhatsApp) ----------------------------------------------- */

export const conversas: Conversa[] = [
  {
    id: 0,
    nome: "Maria Santos",
    iniciais: "MS",
    contexto: "Trabalhista · Responsável: Dr. Gustavo · Caso #2024-081",
    previa: "Enviei a carteira de trabalho, doutor…",
    horario: "10:42",
    situacao: { texto: "Em negociação", tom: "ambar" },
    mensagens: [
      {
        de: "cliente",
        texto:
          "Bom dia doutor! Trabalhei 4 anos na empresa e fui demitida semana passada sem receber nada das horas extras. Fazia muita hora extra, quase todo dia até umas 21h.",
        hora: "09:02",
      },
      {
        de: "escritorio",
        texto:
          "Bom dia, Maria! Sinto muito pela situação. Vamos analisar seu caso. Você tem a carteira de trabalho e os últimos holerites?",
        hora: "09:06",
      },
      {
        de: "cliente",
        texto: "Tenho sim! Enviei a carteira de trabalho, doutor. Os holerites vou procurar hoje à noite.",
        hora: "10:40",
      },
      {
        de: "cliente",
        texto: "📎",
        documento: "carteira_trabalho.pdf · 2,1 MB",
        hora: "10:42",
      },
    ],
    relatoFatico:
      "A cliente laborou na empresa Comércio Beta Ltda. entre jun/2022 e jul/2026, em jornada alegadamente das 8h às 21h, sem pagamento de horas extras. Dispensada sem justa causa em 02/07/2026, afirma não ter recebido verbas rescisórias integrais.",
    linhaDoTempo: [
      { quando: "jun/2022", texto: "Admissão na Comércio Beta Ltda." },
      { quando: "2022–2026", texto: "Jornada até ~21h, HE não pagas (a confirmar)" },
      { quando: "02/07/2026", texto: "Dispensa sem justa causa" },
      { quando: "08/07/2026", texto: "Primeiro contato com o escritório" },
    ],
    checklist: [
      { recebido: true, texto: "Carteira de trabalho (recebida hoje, legível, classificada)" },
      { recebido: false, texto: "Holerites últimos 12 meses" },
      { recebido: false, texto: "Comprovante de rescisão / TRCT" },
      { recebido: false, texto: "Registros de ponto ou testemunhas" },
    ],
    percentualDocs: 25,
    perguntas: [
      "A jornada era registrada em ponto eletrônico?",
      "Havia intervalo de almoço integral?",
      "Recebeu alguma verba na rescisão? Qual valor?",
      "Há colegas que confirmem a jornada?",
    ],
  },
  {
    id: 1,
    nome: "João Pereira",
    iniciais: "JP",
    contexto: "Cível · Responsável: Dr. Carlos · Proc. 0801234-55",
    previa: "Ok, aguardo a proposta de acordo",
    horario: "09:15",
    situacao: { texto: "Contratado", tom: "verde" },
    mensagens: [
      {
        de: "cliente",
        texto:
          "Doutor, recebi uma carta do tribunal falando em cobrança de 85 mil. Mas eu paguei 3 parcelas dessa obra!",
        hora: "08:50",
      },
      {
        de: "escritorio",
        texto:
          "João, recebemos a citação pelo diário oficial também. Fique tranquilo: temos até 31/07 para contestar. Você tem os comprovantes dessas 3 parcelas?",
        hora: "08:58",
      },
      {
        de: "cliente",
        texto: "Tenho os PIX no aplicativo do banco. Mando hoje. Ok, aguardo a proposta de acordo",
        hora: "09:15",
      },
    ],
    relatoFatico:
      "O cliente é réu em ação de cobrança (R$ 85.000) movida por Construtora Alfa Ltda., referente a contrato de empreitada. Alega pagamento parcial de 3 parcelas via PIX, o que pode reduzir substancialmente o débito ou descaracterizar a mora.",
    linhaDoTempo: [
      { quando: "mar/2025", texto: "Contrato de empreitada assinado" },
      { quando: "2025", texto: "Pagamento de 3 parcelas via PIX (a comprovar)" },
      { quando: "28/06/2026", texto: "Distribuição da ação de cobrança" },
      { quando: "09/07/2026", texto: "Citação publicada no DJEN" },
    ],
    checklist: [
      { recebido: true, texto: "Contrato de empreitada (recebido via WhatsApp)" },
      { recebido: false, texto: "Comprovantes PIX das 3 parcelas" },
      { recebido: true, texto: "Citação / publicação DJEN (capturada)" },
    ],
    percentualDocs: 67,
    perguntas: [
      "Datas e valores exatos dos 3 PIX?",
      "Houve aditivo ou renegociação do contrato?",
      "Existe conversa por escrito com a construtora sobre os pagamentos?",
    ],
  },
];

export const conversaNaoTriada = {
  nome: "+55 27 9 8877-1122",
  previa: "Olá, preciso de um advogado para…",
  horario: "08:03",
  situacao: { texto: "Não triado", tom: "cinza" } satisfies Rotulo,
  aviso: "Conversa de demonstração — fluxo idêntico ao das anteriores",
};

/* ---- Minutas ---------------------------------------------------------------- */

export const contextoMinuta = [
  "Intimação de citação (09/07) — DJEN",
  "Capa e partes do Proc. 0801234-55",
  "Contrato enviado pelo cliente via WhatsApp",
  "Relato fático do atendimento (IA)",
  'Modelo "Contestação Cível v3" do escritório',
];

export const minutaContestacao = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 3ª VARA CÍVEL DA COMARCA DE VITÓRIA/ES

Processo nº 0801234-55.2026.8.08.0024

JOÃO PEREIRA, já qualificado nos autos da AÇÃO DE COBRANÇA que lhe move CONSTRUTORA ALFA LTDA., vem, respeitosamente, por seus advogados, com fundamento no art. 335 do CPC, apresentar

CONTESTAÇÃO

pelos fundamentos de fato e de direito a seguir expostos.

I — PRELIMINARMENTE: DA INCOMPETÊNCIA TERRITORIAL
O contrato de empreitada acostado aos autos elege o foro da Comarca de Serra/ES (cláusula 14ª), razão pela qual se requer a remessa dos autos ao juízo competente, nos termos do art. 64 do CPC.

II — DO MÉRITO: DO PAGAMENTO PARCIAL
Ao contrário do alegado na inicial, o Réu adimpliu 3 (três) parcelas do contrato, mediante transferências via PIX [comprovantes — doc. 02, pendente de juntada], o que reduz o débito exequendo em ao menos R$ 31.500,00, impondo-se a revisão do valor cobrado…

[✂ trecho reduzido na demonstração]

III — DOS PEDIDOS
Ante o exposto, requer: (a) o acolhimento da preliminar; (b) no mérito, a improcedência parcial dos pedidos; (c) a produção de todas as provas admitidas.

Nestes termos, pede deferimento.
Vitória/ES, [data].

⚠ NOTA DA IA: os comprovantes PIX ainda não foram recebidos do cliente — a tese do item II depende deles. Verificar antes de protocolar.`;
