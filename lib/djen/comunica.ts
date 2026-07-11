/*
 * Cliente da API Comunica / DJEN do CNJ — o Diário de Justiça Eletrônico
 * Nacional. É a fonte OFICIAL e gratuita das intimações e comunicações
 * processuais, pesquisável PELA OAB do advogado. É daqui que o sistema
 * puxa "os meus processos" automaticamente.
 *
 * Documentação: https://comunicaapi.pje.jus.br/
 *
 * ATENÇÃO — geobloqueio: o CNJ só aceita requisições vindas do BRASIL.
 * Por isso as rotas que chamam esta função rodam na região de São Paulo
 * da Vercel (gru1). Fora do Brasil, a API responde 403 (CloudFront).
 *
 * O parsing é defensivo (aceita variações de nome de campo) porque a
 * resposta real do CNJ só pode ser inspecionada rodando do Brasil.
 */

import { createHash } from "node:crypto";
import { formatarNumeroCnj } from "@/lib/juris/datajud";

const BASE = "https://comunicaapi.pje.jus.br/api/v1/comunicacao";

export interface ComunicacaoDjen {
  id: string;
  data: string; // AAAA-MM-DD (data de disponibilização)
  tribunal: string;
  tipo: string;
  orgao: string;
  numeroProcesso: string; // já formatado no padrão CNJ
  classe: string;
  resumo: string; // trecho do teor
}

export interface ResultadoDjen {
  total: number;
  comunicacoes: ComunicacaoDjen[];
  processosUnicos: string[];
  erro?: string;
}

type Cru = Record<string, unknown>;

function texto(obj: Cru, ...chaves: string[]): string {
  for (const chave of chaves) {
    const valor = obj[chave];
    if (typeof valor === "string" && valor.trim()) return valor.trim();
    if (typeof valor === "number") return String(valor);
  }
  return "";
}

function resumir(teor: string, limite = 220): string {
  const limpo = teor.replace(/\s+/g, " ").trim();
  return limpo.length > limite ? `${limpo.slice(0, limite)}…` : limpo;
}

// Identificador estável de uma comunicação, para deduplicar na hora de
// salvar: a mesma publicação sempre gera o mesmo id. Preferimos o id/hash
// do próprio DJEN; sem ele, derivamos um do conteúdo.
function estabilizar(...partes: string[]): string {
  return "djen-" + createHash("sha1").update(partes.join("|")).digest("hex").slice(0, 24);
}

interface OpcoesBusca {
  dataInicio?: string; // AAAA-MM-DD
  dataFim?: string;
  itensPorPagina?: number;
  pagina?: number;
}

