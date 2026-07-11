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
import { bd } from "@/lib/bd";
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

  // Quem varrer: todas as credenciais ATIVAS cadastradas, cada uma com o
  // seu dono (para marcar as intimações). Se ainda não há nenhuma, cai no
  // ADVOGADO_OAB/UF do ambiente (compatibilidade).
  let alvos: { oab: string; uf: string; usuarioId: string | null }[] = [];
  try {
    const credenciais = await bd.credencialOab.findMany({
      where: { ativa: true },
      select: { numero: true, uf: true, usuarioId: true },
    });
    alvos = credenciais.map((c) => ({ oab: c.numero, uf: c.uf, usuarioId: c.usuarioId }));
  } catch {
    // Sem banco/tabela ainda: seguimos para o fallback do ambiente.
  }

  if (alvos.length === 0) {
    const oab = (process.env.ADVOGADO_OAB ?? "").replace(/\D/g, "");
    const uf = (process.env.ADVOGADO_UF ?? "").toUpperCase();
    if (oab && uf) alvos = [{ oab, uf, usuarioId: null }];
  }

  if (alvos.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        erro: "Nenhuma credencial ativa e nenhum ADVOGADO_OAB definido — nada a varrer.",
      },
      { status: 400 },
    );
  }

  // Uma credencial por vez (dedup no banco garante que não repete).
  const resultados = [];
  for (const alvo of alvos) {
    const r = await importarIntimacoes(alvo.oab, alvo.uf, alvo.usuarioId);
    resultados.push({ oab: alvo.oab, uf: alvo.uf, ...r });
  }

  const novas = resultados.reduce((s, r) => s + ("novas" in r ? r.novas : 0), 0);
  return NextResponse.json({ ok: true, credenciaisVarridas: alvos.length, novas, resultados });
}
