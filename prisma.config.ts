// Configuração da linha de comando do Prisma (migrações e seed).
// O dotenv carrega o DATABASE_URL do arquivo .env em desenvolvimento;
// na Vercel a variável já vem do ambiente do projeto.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
