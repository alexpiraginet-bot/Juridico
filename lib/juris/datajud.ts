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

// Código do tribunal (2 dígitos do nº CNJ) -> sigla da UF, na Justiça
// Estadual (Resolução CNJ 65). 07 é o DF (TJDFT).
const UF_POR_CODIGO_TJ: Record<string, string> = {
  "01": "ac", "02": "al", "03": "ap", "04": "am", "05": "ba", "06": "ce",
  "07": "dft", "08": "es", "09": "go", "10": "ma", "11": "mt", "12": "ms",
  "13": "mg", "14": "pa", "15": "pb", "16": "pr", "17": "pe", "18": "pi",
  "19": "rj", "20": "rn", "21": "rs", "22": "ro", "23": "rr", "24": "sc",
  "25": "se", "26": "sp", "27": "to",
};

/*
 * Descobre o índice do DataJud a partir do número CNJ. O formato é
 * NNNNNNN-DD.AAAA.J.TR.OOOO: o dígito J diz o ramo da Justiça e TR o
 * tribunal. Estadual (8) → tj<uf>; Trabalho (5) → trt<n>; Federal (4) →
 * trf<n>. Fora disso, devolvemos null (a tela avisa com elegância).
 */
export function aliasDoNumeroCnj(numero: string): string | null {
  const d = numero.replace(/\D/g, "");
  if (d.length !== 20) return null;
  const ramo = d[13];
  const tribunal = d.slice(14, 16);
  if (ramo === "8") {
    const uf = UF_POR_CODIGO_TJ[tribunal];
    return uf ? `tj${uf}` : null;
  }
  if (ramo === "5") return `trt${Number(tribunal)}`;
  if (ramo === "4") return `trf${Number(tribunal)}`;
  return null;
}

export interface ProcessoDetalhado extends ProcessoPublico {
  movimentos: { nome: string; data: Date }[]; // do mais recente para o mais antigo
}

/*
 * Puxa a linha do tempo de UM processo pelo número CNJ — os andamentos
 * que a IA resume e a tela mostra. Descobre o tribunal pelo próprio
 * número (não exige escolher na mão) e devolve os movimentos ordenados.
 */
export async function consultarProcesso(
  numero: string,
): Promise<{ processo: ProcessoDetalhado | null; erro?: string }> {
  const alias = aliasDoNumeroCnj(numero);
  if (!alias) {
    return { processo: null, erro: "Não reconheci o tribunal deste número CNJ." };
  }

  try {
    const resposta = await fetch(
      `https://api-publica.datajud.cnj.jus.br/api_publica_${alias}/_search`,
      {
        method: "POST",
        headers: {
          Authorization: `APIKey ${process.env.DATAJUD_API_KEY ?? CHAVE_PUBLICA_CNJ}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size: 1,
          query: { match: { numeroProcesso: numero.replace(/\D/g, "") } },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!resposta.ok) {
      return {
        processo: null,
        erro: `O DataJud respondeu com o código ${resposta.status} — tente novamente em instantes.`,
      };
    }

    const dados = (await resposta.json()) as RespostaDataJud;
    const fonte = dados.hits?.hits?.[0]?._source;
    if (!fonte) {
      return { processo: null, erro: "Processo não encontrado no DataJud." };
    }

    const movimentos = (Array.isArray(fonte.movimentos) ? fonte.movimentos : [])
      .filter((m): m is { nome: string; dataHora: string } => Boolean(m?.nome && m?.dataHora))
      .map((m) => ({ nome: m.nome, data: new Date(m.dataHora) }))
      .sort((a, b) => b.data.getTime() - a.data.getTime());

    const assuntos = (Array.isArray(fonte.assuntos) ? fonte.assuntos : [])
      .map((a) => a?.nome)
      .filter((nome): nome is string => Boolean(nome));

    return {
      processo: {
        numero: formatarNumeroCnj(fonte.numeroProcesso ?? numero.replace(/\D/g, "")),
        classe: fonte.classe?.nome ?? "—",
        orgaoJulgador: fonte.orgaoJulgador?.nome ?? "—",
        grau: fonte.grau ?? "—",
        dataAjuizamento: fonte.dataAjuizamento ? new Date(fonte.dataAjuizamento) : null,
        assuntos,
        ultimoMovimento: movimentos[0] ?? null,
        movimentos,
      },
    };
  } catch {
    return {
      processo: null,
      erro: "Não foi possível falar com o DataJud — verifique a conexão e tente de novo.",
    };
  }
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
