"use server";

/*
 * Ações de compartilhamento (Fase 3) — o DONO de uma intimação libera a
 * leitura para um colega do MESMO Team. Só o dono compartilha ou revoga; o
 * destinatário precisa ser da mesma equipe (e não pode ser o próprio dono).
 * O acesso é de leitura: o colega passa a ver a publicação, mas ela continua
 * sendo do dono (não vira dele).
 *
 * O vínculo é a tabela `CompartilhamentoIntimacao` — (intimacao, usuario) é
 * único, então compartilhar de novo com a mesma pessoa é inofensivo.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function compartilharIntimacao(dados: FormData) {
  const usuario = await exigirUsuario();
  const intimacaoId = texto(dados, "intimacaoId");
  const destinatarioId = texto(dados, "destinatarioId");
  const destino = `/intimacoes/${intimacaoId}`;

  let erro: string | null = null;
  let numeroProcesso = "";
  let colegaNome = "";
  if (!intimacaoId || !destinatarioId) {
    erro = "Escolha um colega para compartilhar.";
  } else if (destinatarioId === usuario.id) {
    erro = "Você já é o dono desta publicação.";
  } else if (!usuario.teamId) {
    erro = "Você não está vinculado a um escritório.";
  } else {
    // Só o dono compartilha; o destinatário tem de ser da mesma equipe.
    const dono = await bd.intimacao.findFirst({
      where: { id: intimacaoId, usuarioId: usuario.id },
      select: { numeroProcesso: true },
    });
    const colega = await bd.usuario.findFirst({
      where: { id: destinatarioId, teamId: usuario.teamId },
      select: { nome: true },
    });
    if (!dono) {
      erro = "Só o dono da publicação pode compartilhá-la.";
    } else if (!colega) {
      erro = "Colega inválido — escolha alguém da sua equipe.";
    } else {
      try {
        await bd.compartilhamentoIntimacao.upsert({
          where: { intimacaoId_usuarioId: { intimacaoId, usuarioId: destinatarioId } },
          update: {},
          create: { intimacaoId, usuarioId: destinatarioId },
        });
        numeroProcesso = dono.numeroProcesso;
        colegaNome = colega.nome;
      } catch {
        erro = "Não foi possível compartilhar — verifique a conexão com o banco.";
      }
    }
  }

  if (erro) redirect(`${destino}?erro=${encodeURIComponent(erro)}`);
  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId: usuario.teamId,
    acao: "intimacao.compartilhada",
    detalhe: `compartilhou a publicação ${numeroProcesso || "(sem número)"} com ${colegaNome}`,
  });
  revalidatePath(destino);
  revalidatePath("/intimacoes");
  redirect(destino);
}

export async function revogarCompartilhamento(dados: FormData) {
  const usuario = await exigirUsuario();
  const intimacaoId = texto(dados, "intimacaoId");
  const destinatarioId = texto(dados, "destinatarioId");
  const destino = `/intimacoes/${intimacaoId}`;

  // Só o dono revoga — o filtro pela intimação do usuário garante isso.
  const dono = await bd.intimacao.findFirst({
    where: { id: intimacaoId, usuarioId: usuario.id },
    select: { id: true },
  });
  let revogado: string | null = null;
  if (dono) {
    try {
      const r = await bd.compartilhamentoIntimacao.deleteMany({
        where: { intimacaoId, usuarioId: destinatarioId },
      });
      if (r.count > 0) {
        const colega = await bd.usuario.findUnique({
          where: { id: destinatarioId },
          select: { nome: true },
        });
        revogado = colega?.nome ?? "um colega";
      }
    } catch {
      // silencioso: a próxima renderização mostra o estado real.
    }
  }
  if (revogado) {
    await registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      teamId: usuario.teamId,
      acao: "intimacao.revogada",
      detalhe: `revogou o acesso de ${revogado}`,
    });
  }

  revalidatePath(destino);
  revalidatePath("/intimacoes");
  redirect(destino);
}
