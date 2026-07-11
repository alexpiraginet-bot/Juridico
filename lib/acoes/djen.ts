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
import { buscarTudoNoDjen } from "@/lib/djen/comunica";

type ResultadoImport = { novas: number; recebidas: number; processos: number } | { erro: string };

// Importa tudo o que a OAB tem no DJEN (todas as páginas — serve também
// de backfill histórico dos processos anteriores).
export async function importarIntimacoes(numeroOab: string, ufOab: string): Promise<ResultadoImport> {
  const oab = numeroOab.replace(/\D/g, "");
  const uf = (ufOab || "").toUpperCase();
  if (!oab) return { erro: "Informe o número da OAB para importar." };

  const r = await buscarTudoNoDjen(oab, uf);
  if (r.erro) return { erro: r.erro };

  const dados = r.comunicacoes.map((c) => ({
    djenId: c.id,
    numeroProcesso: c.numeroProcesso,
    tribunal: c.tribunal || null,
    tipo: c.tipo || null,
    orgao: c.orgao || null,
    classe: c.classe || null,
    resumo: c.resumo || null,
    dataDisponibilizacao: c.data || null,
    oab,
    uf,
  }));

  try {
    const gravadas = await bd.intimacao.createMany({ data: dados, skipDuplicates: true });
    return { novas: gravadas.count, recebidas: dados.length, processos: r.processosUnicos.length };
  } catch {
    return { erro: "Não foi possível salvar no banco — confira a conexão do banco de dados." };
  }
}

// Ação de formulário: importa e volta para /djen com o resultado na URL.
export async function acaoImportarIntimacoes(dados: FormData) {
  const oab = String(dados.get("oab") ?? "").replace(/\D/g, "");
  const uf = (String(dados.get("uf") ?? "ES") || "ES").toUpperCase();

  const r = await importarIntimacoes(oab, uf);

  const q = new URLSearchParams({ oab, uf, buscar: "1" });
  if ("erro" in r) {
    q.set("erroImport", r.erro);
  } else {
    q.set("novas", String(r.novas));
    q.set("recebidas", String(r.recebidas));
  }

  revalidatePath("/djen");
  redirect(`/djen?${q.toString()}`);
}