export async function buscarNoDjen(
  numeroOab: string,
  ufOab: string,
  opcoes: OpcoesBusca = {},
): Promise<ResultadoDjen> {
  const params = new URLSearchParams({
    numeroOab: numeroOab.replace(/\D/g, ""),
    ufOab: ufOab.toUpperCase(),
    pagina: String(opcoes.pagina ?? 1),
    itensPorPagina: String(opcoes.itensPorPagina ?? 30),
  });
  if (opcoes.dataInicio) params.set("dataDisponibilizacaoInicio", opcoes.dataInicio);
  if (opcoes.dataFim) params.set("dataDisponibilizacaoFim", opcoes.dataFim);

  let resposta: Response;
  try {
    resposta = await fetch(`${BASE}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return {
      total: 0,
      comunicacoes: [],
      processosUnicos: [],
      erro: "Não foi possível falar com o DJEN — tente de novo em instantes.",
    };
  }

  if (resposta.status === 403) {
    return {
      total: 0,
      comunicacoes: [],
      processosUnicos: [],
      erro: "O DJEN só aceita acessos do Brasil (403). Esta busca precisa rodar na região São Paulo da Vercel.",
    };
  }
  if (!resposta.ok) {
    return {
      total: 0,
      comunicacoes: [],
      processosUnicos: [],
      erro: `O DJEN respondeu com o código ${resposta.status} — tente novamente em instantes.`,
    };
  }

  let dados: Cru;
  try {
    dados = (await resposta.json()) as Cru;
  } catch {
    return { total: 0, comunicacoes: [], processosUnicos: [], erro: "Resposta inesperada do DJEN." };
  }

  // A API costuma devolver { count, items: [...] }; aceitamos variações.
  const itens = (Array.isArray(dados.items)
    ? dados.items
    : Array.isArray(dados.content)
      ? dados.content
      : Array.isArray((dados.data as Cru)?.items)
        ? (dados.data as { items: unknown[] }).items
        : []) as Cru[];

  const comunicacoes: ComunicacaoDjen[] = itens.map((item) => {
    const numeroCru = texto(item, "numeroprocessocommascara", "numero_processo", "numeroProcesso");
    const numeroProcesso = numeroCru.includes("-") ? numeroCru : formatarNumeroCnj(numeroCru);
    const data = texto(item, "data_disponibilizacao", "dataDisponibilizacao", "datadisponibilizacao");
    const tribunal = texto(item, "siglaTribunal", "siglahtribunal", "sigla_tribunal", "tribunal");
    const tipo = texto(item, "tipoComunicacao", "tipoDocumento", "tipocomunicacao", "tipo");
    const orgao = texto(item, "nomeOrgao", "nomeorgao", "orgao");
    const classe = texto(item, "nomeClasse", "nomeclasse", "classe");
    const resumo = resumir(texto(item, "texto", "teor", "conteudo"));
    const idReal = texto(item, "id", "hash");
    const id = idReal || estabilizar(numeroProcesso, data, tipo, orgao, resumo);
    return { id, data, tribunal, tipo, orgao, numeroProcesso, classe, resumo };
  });

  const processosUnicos = [
    ...new Set(comunicacoes.map((c) => c.numeroProcesso).filter(Boolean)),
  ];

  const total =
    typeof dados.count === "number"
      ? dados.count
      : typeof dados.total === "number"
        ? dados.total
        : comunicacoes.length;

  return { total, comunicacoes, processosUnicos };
}

/*
 * Varre VÁRIAS páginas da OAB — é o que a importação e o backfill
 * histórico usam para trazer tudo, não só a primeira página. Junta as
 * comunicações e remove repetidas pelo id estável.
 */
export async function buscarTudoNoDjen(
  numeroOab: string,
  ufOab: string,
  opcoes: {
    maxPaginas?: number;
    itensPorPagina?: number;
    dataInicio?: string;
    dataFim?: string;
  } = {},
): Promise<ResultadoDjen> {
  const maxPaginas = opcoes.maxPaginas ?? 25;
  const itensPorPagina = opcoes.itensPorPagina ?? 30;
  const acumulado: ComunicacaoDjen[] = [];
  let total = 0;

  for (let pagina = 1; pagina <= maxPaginas; pagina++) {
    const r = await buscarNoDjen(numeroOab, ufOab, {
      pagina,
      itensPorPagina,
      dataInicio: opcoes.dataInicio,
      dataFim: opcoes.dataFim,
    });
    // Erro na 1ª página: propaga. Erro depois de já ter trazido algo:
    // devolve o que deu para não perder o trabalho.
    if (r.erro) {
      if (acumulado.length === 0) return r;
      break;
    }
    acumulado.push(...r.comunicacoes);
    total = r.total || total;
    if (r.comunicacoes.length < itensPorPagina) break; // chegou ao fim
  }

  const vistos = new Set<string>();
  const comunicacoes = acumulado.filter((c) => {
    if (vistos.has(c.id)) return false;
    vistos.add(c.id);
    return true;
  });
  const processosUnicos = [...new Set(comunicacoes.map((c) => c.numeroProcesso).filter(Boolean))];

  return { total: total || comunicacoes.length, comunicacoes, processosUnicos };
}
