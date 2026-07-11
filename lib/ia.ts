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
