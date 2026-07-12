"use server";

/*
 * Ação do WhatsApp do escritório — o DONO vincula o número de negócio
 * (phone_number_id da Meta) ao seu Team. É a chave do roteamento: o webhook
 * usa esse número para saber de qual escritório é a conversa recebida.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirDono } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

export async function salvarNumeroWhatsapp(dados: FormData) {
  const dono = await exigirDono();
  const bruto = String(dados.get("phoneNumberId") ?? "").trim();
  const phoneNumberId = bruto || null; // vazio = desvincula o número

  let erro: string | null = null;
  try {
    await bd.team.update({
      where: { id: dono.teamId },
      data: { whatsappPhoneNumberId: phoneNumberId },
    });
  } catch (excecao) {
    erro =
      (excecao as { code?: string }).code === "P2002"
        ? "Esse número já está vinculado a outro escritório."
        : "Não foi possível salvar — verifique a conexão com o banco.";
  }

  if (erro) redirect(`/credenciais?erro=${encodeURIComponent(erro)}`);
  await registrarAuditoria({
    usuarioId: dono.id,
    usuarioNome: dono.nome,
    teamId: dono.teamId,
    acao: "whatsapp.numero",
    detalhe: phoneNumberId
      ? `vinculou o número do WhatsApp (${phoneNumberId})`
      : "removeu o número do WhatsApp",
  });
  revalidatePath("/credenciais");
  redirect("/credenciais");
}
