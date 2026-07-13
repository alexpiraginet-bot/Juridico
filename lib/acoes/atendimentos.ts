"use server";

/*
 * Ações do atendimento:
 *  - `analisarAtendimento`: gera o relato fático (e a análise) por IA a partir
 *    da conversa. A IA roda SÓ no servidor (chave em ANTHROPIC_API_KEY).
 *  - `responderAtendimento`: envia a resposta do escritório pelo WhatsApp
 *    (Graph API) e grava a mensagem no histórico.
 * Ambas degradam com elegância (sem as chaves, avisam em vez de quebrar).
 */

import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import {
  gerarAnaliseDoAtendimentoComClaude,
  iaConfigurada,
  type AnaliseDoAtendimento,
  type MensagemParaIa,
} from "@/lib/ia";
import { enviarTextoWhatsapp, enviarTemplateWhatsapp, preencherModelo } from "@/lib/whatsapp/enviar";

function hhmm(data: Date): string {
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export type ResultadoAnalise =
  | { ok: true; analise: AnaliseDoAtendimento }
  | { ok: false; erro: string };

export async function analisarAtendimento(
  mensagens: MensagemParaIa[],
): Promise<ResultadoAnalise> {
  // App atrás do login: só usuário autenticado dispara a IA (custo + acesso).
  await exigirUsuario();

  if (!iaConfigurada()) {
    return {
      ok: false,
      erro: "Configure a ANTHROPIC_API_KEY para gerar o relato pela IA. Enquanto isso, fica o rascunho de demonstração.",
    };
  }

  if (!mensagens.length) {
    return { ok: false, erro: "Conversa vazia — nada para analisar." };
  }

  try {
    const analise = await gerarAnaliseDoAtendimentoComClaude(mensagens);
    return { ok: true, analise };
  } catch (excecao) {
    return {
      ok: false,
      erro:
        excecao instanceof Error
          ? excecao.message
          : "Não foi possível gerar o relato agora — tente novamente.",
    };
  }
}

export type ResultadoResposta =
  | { ok: true; hora: string }
  | { ok: false; erro: string };

/*
 * Responder pelo chat: manda a mensagem pelo WhatsApp e grava como ENVIADA.
 * Isolamento: a conversa tem de ser do Team do usuário logado.
 */
export async function responderAtendimento(
  conversaId: string,
  texto: string,
): Promise<ResultadoResposta> {
  const usuario = await exigirUsuario();
  const corpo = texto.trim();
  if (!corpo) return { ok: false, erro: "Mensagem vazia." };

  const conversa = await bd.conversaWhatsapp.findFirst({
    where: { id: conversaId, teamId: usuario.teamId },
    select: { id: true, telefone: true },
  });
  if (!conversa) return { ok: false, erro: "Conversa não encontrada neste escritório." };

  const envio = await enviarTextoWhatsapp(conversa.telefone, corpo);
  if (!envio.ok) {
    return {
      ok: false,
      erro: envio.demo
        ? "WhatsApp não configurado — a resposta não foi enviada (modo demonstração)."
        : envio.erro,
    };
  }

  const agora = new Date();
  try {
    await bd.mensagemWhatsapp.create({
      data: {
        conversaId: conversa.id,
        direcao: "ENVIADA",
        texto: corpo,
        waMessageId: envio.waMessageId,
        enviadoEm: agora,
      },
    });
  } catch {
    // Enviou pelo WhatsApp, mas falhou ao gravar — a mensagem já saiu.
    return { ok: false, erro: "Mensagem enviada, mas não consegui gravá-la no histórico." };
  }

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId: usuario.teamId,
    acao: "whatsapp.resposta",
    detalhe: `respondeu o contato ${conversa.telefone} pelo WhatsApp`,
  });

  return { ok: true, hora: hhmm(agora) };
}

/*
 * Enviar um MODELO (template) aprovado — o único jeito de falar FORA da janela
 * de 24h. Envia pela Graph API e grava no histórico o texto já preenchido (os
 * {{1}}, {{2}}… trocados pelos parâmetros), para o histórico ficar legível.
 */
export async function enviarModeloParaConversa(
  conversaId: string,
  modeloId: string,
  parametros: string[],
): Promise<ResultadoResposta> {
  const usuario = await exigirUsuario();
  if (!usuario.teamId) return { ok: false, erro: "Seu usuário não está em um escritório." };

  const conversa = await bd.conversaWhatsapp.findFirst({
    where: { id: conversaId, teamId: usuario.teamId },
    select: { id: true, telefone: true },
  });
  if (!conversa) return { ok: false, erro: "Conversa não encontrada neste escritório." };

  const modelo = await bd.modeloWhatsapp.findFirst({
    where: { id: modeloId, teamId: usuario.teamId },
  });
  if (!modelo) return { ok: false, erro: "Modelo não encontrado neste escritório." };

  const params = (parametros ?? []).map((p) => p.trim());
  if (params.slice(0, modelo.numParams).some((p) => !p)) {
    return { ok: false, erro: "Preencha todos os campos do modelo antes de enviar." };
  }

  const envio = await enviarTemplateWhatsapp(
    conversa.telefone,
    modelo.nome,
    modelo.idioma,
    params.slice(0, modelo.numParams),
  );
  if (!envio.ok) {
    return {
      ok: false,
      erro: envio.demo
        ? "WhatsApp não configurado — o modelo não foi enviado (modo demonstração)."
        : envio.erro,
    };
  }

  const agora = new Date();
  const texto = preencherModelo(modelo.corpo, params);
  try {
    await bd.mensagemWhatsapp.create({
      data: {
        conversaId: conversa.id,
        direcao: "ENVIADA",
        texto,
        waMessageId: envio.waMessageId,
        enviadoEm: agora,
      },
    });
  } catch {
    return { ok: false, erro: "Modelo enviado, mas não consegui gravá-lo no histórico." };
  }

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId: usuario.teamId,
    acao: "whatsapp.modelo.enviado",
    detalhe: `enviou o modelo "${modelo.nome}" ao contato ${conversa.telefone}`,
  });

  return { ok: true, hora: hhmm(agora) };
}
