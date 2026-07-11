/*
 * Consulta à API Pública do DataJud — a base nacional de dados do
 * Judiciário mantida pelo CNJ. É a fonte OFICIAL e gratuita de
 * metadados de processos (classe, assuntos, órgão julgador,
 * movimentos) de todos os tribunais do país.
 *
 * Agregadores privados (como o Jusbrasil) bebem dessa mesma água;
 * aqui vamos direto à fonte. Documentação:
 * https://datajud-wiki.cnj.jus.br/api-publica/
 *
 * A chave abaixo é a chave PÚBLICA divulgada na própria documentação
 * do CNJ. Se o CNJ trocá-la (acontece de tempos em tempos), defina a
 * nova em DATAJUD_API_KEY sem mexer no código.
 */

const CHAVE_PUBLICA_CNJ =
  "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

export const TRIBUNAIS: { alias: string; nome: string }[] = [
  { alias: "tjes", nome: "TJES — Justiça Estadual (ES)" },
  { alias: "tjsp", nome: "TJSP — Justiça Estadual (SP)" },
  { alias: "tjrj", nome: "TJRJ — Justiça Estadual (RJ)" },
  { alias: "tjmg", nome: "TJMG — Justiça Estadual (MG)" },
  { alias: "trt17", nome: "TRT-17 — Justiça do Trabalho (ES)" },
  { alias: "trt2", nome: "TRT-2 — Justiça do Trabalho (SP)" },
  { alias: "trf2", nome: "TRF-2 — Justiça Federal (RJ/ES)" },
  { alias: "stj", nome: "STJ — Superior Tribunal de Justiça" },
  { alias: "tst", nome: "TST — Tribunal Superior do Trabalho" },
];

export interface ProcessoPublico {
  numero: string;
  classe: string;
  orgaoJulgador: string;
  grau: string;
  dataAjuizamento: Date | null;
  assuntos: string[];
  ultimoMovimento: { nome: string; data: Date } | null;
}

export interface ResultadoDaConsulta {
  total: number;
  processos: ProcessoPublico[];
  erro?: string;
}

interface FonteDataJud {
  numeroProcesso?: string;
  grau?: string;
  dataAjuizamento?: string;
  classe?: { nome?: string };
  orgaoJulgador?: { nome?: string };
  assuntos?: { nome?: string }[];
  movimentos?: { nome?: string; dataHora?: string }[];
}

interface RespostaDataJud {
  hits?: {
    total?: { value?: number };
    hits?: { _source?: FonteDataJud }[];
  };
}

/** Termo com 14+ dígitos é tratado como número de processo (padrão CNJ). */
function pareceNumeroDeProcesso(termo: string): boolean {
  return termo.replace(/\D/g, "").length >= 14;
}

/** "07084425520238080035" -> "0708442-55.2023.8.08.0035" */
export function formatarNumeroCnj(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length !== 20) return numero;
  return `${digitos.slice(0, 7)}-${digitos.slice(7, 9)}.${digitos.slice(9, 13)}.${digitos.slice(13, 14)}.${digitos.slice(14, 16)}.${digitos.slice(16)}`;
}

export async function consultarDataJud(
  tribunal: string,
  termo: string,
): Promise<ResultadoDaConsulta> {
  const consulta = pareceNumeroDeProcesso(termo)
    ? { match: { numeroProcesso: termo.replace(/\D/g, "") } }
    : {
        multi_match: {
          query: termo,
          fields: ["assuntos.nome", "classe.nome", "orgaoJulgador.nome"],
        },
      };

  try {
    const resposta = await fetch(
      `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunal}/_search`,
      {
        method: "POST",
        headers: {
          Authorization: `APIKey ${process.env.DATAJUD_API_KEY ?? CHAVE_PUBLICA_CNJ}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ size: 10, query: consulta }),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!resposta.ok) {
      return {
        total: 0,
        processos: [],
        erro: `O DataJud respondeu com o código ${resposta.status} — tente novamente em instantes.`,
      };
    }

    const dados = (await resposta.json()) as RespostaDataJud;
    const fontes = dados.hits?.hits ?? [];

    const processos: ProcessoPublico[] = fontes.map(({ _source: fonte }) => {
      const movimentos = Array.isArray(fonte?.movimentos) ? fonte.movimentos : [];
      const maisRecente = movimentos.reduce<{ nome: string; data: Date } | null>(
        (atual, movimento) => {
          if (!movimento?.dataHora || !movimento.nome) return atual;
          const data = new Date(movimento.dataHora);
          return !atual || data > atual.data ? { nome: movimento.nome, data } : atual;
        },
        null,
      );

      const assuntos = Array.isArray(fonte?.assuntos) ? fonte.assuntos : [];

      return {
        numero: formatarNumeroCnj(fonte?.numeroProcesso ?? ""),
        classe: fonte?.classe?.nome ?? "—",
        orgaoJulgador: fonte?.orgaoJulgador?.nome ?? "—",
        grau: fonte?.grau ?? "—",
        dataAjuizamento: fonte?.dataAjuizamento ? new Date(fonte.dataAjuizamento) : null,
        assuntos: assuntos
          .map((assunto) => assunto?.nome)
          .filter((nome): nome is string => Boolean(nome)),
        ultimoMovimento: maisRecente,
      };
    });

    return { total: dados.hits?.total?.value ?? processos.length, processos };
  } catch {
    return {
      total: 0,
      processos: [],
      erro: "Não foi possível falar com o DataJud — verifique a conexão e tente de novo.",
    };
  }
}
