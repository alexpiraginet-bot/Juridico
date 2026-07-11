/*
 * Conexão única com o banco de dados (PrismaClient).
 *
 * Em desenvolvimento o Next.js recarrega os módulos a cada mudança;
 * guardar o cliente em globalThis evita abrir uma conexão nova a cada
 * recarga. O Prisma 7 conversa com o PostgreSQL através do adaptador
 * oficial do driver `pg`.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const escopoGlobal = globalThis as unknown as { prismaGlobal?: PrismaClient };

function criarConexao(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const bd = escopoGlobal.prismaGlobal ?? criarConexao();

if (process.env.NODE_ENV !== "production") {
  escopoGlobal.prismaGlobal = bd;
}
