// Configuração da linha de comando do Prisma (migrações e seed).
// Migrações usam DIRECT_URL (conexão direta ou Supavisor session/5432).
// O runtime serverless usa DATABASE_URL (Supavisor transaction/6543).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
