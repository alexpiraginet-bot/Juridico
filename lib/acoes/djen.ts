"use server";

/*
 * Ações de servidor do DJEN — importar para o banco as comunicações
 * capturadas pela OAB. A busca (lib/djen/comunica.ts) só LÊ o Diário;
 * aqui a gente GRAVA. Guardamos a intimação crua (ainda não vira
 * Processo, que exigiria escolher um Cliente — decisão humana).
 *
 * Deduplicação pelo `djenId`: a mesma publicação nunca entra duas vezes.
 * `createMany` com `skipDuplicates` ignora quem já está lá e devolve
 * quantas eram realmente novas.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { importarIntimacoes } from "@/lib/djen/importar";

// Ação de formulário: importa e volta para /djen com o resultado na URL.
// As intimações ficam com o dono = usuário logado (isolamento).
export async function acaoImportarIntimacoes(dados: FormData) {
  const usuario = await exigirUsuario();
  const oab = String(dados.get("oab") ?? "").replace(/\D/g, "");
  const uf = (String(dados.get("uf") ?? "ES") || "ES").toUpperCase();

  const r = await importarIntimacoes(oab, uf, usuario.id);

  const q = new URLSearchParams({ oab, uf, buscar: "1" });
  if ("erro" in r) {
    q.set("erroImport", r.erro);
  } else {
    q.set("novas", String(r.novas));
    q.set("recebidas", String(r.recebidas));
    await registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      teamId: usuario.teamId,
      acao: "intimacao.importada",
      detalhe: `importou ${r.novas} nova(s) de ${r.recebidas} pela OAB ${oab}/${uf}`,
    });
  }

  revalidatePath("/djen");
  redirect(`/djen?${q.toString()}`);
}

// Abre UMA publicação: salva (se ainda não estiver) e leva para a página
// de detalhe, onde aparece o teor completo e o resumo da IA. Os dados vêm
// nos campos ocultos do formulário do cartão (o teor completo inclusive).
export async function acaoAbrirIntimacao(dados: FormData) {
  const usuario = await exigirUsuario();
  const campo = (nome: string) => {
    const v = String(dados.get(nome) ?? "").trim();
    return v || null;
  };
  const djenId = campo("djenId");
  const numeroProcesso = campo("numeroProcesso") ?? "";
  if (!djenId) redirect("/djen");

  const registro = await bd.intimacao.upsert({
    where: { djenId },
    update: { teor: campo("teor"), resumo: campo("resumo") },
    create: {
      djenId,
      numeroProcesso,
      tribunal: campo("tribunal"),
      tipo: campo("tipo"),
      orgao: campo("orgao"),
      classe: campo("classe"),
      resumo: campo("resumo"),
      teor: campo("teor"),
      dataDisponibilizacao: campo("data"),
      oab: campo("oab"),
      uf: campo("uf"),
      usuarioId: usuario.id,
    },
  });

  redirect(`/intimacoes/${registro.id}`);
}
