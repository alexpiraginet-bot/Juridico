/*
 * Núcleo da importação do DJEN — busca tudo pela OAB e grava no banco,
 * sem duplicar. Fica aqui (fora de "use server") porque é usado tanto
 * pelas server actions da tela quanto pela rota do cron diário.
 *
 * A deduplicação é do banco: `djenId` é único e `createMany` com
 * `skipDuplicates` ignora quem já está lá. Rodar todo dia só acrescenta
 * as publicações novas.
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
): Promise<ResultadoImport> {
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
    teor: c.teor || null,
    dataDisponibilizacao: c.data || null,
    oab,
    uf,
    usuarioId: usuarioId ?? null,
  }));

  try {
    const gravadas = await bd.intimacao.createMany({ data: dados, skipDuplicates: true });
    return { novas: gravadas.count, recebidas: dados.length, processos: r.processosUnicos.length };
  } catch {
    return { erro: "Não foi possível salvar no banco — confira a conexão do banco de dados." };
  }
}
