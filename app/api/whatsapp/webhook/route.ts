/*
 * Webhook do WhatsApp Business (Meta Cloud API).
 *
 * GET  — handshake de verificação. O Meta chama uma vez, com
 *        ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 *        Devolvemos o challenge se o token bate com WHATSAPP_VERIFY_TOKEN.
 * POST — mensagens recebidas. Validamos a assinatura (HMAC do App Secret)
 *        e gravamos no banco (dedup garante que nada entra duas vezes).
 *
 * Em erro transitório de gravação, responde 503 para a Meta reentregar; a
 * deduplicação torna a repetição segura. Em produção, assinatura é obrigatória
 * e a rota falha fechada se WHATSAPP_APP_SECRET estiver ausente.
 */

import { NextResponse } from "next/server";
import { processarEventoWhatsapp } from "@/lib/whatsapp/receber";
import {
  assinaturaWhatsappConfere,
  assinaturaWhatsappObrigatoria,
} from "@/lib/whatsapp/assinatura";

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

export async function POST(request: Request) {
  // Precisamos do corpo CRU para conferir a assinatura (byte a byte).
  const corpo = await request.text();

  const permitirSemAssinatura = !assinaturaWhatsappObrigatoria();
  if (
    !permitirSemAssinatura &&
    !assinaturaWhatsappConfere(corpo, request.headers.get("x-hub-signature-256"))
  ) {
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
  } catch (erro) {
    console.error("whatsapp.webhook.persistencia_falhou", {
      erro: erro instanceof Error ? erro.message : "erro desconhecido",
    });
    return NextResponse.json(
      { ok: false, gravado: false, retry: true },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }
}
