/*
 * Integração com a API do Claude (Anthropic) — o cérebro da Fase 5.
 *
 * Roda apenas no servidor: a chave fica em ANTHROPIC_API_KEY (nunca no
 * navegador). Sem a chave configurada, o app continua funcionando em
 * modo demonstração.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODELO_PADRAO = "claude-opus-4-8";

export function iaConfigurada(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/*
 * As regras do redator refletem o princípio central do LexFlow:
 * a IA redige, o advogado decide. Nada de inventar fatos ou leis.
 */
const INSTRUCOES_DO_REDATOR = `Você é o assistente de redação jurídica do LexFlow, escrevendo para advogados brasileiros.

Sua tarefa: redigir a MINUTA da peça processual mais adequada ao momento do processo descrito (por exemplo: contestação após citação, réplica, manifestação sobre laudo). Se o advogado der instruções específicas, siga-as.

Regras inegociáveis:
- Escreva em português do Brasil, no padrão forense, com a estrutura usual (endereçamento, qualificação, fatos, fundamentos, pedidos e fecho).
- Use SOMENTE os fatos fornecidos no contexto. Onde faltar informação essencial, escreva o marcador [PENDENTE: descreva o que falta].
- Cite fundamentos legais com parcimônia e apenas quando tiver segurança; NUNCA invente dispositivos de lei, súmulas ou jurisprudência.
- A minuta é um RASCUNHO que será revisado por um advogado — nunca a versão final.
- Termine SEMPRE com a seção "⚠ NOTA DA IA:" listando pendências, riscos e pontos que o advogado deve conferir antes de protocolar.
- Não escreva comentários fora da peça, além dessa nota final.`;

export interface ContextoDaMinuta {
  processo: {
    numero: string;
    titulo: string;
    area: string;
    fase: string;
    tribunal: string;
    valorCausa: string;
    ultimoEvento: string;
  };
  cliente: {
    nome: string;
    cpfCnpj: string;
    cidade: string;
  };
  prazosPendentes: string[];
  instrucoes: string;
}

function montarPedido(contexto: ContextoDaMinuta): string {
  const { processo, cliente, prazosPendentes, instrucoes } = contexto;
  return `Contexto do processo:
- Número CNJ: ${processo.numero}
- Título: ${processo.titulo}
- Área: ${processo.area} · Fase: ${processo.fase}
- Tribunal/vara: ${processo.tribunal}
- Valor da causa: ${processo.valorCausa}
- Último evento: ${processo.ultimoEvento}

Cliente do escritório: ${cliente.nome} (${cliente.cpfCnpj}), ${cliente.cidade}.

Prazos pendentes:
${prazosPendentes.length > 0 ? prazosPendentes.map((prazo) => `- ${prazo}`).join("\n") : "- nenhum registrado"}

Instruções do advogado: ${instrucoes || "nenhuma — escolha a peça adequada ao momento processual."}

Redija a minuta.`;
}

export async function gerarMinutaComClaude(contexto: ContextoDaMinuta): Promise<string> {
  const cliente = new Anthropic();

  const resposta = await cliente.messages.create({
    model: process.env.MODELO_IA ?? MODELO_PADRAO,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    // "medium" equilibra qualidade e tempo — importante porque a geração
    // roda dentro de uma função da Vercel, que tem tempo limitado.
    output_config: { effort: "medium" },
    system: INSTRUCOES_DO_REDATOR,
    messages: [{ role: "user", content: montarPedido(contexto) }],
  });

  if (resposta.stop_reason === "refusal") {
    throw new Error("O modelo recusou esta solicitação — ajuste as instruções e tente novamente.");
  }

  const texto = resposta.content
    .filter((bloco): bloco is Anthropic.TextBlock => bloco.type === "text")
    .map((bloco) => bloco.text)
    .join("\n")
    .trim();

  if (!texto) {
    throw new Error("A IA não retornou texto — tente novamente.");
  }
  return texto;
}

/*
 * Resumo de um processo a partir dos andamentos públicos (DataJud/CNJ).
 * Mesmo princípio do redator: usa SÓ o que foi dado, não inventa, e a
 * fase é uma LEITURA da IA — sempre conferir nos autos. Devolve campos
 * estruturados (saída em JSON garantida pelo output_config) para a tela
 * montar o resumo com o SeloIA.
 */
export interface AndamentoParaIa {
  nome: string;
  data: string; // já formatada, ex.: "23/04/2026"
}

export interface DadosDoResumo {
  numero: string;
  classe: string;
  assuntos: string[];
  orgaoJulgador: string;
  grau: string;
  andamentos: AndamentoParaIa[];
}

export interface ResumoDoProcesso {
  resumo: string;
  faseProvavel: string;
  ultimosAndamentos: string[];
  pontosDeAtencao: string[];
}

const INSTRUCOES_DO_RESUMIDOR = `Você é o assistente do LexFlow que explica processos para advogados brasileiros, em português claro.

Sua tarefa: a partir dos metadados e dos andamentos (movimentos) fornecidos, explicar do que trata o processo, em que fase ele provavelmente está e o que aconteceu recentemente.

Regras inegociáveis:
- Use SOMENTE as informações fornecidas. Não invente partes, valores, decisões nem datas.
- A fase é uma LEITURA sua a partir dos movimentos — trate-a como provável, não como certeza.
- "ultimosAndamentos": traduza os movimentos recentes para uma linguagem que um leigo entenda, do mais novo para o mais antigo.
- "pontosDeAtencao": aponte prazos, riscos ou o que o advogado deve conferir nos autos. Se não houver andamento suficiente para concluir, diga isso aqui.
- Seja conciso. Nada de repetir o número do processo ou floreios.`;

export async function resumirProcessoComClaude(dados: DadosDoResumo): Promise<ResumoDoProcesso> {
  const cliente = new Anthropic();

  const pedido = `Metadados do processo:
- Número CNJ: ${dados.numero}
- Classe: ${dados.classe}
- Assuntos: ${dados.assuntos.length ? dados.assuntos.join("; ") : "não informados"}
- Órgão julgador: ${dados.orgaoJulgador} (grau: ${dados.grau})

Andamentos (do mais recente para o mais antigo):
${
  dados.andamentos.length
    ? dados.andamentos.slice(0, 40).map((a) => `- ${a.data}: ${a.nome}`).join("\n")
    : "- nenhum andamento disponível"
}

Explique este processo.`;

  const resposta = await cliente.messages.create({
    model: process.env.MODELO_IA ?? MODELO_PADRAO,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            resumo: { type: "string" },
            faseProvavel: { type: "string" },
            ultimosAndamentos: { type: "array", items: { type: "string" } },
            pontosDeAtencao: { type: "array", items: { type: "string" } },
          },
          required: ["resumo", "faseProvavel", "ultimosAndamentos", "pontosDeAtencao"],
        },
      },
    },
    system: INSTRUCOES_DO_RESUMIDOR,
    messages: [{ role: "user", content: pedido }],
  });

  if (resposta.stop_reason === "refusal") {
    throw new Error("O modelo recusou resumir este processo.");
  }

  const texto = resposta.content
    .filter((bloco): bloco is Anthropic.TextBlock => bloco.type === "text")
    .map((bloco) => bloco.text)
    .join("")
    .trim();

  if (!texto) {
    throw new Error("A IA não retornou o resumo — tente novamente.");
  }

  return JSON.parse(texto) as ResumoDoProcesso;
}
