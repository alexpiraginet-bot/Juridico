/*
 * Roda as migrações do banco antes do build na Vercel — mas só se o
 * DATABASE_URL existir.
 *
 * - Em produção sem banco configurado: falha de propósito, com uma
 *   mensagem clara (criar o banco no painel é pré-requisito).
 * - Em pré-visualizações sem banco: o build segue (as telas de banco
 *   só funcionarão depois que o banco for criado e conectado).
 */

import { execSync } from "node:child_process";

if (process.env.DATABASE_URL) {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else if (process.env.VERCEL_ENV === "production") {
  console.error(
    "✖ DATABASE_URL ausente em produção — no painel da Vercel, crie o banco em Storage e conecte ao projeto.",
  );
  process.exit(1);
} else {
  console.warn(
    "⚠ DATABASE_URL ausente — migrações puladas; as telas de banco ficarão indisponíveis até o banco ser criado.",
  );
}
