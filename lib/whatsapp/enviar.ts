/*
 * Envio de mensagens pelo WhatsApp (Meta Cloud API / Graph API).
 *
 * Roda só no servidor (o token é segredo). Degrada com elegância: sem as
 * chaves, devolve `demo: true` e NÃO tenta falar com a rede — a tela usa isso
 * para avisar em vez de quebrar.
 */

import { VERSAO_API } from "@/lib/whatsapp/config";

export type ResultadoEnvio =
  | { ok: true; waMessageId: string | null }
  | { ok: false; erro: string; demo?: boolean };

export async function enviarTextoWhatsapp(
  telefone: string,
  texto: string,
): Promise<ResultadoEnvio> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return {
      ok: false,
      demo: true,
      erro: "WhatsApp não configurado — mensagem não enviada (modo demonstração).",
    };
  }

  const para = telefone.replace(/\D/g, "");
  if (!para) return { ok: false, erro: "Número de destino inválido." };
  if (!texto.trim()) return { ok: false, erro: "Mensagem vazia." };

  try {
    const resposta = await fetch(
      `https://graph.facebook.com/${VERSAO_API}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: para,
          type: "text",
          text: { body: texto },
        }),
      },
    );

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");
      return {
        ok: false,
        erro: `O WhatsApp recusou o envio (${resposta.status}). ${detalhe.slice(0, 200)}`.trim(),
      };
    }

    const dados = (await resposta.json().catch(() => null)) as {
      messages?: { id?: string }[];
    } | null;
    return { ok: true, waMessageId: dados?.messages?.[0]?.id ?? null };
  } catch {
    return { ok: false, erro: "Não foi possível falar com a API do WhatsApp." };
  }
}
