/*
 * Dados de exemplo da Fase 1.
 *
 * Servem para construir e testar as telas antes de existir um banco
 * de dados de verdade. Na Fase 2 este arquivo será substituído por
 * consultas ao banco — as telas quase não vão mudar, porque já leem
 * tudo através das funções exportadas aqui.
 */

import type { Cliente, Prazo, Processo } from "./tipos";

export const clientes: Cliente[] = [
  {
    id: "c1",
    nome: "Mariana Duarte",
    cpfCnpj: "111.444.777-35",
    email: "mariana.duarte@email.com",
    telefone: "(11) 98765-4321",
    cidade: "São Paulo/SP",
  },
  {
    id: "c2",
    nome: "Comercial Andrade Ltda.",
    cpfCnpj: "12.345.678/0001-95",
    email: "contato@comercialandrade.com.br",
    telefone: "(11) 3456-7890",
    cidade: "Guarulhos/SP",
  },
  {
    id: "c3",
    nome: "João Pedro Nogueira",
    cpfCnpj: "222.333.444-05",
    email: "jp.nogueira@email.com",
    telefone: "(19) 99123-4567",
    cidade: "Campinas/SP",
  },
  {
    id: "c4",
    nome: "Padaria Bella Massa ME",
    cpfCnpj: "98.765.432/0001-10",
    email: "adm@bellamassa.com.br",
    telefone: "(11) 2233-4455",
    cidade: "São Paulo/SP",
  },
  {
    id: "c5",
    nome: "Renata Figueiredo",
    cpfCnpj: "555.666.777-88",
    email: "renata.fig@email.com",
    telefone: "(13) 98811-2233",
    cidade: "Santos/SP",
  },
];

export const processos: Processo[] = [
  {
    id: "p1",
    numero: "0012345-67.2026.8.26.0100",
    titulo: "Ação de cobrança — contrato de prestação de serviços",
    clienteId: "c2",
    area: "Cível",
    vara: "3ª Vara Cível — Foro Central de São Paulo",
    status: "ativo",
    valorCausa: 85_000,
    aberturaEm: "2026-02-12",
  },
  {
    id: "p2",
    numero: "1000456-78.2025.5.02.0031",
    titulo: "Reclamação trabalhista — verbas rescisórias",
    clienteId: "c4",
    area: "Trabalhista",
    vara: "31ª Vara do Trabalho de São Paulo",
    status: "ativo",
    valorCausa: 42_500,
    aberturaEm: "2025-11-03",
  },
  {
    id: "p3",
    numero: "1502345-89.2026.8.26.0090",
    titulo: "Execução fiscal — ISS exercício 2023",
    clienteId: "c2",
    area: "Tributário",
    vara: "1ª Vara de Execuções Fiscais Municipais de São Paulo",
    status: "suspenso",
    valorCausa: 230_000,
    aberturaEm: "2026-01-20",
  },
  {
    id: "p4",
    numero: "1000789-01.2026.8.26.0002",
    titulo: "Divórcio consensual com partilha de bens",
    clienteId: "c1",
    area: "Família",
    vara: "2ª Vara de Família e Sucessões — Santo Amaro",
    status: "ativo",
    valorCausa: 350_000,
    aberturaEm: "2026-03-18",
  },
  {
    id: "p5",
    numero: "0009876-54.2025.8.26.0114",
    titulo: "Ação de indenização — danos morais e materiais",
    clienteId: "c3",
    area: "Cível",
    vara: "5ª Vara Cível de Campinas",
    status: "encerrado",
    valorCausa: 28_000,
    aberturaEm: "2025-04-02",
  },
  {
    id: "p6",
    numero: "1500321-45.2026.8.26.0562",
    titulo: "Defesa criminal — apropriação indébita",
    clienteId: "c5",
    area: "Criminal",
    vara: "1ª Vara Criminal de Santos",
    status: "ativo",
    valorCausa: 0,
    aberturaEm: "2026-05-27",
  },
  {
    id: "p7",
    numero: "0003210-98.2024.8.26.0100",
    titulo: "Ação revisional de aluguel comercial",
    clienteId: "c4",
    area: "Cível",
    vara: "12ª Vara Cível — Foro Central de São Paulo",
    status: "arquivado",
    valorCausa: 96_000,
    aberturaEm: "2024-08-15",
  },
];

export const prazos: Prazo[] = [
  {
    id: "z1",
    processoId: "p1",
    descricao: "Apresentar réplica à contestação",
    data: "2026-07-14",
    concluido: false,
  },
  {
    id: "z2",
    processoId: "p2",
    descricao: "Audiência de instrução — Fórum Trabalhista Ruy Barbosa",
    data: "2026-07-16",
    concluido: false,
  },
  {
    id: "z3",
    processoId: "p4",
    descricao: "Entregar minuta do acordo de partilha",
    data: "2026-07-22",
    concluido: false,
  },
  {
    id: "z4",
    processoId: "p6",
    descricao: "Prazo para resposta à acusação",
    data: "2026-07-28",
    concluido: false,
  },
  {
    id: "z5",
    processoId: "p1",
    descricao: "Manifestar sobre documentos juntados",
    data: "2026-08-05",
    concluido: false,
  },
  {
    id: "z6",
    processoId: "p3",
    descricao: "Peticionar comprovante de parcelamento",
    data: "2026-08-19",
    concluido: false,
  },
  {
    id: "z7",
    processoId: "p4",
    descricao: "Audiência de conciliação",
    data: "2026-08-28",
    concluido: false,
  },
  {
    id: "z8",
    processoId: "p2",
    descricao: "Juntar cálculos de liquidação",
    data: "2026-07-03",
    concluido: true,
  },
  {
    id: "z9",
    processoId: "p5",
    descricao: "Levantamento de alvará",
    data: "2026-06-10",
    concluido: true,
  },
];

/* ---- Consultas usadas pelas telas ---------------------------------- */

export function clientePorId(id: string): Cliente | undefined {
  return clientes.find((cliente) => cliente.id === id);
}

export function processoPorId(id: string): Processo | undefined {
  return processos.find((processo) => processo.id === id);
}

export function processosDoCliente(clienteId: string): Processo[] {
  return processos.filter((processo) => processo.clienteId === clienteId);
}

/** Prazos ainda não concluídos, do mais próximo para o mais distante. */
export function prazosPendentes(): Prazo[] {
  return prazos
    .filter((prazo) => !prazo.concluido)
    .sort((a, b) => a.data.localeCompare(b.data));
}

export function prazosConcluidos(): Prazo[] {
  return prazos
    .filter((prazo) => prazo.concluido)
    .sort((a, b) => b.data.localeCompare(a.data));
}
