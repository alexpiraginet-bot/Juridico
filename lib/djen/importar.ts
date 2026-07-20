/*
 * Núcleo da importação do DJEN — busca tudo pela OAB e grava no banco,
 * sem duplicar. Fica aqui (fora de "use server") porque é usado tanto
 * pelas server actions da tela quanto pela rota do cron diário.
 *
 * A publicação é deduplicada globalmente por `djenId`; o destinatário é
 * deduplicado por (publicação, usuário). Assim, o mesmo ato pode aparecer
 * legitimamente na carteira de várias OABs sem duplicar seu teor.
 */

import { bd } from "@/lib/bd";
import { buscarTudoNoDjen } from "@/lib/djen/comunica";

export type ResultadoImport =
  | { novas: number; recebidas: number; processos: number }
  | { erro: string };

export async function importarIntimacoes(
  numeroOab: string,
  ufOab: string,
  usuarioId?: string | null,
  opcoes: { maxPaginas?: number } = {},
): Promise<ResultadoImport> {
  const oab = numeroOab.replace(/\D/g, "");
  const uf = (ufOab || "").toUpperCase();
  if (!oab) return { erro: "Informe o número da OAB para importar." };

  const r = await buscarTudoNoDjen(oab, uf, { maxPaginas: opcoes.maxPaginas });
  if (r.erro) return { erro: r.erro };

  const dados = r.comunicacoes.map((c) => ({
    djenId: c.id,
    numeroProcesso: c.numeroProcesso,
    tribunal: c.tribunal || null,
    tipo: c.tipo || null,
    orgao: c.orgao || null,
    classe: c.classe || null,
    resumo: c.resumo || null,
    teor: c.teor || null,
    dataDisponibilizacao: c.data || null,
    oab,
    uf,
    usuarioId: usuarioId ?? null,
  }));

  try {
    const novas = await bd.$transaction(async (tx) => {
      const gravadas = await tx.intimacao.createMany({ data: dados, skipDuplicates: true });
      if (!usuarioId || dados.length === 0) return gravadas.count;

      const publicacoes = await tx.intimacao.findMany({
        where: { djenId: { in: dados.map((d) => d.djenId) } },
        select: { id: true, djenId: true },
      });
      const porDjen = new Map(publicacoes.map((p) => [p.djenId, p.id]));
      const vinculos = dados.flatMap((d) => {
        const intimacaoId = porDjen.get(d.djenId);
        return intimacaoId
          ? [{ intimacaoId, usuarioId, oab: d.oab, uf: d.uf }]
          : [];
      });
      const vinculadas = await tx.destinatarioIntimacao.createMany({
        data: vinculos,
        skipDuplicates: true,
      });
      return vinculadas.count;
    });
    return { novas, recebidas: dados.length, processos: r.processosUnicos.length };
  } catch {
    return { erro: "Não foi possível salvar no banco — confira a conexão do banco de dados." };
  }
}
