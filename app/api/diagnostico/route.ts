/*
 * Diagnóstico de latência — mede a verdade de dentro da função serverless,
 * que é o que uma auditoria de código (estática) não enxerga: em que região
 * a função rodou, em que região está o banco, e quanto custa um ida-e-volta
 * ao Postgres (primeiro = pode incluir o "cold start" do Neon; os seguintes
 * = já quente).
 *
 * Protegido por login (é preciso estar autenticado) e NÃO devolve nenhum dado
 * do banco — só números de tempo e a região. Abra /api/diagnostico logado.
 */

import { NextResponse } from "next/server";
import { bd } from "@/lib/bd";
import { usuarioAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Extrai só o token de região do host do banco (ex.: "sa-east-1", "us-east-2").
// Nunca expõe usuário/senha — pega apenas o hostname e casa o padrão de região.
function regiaoDoBanco(): string | null {
  try {
    const host = new URL(process.env.DATABASE_URL ?? "").hostname;
    const m = host.match(/([a-z]{2}-[a-z]+-\d)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export async function GET() {
  // Exige login, mas sem redirecionar (é uma API): sessão ausente → 401.
  const u = await usuarioAtual();
  if (!u) {
    return NextResponse.json({ erro: "faça login primeiro para diagnosticar" }, { status: 401 });
  }

  const amostrasMs: number[] = [];
  let erro: string | null = null;
  try {
    // Três idas ao banco: a 1ª pode pagar o cold start do Neon; as demais, quentes.
    for (let i = 0; i < 3; i++) {
      const t = performance.now();
      await bd.$queryRaw`SELECT 1`;
      amostrasMs.push(Math.round(performance.now() - t));
    }
  } catch (e) {
    erro = e instanceof Error ? e.message : "falha ao consultar o banco";
  }

  const regiaoFuncao = process.env.VERCEL_REGION ?? "local";
  const regiaoBanco = regiaoDoBanco();
  const mesmaRegiao =
    regiaoFuncao !== "local" && regiaoBanco
      ? (regiaoFuncao.startsWith("gru") && regiaoBanco.startsWith("sa-east")) ||
        (regiaoFuncao.startsWith("iad") && regiaoBanco.startsWith("us-east"))
      : null;

  return NextResponse.json({
    regiaoFuncao, // gru1 = São Paulo
    regiaoBanco, // sa-east-1 = São Paulo · us-east-* = EUA (longe do gru1)
    bancoCoLocalizado: mesmaRegiao,
    pingBancoMs: amostrasMs, // [1ª ida (pode ter cold start), 2ª, 3ª]
    leitura:
      "1ª alta e as demais baixas = cold start do Neon (banco dormindo). " +
      "Todas altas = banco longe da função (região diferente). " +
      "Todas baixas (~1-20ms) = banco perto: a lentidão está em outro lugar.",
    erro,
  });
}
