/*
 * Rota da varredura automática do DJEN — é o que o cron diário da Vercel
 * chama toda manhã. Busca as publicações da OAB e grava as novas no
 * banco (a deduplicação garante que só o que é novo entra).
 *
 * Protegida por segredo: a Vercel manda `Authorization: Bearer CRON_SECRET`
 * quando a variável CRON_SECRET existe. Sem o segredo certo, responde 401
 * — a rota nunca roda aberta.
 *
 * Roda na região São Paulo (gru1) porque o CNJ só aceita acesso do Brasil.
 */

import { NextResponse } from "next/server";
import { importarIntimacoes } from "@/lib/djen/importar";

export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  const autorizacao = request.headers.get("authorization");
  if (!segredo || autorizacao !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const oab = (process.env.ADVOGADO_OAB ?? "").replace(/\D/g, "");
  const uf = (process.env.ADVOGADO_UF ?? "").toUpperCase();
  if (!oab || !uf) {
    return NextResponse.json(
      { ok: false, erro: "Defina ADVOGADO_OAB e ADVOGADO_UF nas variáveis de ambiente." },
      { status: 400 },
    );
  }

  const resultado = await importarIntimacoes(oab, uf);
  if ("erro" in resultado) {
    return NextResponse.json({ ok: false, ...resultado }, { status: 502 });
  }

  // novas = publicações que ainda não estavam no banco (as de hoje).
  return NextResponse.json({ ok: true, oab, uf, ...resultado });
}
