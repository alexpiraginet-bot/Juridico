/*
 * Semente do banco: os dados fictícios do protótipo LexFlow.
 *
 * Rode com `npx prisma db seed`. É idempotente: usa upsert com os
 * campos únicos (CPF/CNPJ e número CNJ), então pode rodar quantas
 * vezes quiser sem duplicar nada.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const bd = new PrismaClient({ adapter });

async function semear() {
  /* ---- Clientes ---- */
  const maria = await bd.cliente.upsert({
    where: { cpfCnpj: "111.222.333-44" },
    update: {},
    create: {
      nome: "Maria Santos",
      cpfCnpj: "111.222.333-44",
      email: "maria.santos@email.com",
      telefone: "(27) 99911-2233",
      cidade: "Vitória/ES",
    },
  });
  const joao = await bd.cliente.upsert({
    where: { cpfCnpj: "555.666.777-88" },
    update: {},
    create: {
      nome: "João Pereira",
      cpfCnpj: "555.666.777-88",
      email: "jpereira@email.com",
      telefone: "(27) 98822-4455",
      cidade: "Vitória/ES",
    },
  });
  const transportes = await bd.cliente.upsert({
    where: { cpfCnpj: "12.345.678/0001-90" },
    update: {},
    create: {
      nome: "Transportes Vitória Ltda.",
      cpfCnpj: "12.345.678/0001-90",
      email: "juridico@transportesvitoria.com.br",
      telefone: "(27) 3322-1100",
      cidade: "Serra/ES",
    },
  });
  const helena = await bd.cliente.upsert({
    where: { cpfCnpj: "999.888.777-66" },
    update: {},
    create: {
      nome: "Helena Costa",
      cpfCnpj: "999.888.777-66",
      email: "helena.costa@email.com",
      telefone: "(27) 99755-6677",
      cidade: "Vila Velha/ES",
    },
  });

  /* ---- Processos ---- */
  const cobranca = await bd.processo.upsert({
    where: { numero: "0801234-55.2026.8.08.0024" },
    update: {},
    create: {
      numero: "0801234-55.2026.8.08.0024",
      titulo: "Ação de cobrança — contrato de empreitada",
      area: "CIVEL",
      tribunal: "TJES · 3ª Vara Cível de Vitória",
      fase: "CONHECIMENTO",
      ultimoEvento: "Citação capturada do DJEN — contestar até 31/07",
      valorCausa: 85_000,
      clienteId: joao.id,
    },
  });
  const trabalhista = await bd.processo.upsert({
    where: { numero: "0805566-21.2026.5.17.0004" },
    update: {},
    create: {
      numero: "0805566-21.2026.5.17.0004",
      titulo: "Reclamação trabalhista — horas extras",
      area: "TRABALHISTA",
      tribunal: "TRT-17 · 4ª Vara do Trabalho",
      fase: "INSTRUCAO",
      ultimoEvento: "Audiência de instrução designada para 13/07",
      valorCausa: 120_000,
      clienteId: transportes.id,
    },
  });
  const divorcio = await bd.processo.upsert({
    where: { numero: "0803344-12.2025.8.08.0035" },
    update: {},
    create: {
      numero: "0803344-12.2025.8.08.0035",
      titulo: "Divórcio litigioso — partilha de bens",
      area: "FAMILIA",
      tribunal: "TJES · 1ª Vara de Família",
      fase: "SENTENCA",
      ultimoEvento: "Sentença procedente publicada em 02/07",
      valorCausa: 350_000,
      clienteId: helena.id,
    },
  });
  const recurso = await bd.processo.upsert({
    where: { numero: "0808877-90.2025.5.17.0141" },
    update: {},
    create: {
      numero: "0808877-90.2025.5.17.0141",
      titulo: "Recurso ordinário — adicional de periculosidade",
      area: "TRABALHISTA",
      tribunal: "TRT-17 · 14ª Vara do Trabalho",
      fase: "RECURSAL",
      ultimoEvento: "Contrarrazões protocoladas",
      valorCausa: 58_000,
      clienteId: transportes.id,
    },
  });

  /* ---- Prazos ---- */
  const prazos = [
    {
      descricao: "Contestação",
      vencimento: new Date("2026-07-31T00:00:00.000Z"),
      responsavel: "Dr. Gustavo",
      validado: false, // sugerido pela IA — aguarda validação humana
      concluido: false,
      processoId: cobranca.id,
    },
    {
      descricao: "Contrarrazões de apelação",
      vencimento: new Date("2026-08-05T00:00:00.000Z"),
      responsavel: "Dr. Carlos",
      validado: true,
      concluido: false,
      processoId: recurso.id,
    },
    {
      descricao: "Manifestação sobre laudo pericial",
      vencimento: new Date("2026-08-12T00:00:00.000Z"),
      responsavel: "Dr. Gustavo",
      validado: true,
      concluido: false,
      processoId: trabalhista.id,
    },
    {
      descricao: "Juntada de procuração",
      vencimento: new Date("2026-07-03T00:00:00.000Z"),
      responsavel: "Júlia",
      validado: true,
      concluido: true,
      processoId: cobranca.id,
    },
    {
      descricao: "Comunicar cliente sobre a sentença",
      vencimento: new Date("2026-07-17T00:00:00.000Z"),
      responsavel: "Dr. Carlos",
      validado: true,
      concluido: false,
      processoId: divorcio.id,
    },
  ];

  for (const prazo of prazos) {
    const existente = await bd.prazo.findFirst({
      where: { processoId: prazo.processoId, descricao: prazo.descricao },
    });
    if (!existente) await bd.prazo.create({ data: prazo });
  }

  const totais = {
    clientes: await bd.cliente.count(),
    processos: await bd.processo.count(),
    prazos: await bd.prazo.count(),
  };
  console.log("Semente aplicada:", totais);
}

semear()
  .catch((erro) => {
    console.error("Erro ao semear o banco:", erro);
    process.exitCode = 1;
  })
  .finally(() => bd.$disconnect());
