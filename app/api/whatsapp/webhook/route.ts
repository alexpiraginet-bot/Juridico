/*
 * Webhook do WhatsApp Business (Meta Cloud API).
 *
 * GET  — handshake de verificação. O Meta chama uma vez, com
 *        ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 *        Devolvemos o challenge se o token bate com WHATSAPP_VERIFY_TOKEN.
 * POST — mensagens recebidas. Validamos a assinatura (HMAC do App Secret)
 *        e gravamos no banco (dedup garante que nada entra duas vezes).
 *
 * Responde 200 mesmo em erro nosso de gravação: o Meta reentrega em cima de
 * 4xx/5xx, e a dedup já protege contra duplicatas. Sem o App Secret, roda em
 * modo aberto (só para testes) — em produção, configure WHATSAPP_APP_SECRET.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processarEventoWhatsapp } from "@/lib/whatsapp/receber";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const modo = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge") ?? "";
  const esperado = process.env.WHATSAPP_VERIFY_TOKEN;

  if (modo === "subscribe" && esperado && token === esperado) {
    // O Meta espera o challenge cru (texto), não JSON.
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("token de verificação inválido", { status: 403 });
}

function assinaturaConfere(corpo: string, cabecalho: string | null): boolean {
  const segredo = process.env.WHATSAPP_APP_SECRET;
  if (!segredo) return true; // sem App Secret: modo aberto (só testes)
  if (!cabecalho) return false;
  const esperada = "sha256=" + createHmac("sha256", segredo).update(corpo).digest("hex");
  const a = Buffer.from(cabecalho);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  // Precisamos do corpo CRU para conferir a assinatura (byte a byte).
  const corpo = await request.text();

  if (!assinaturaConfere(corpo, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ ok: false, erro: "assinatura inválida" }, { status: 401 });
  }

  let evento: unknown;
  try {
    evento = JSON.parse(corpo);
  } catch {
    return NextResponse.json({ ok: false, erro: "payload inválido" }, { status: 400 });
  }

  try {
    const r = await processarEventoWhatsapp(evento);
    return NextResponse.json({ ok: true, ...r });
  } catch {
    // Erro nosso ao gravar: responde 200 para o Meta não reentregar em loop;
    // a dedup cobre uma eventual reentrega quando o banco voltar.
    return NextResponse.json({ ok: true, gravado: false });
  }
}
