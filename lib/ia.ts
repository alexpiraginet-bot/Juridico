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

/*
 * Resumo de UMA publicação/intimação do DJEN, a partir do teor completo.
 * Mesma disciplina: usa só o texto dado, não inventa prazos, e o que
 * afirmar sobre prazo vem do próprio texto. Serve para o advogado
 * entender rápido o que a publicação exige — sempre com revisão humana.
 */
export interface ResumoDaIntimacao {
  resumo: string;
  oQuePede: string;
  prazoMencionado: string;
  pontosDeAtencao: string[];
}

const INSTRUCOES_DA_INTIMACAO = `Você é o assistente do LexFlow que lê publicações do Diário de Justiça para advogados brasileiros e explica, em português claro, o que cada uma significa.

A partir do TEOR da publicação (e do contexto: número do processo, tipo, órgão, classe), produza:
- "resumo": em 2 a 4 frases, do que se trata a publicação.
- "oQuePede": a providência que ela exige do advogado (contestar, recorrer, se manifestar, comparecer a audiência, pagar custas...), ou "nenhuma providência aparente".
- "prazoMencionado": o prazo citado NO TEXTO (ex.: "15 dias úteis a partir da intimação"), ou "nenhum prazo identificado no texto". NÃO calcule datas nem invente prazos.
- "pontosDeAtencao": riscos, ambiguidades ou o que conferir nos autos.

Regras: use SOMENTE o que está no teor. Não invente. Não afirme prazo que o texto não traz.`;

export async function resumirIntimacaoComClaude(dados: {
  numeroProcesso: string;
  tipo: string;
  orgao: string;
  classe: string;
  teor: string;
}): Promise<ResumoDaIntimacao> {
  const cliente = new Anthropic();

  const pedido = `Contexto:
- Número do processo: ${dados.numeroProcesso || "não informado"}
- Tipo: ${dados.tipo || "não informado"} · Classe: ${dados.classe || "não informada"}
- Órgão: ${dados.orgao || "não informado"}

Teor da publicação:
"""
${dados.teor.slice(0, 12000)}
"""

Explique esta publicação.`;

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
            oQuePede: { type: "string" },
            prazoMencionado: { type: "string" },
            pontosDeAtencao: { type: "array", items: { type: "string" } },
          },
          required: ["resumo", "oQuePede", "prazoMencionado", "pontosDeAtencao"],
        },
      },
    },
    system: INSTRUCOES_DA_INTIMACAO,
    messages: [{ role: "user", content: pedido }],
  });

  if (resposta.stop_reason === "refusal") {
    throw new Error("O modelo recusou resumir esta publicação.");
  }

  const texto = resposta.content
    .filter((bloco): bloco is Anthropic.TextBlock => bloco.type === "text")
    .map((bloco) => bloco.text)
    .join("")
    .trim();

  if (!texto) throw new Error("A IA não retornou o resumo — tente novamente.");
  return JSON.parse(texto) as ResumoDaIntimacao;
}

/*
 * Relato fático do atendimento — o que faltava da Fase 5. Lê a conversa do
 * WhatsApp entre o cliente e o escritório e redige, para o advogado, o
 * rascunho do relato fático (mais a linha do tempo, o checklist de documentos
 * e as perguntas a fazer). Mesma disciplina de sempre: usa SÓ o que está na
 * conversa, marca o que é incerto, e é RASCUNHO — a decisão é do advogado.
 */
export interface MensagemParaIa {
  de: "cliente" | "escritorio";
  texto: string;
  documento?: string; // anexo citado na conversa (ex.: "carteira_trabalho.pdf")
}

export interface AnaliseDoAtendimento {
  relatoFatico: string;
  linhaDoTempo: { quando: string; texto: string }[];
  checklist: { recebido: boolean; texto: string }[];
  perguntas: string[];
}

const INSTRUCOES_DO_RELATO = `Você é o assistente do LexFlow que lê o atendimento inicial (conversa de WhatsApp) entre um cliente e um escritório de advocacia brasileiro e prepara, para o advogado, o rascunho da análise do caso.

A partir das mensagens (marcadas como CLIENTE ou ESCRITÓRIO) e dos documentos citados, produza:
- "relatoFatico": o relato fático em 3 a 6 frases, em português forense, na 3ª pessoa e de forma objetiva. Narre só os fatos relatados pelo cliente. Marque o que ainda não está confirmado com "(a confirmar)".
- "linhaDoTempo": os eventos relevantes em ordem cronológica. Cada item tem "quando" (uma referência temporal — data, mês/ano ou algo como "há ~4 anos" quando a conversa não trouxer a data exata) e "texto" (o que aconteceu).
- "checklist": os documentos que ESTE tipo de caso costuma exigir. Marque "recebido": true SOMENTE para os que a conversa indica já terem sido enviados/anexados; os demais ficam false.
- "perguntas": perguntas objetivas que o advogado deveria fazer ao cliente para completar o caso.

Regras inegociáveis:
- Use SOMENTE o que está na conversa. NÃO invente fatos, partes, valores, datas nem documentos.
- É um RASCUNHO para revisão do advogado — nunca a versão final.
- Não escreva nada fora dos campos pedidos.`;

export async function gerarAnaliseDoAtendimentoComClaude(
  mensagens: MensagemParaIa[],
): Promise<AnaliseDoAtendimento> {
  const cliente = new Anthropic();

  const transcricao = mensagens
    .map((m) => {
      const quem = m.de === "cliente" ? "CLIENTE" : "ESCRITÓRIO";
      const anexo = m.documento ? ` [anexou o documento: ${m.documento}]` : "";
      return `${quem}: ${m.texto}${anexo}`;
    })
    .join("\n");

  const pedido = `Conversa do atendimento (em ordem):
"""
${transcricao.slice(0, 12000)}
"""

Prepare a análise deste atendimento.`;

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
            relatoFatico: { type: "string" },
            linhaDoTempo: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: { quando: { type: "string" }, texto: { type: "string" } },
                required: ["quando", "texto"],
              },
            },
            checklist: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: { recebido: { type: "boolean" }, texto: { type: "string" } },
                required: ["recebido", "texto"],
              },
            },
            perguntas: { type: "array", items: { type: "string" } },
          },
          required: ["relatoFatico", "linhaDoTempo", "checklist", "perguntas"],
        },
      },
    },
    system: INSTRUCOES_DO_RELATO,
    messages: [{ role: "user", content: pedido }],
  });

  if (resposta.stop_reason === "refusal") {
    throw new Error("O modelo recusou analisar este atendimento.");
  }

  const texto = resposta.content
    .filter((bloco): bloco is Anthropic.TextBlock => bloco.type === "text")
    .map((bloco) => bloco.text)
    .join("")
    .trim();

  if (!texto) throw new Error("A IA não retornou a análise — tente novamente.");
  return JSON.parse(texto) as AnaliseDoAtendimento;
}
