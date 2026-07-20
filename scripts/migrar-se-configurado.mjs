/*
 * Roda migrações como uma etapa explícita, antes da promoção do deployment.
 * Nunca é chamado automaticamente pelo build de preview/produção: isso evita
 * dois builds concorrentes disputarem DDL e impede preview de tocar produção.
 *
 * - Em produção sem banco configurado: falha de propósito, com uma
 *   mensagem clara (criar o banco no painel é pré-requisito).
 * - Em pré-visualizações sem banco: o build segue (as telas de banco
 *   só funcionarão depois que o banco for criado e conectado).
 */

import { execSync } from "node:child_process";

if (process.env.DIRECT_URL || process.env.DATABASE_URL) {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else {
  console.error("✖ DIRECT_URL/DATABASE_URL ausente — migração não executada.");
  process.exit(1);
}
