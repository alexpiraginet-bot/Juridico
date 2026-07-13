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

// Quantos parâmetros o corpo usa = maior índice de {{n}} encontrado.
function contarParametros(corpo: string): number {
  const indices = [...corpo.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map((m) => Number(m[1]));
  return indices.length ? Math.max(...indices) : 0;
}

/*
 * Cadastra um MODELO (template) já aprovado na Meta. O dono registra o nome
 * exato, o idioma e o corpo de referência (com {{1}}, {{2}}… nos parâmetros) —
 * é o que permite disparar mensagens fora da janela de 24h.
 */
export async function salvarModeloWhatsapp(dados: FormData) {
  const dono = await exigirDono();
  const nome = String(dados.get("nome") ?? "").trim().toLowerCase();
  const idioma = (String(dados.get("idioma") ?? "pt_BR").trim() || "pt_BR").replace(/-/g, "_");
  const categoriaBruta = String(dados.get("categoria") ?? "").trim().toUpperCase();
  const categoria = ["UTILITY", "MARKETING", "AUTHENTICATION"].includes(categoriaBruta) ? categoriaBruta : null;
  const corpo = String(dados.get("corpo") ?? "").trim();

  let erro: string | null = null;
  if (!nome) erro = "Informe o nome do modelo (o mesmo aprovado na Meta).";
  else if (!/^[a-z0-9_]+$/.test(nome)) erro = "O nome do modelo deve ter só letras minúsculas, números e _ — igual ao da Meta.";
  else if (!corpo) erro = "Cole o corpo do modelo aprovado.";
  if (erro) redirect(`/credenciais?erro=${encodeURIComponent(erro)}`);

  let erroBanco: string | null = null;
  try {
    await bd.modeloWhatsapp.create({
      data: { teamId: dono.teamId, nome, idioma, categoria, corpo, numParams: contarParametros(corpo) },
    });
  } catch (excecao) {
    erroBanco =
      (excecao as { code?: string }).code === "P2002"
        ? "Já existe um modelo com esse nome e idioma."
        : "Não foi possível salvar — verifique a conexão com o banco.";
  }
  if (erroBanco) redirect(`/credenciais?erro=${encodeURIComponent(erroBanco)}`);

  await registrarAuditoria({
    usuarioId: dono.id,
    usuarioNome: dono.nome,
    teamId: dono.teamId,
    acao: "whatsapp.modelo",
    detalhe: `cadastrou o modelo "${nome}" (${idioma})`,
  });
  revalidatePath("/credenciais");
  redirect("/credenciais");
}

// Remove um modelo (escopado ao Team do dono).
export async function excluirModeloWhatsapp(id: string) {
  const dono = await exigirDono();
  const modelo = await bd.modeloWhatsapp.findFirst({
    where: { id, teamId: dono.teamId },
    select: { nome: true },
  });
  if (modelo) {
    await bd.modeloWhatsapp.delete({ where: { id } });
    await registrarAuditoria({
      usuarioId: dono.id,
      usuarioNome: dono.nome,
      teamId: dono.teamId,
      acao: "whatsapp.modelo",
      detalhe: `removeu o modelo "${modelo.nome}"`,
    });
  }
  revalidatePath("/credenciais");
  redirect("/credenciais");
}
