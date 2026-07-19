"use server";

/*
 * Ações de servidor dos prazos — incluindo a validação humana,
 * princípio central do produto: prazo só vale na agenda oficial
 * depois que um advogado o valida.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarPrazo(dados: FormData) {
  const usuario = await exigirUsuarioDoEscritorio();
  const descricao = texto(dados, "descricao");
  const vencimento = texto(dados, "vencimento"); // AAAA-MM-DD do <input type="date">
  const processoId = texto(dados, "processoId");
  const responsavel = texto(dados, "responsavel") || null;

  let erro: string | null = null;
  if (!descricao || !vencimento || !processoId) {
    erro = "Descrição, vencimento e processo são obrigatórios.";
  } else {
    try {
      const processo = await bd.processo.findFirst({
        where: { id: processoId, teamId: usuario.teamId },
        select: { id: true },
      });
      if (!processo) {
        erro = "Processo inválido para este escritório.";
      } else {
        await bd.prazo.create({
          data: {
            descricao,
            vencimento: new Date(`${vencimento}T00:00:00.000Z`),
            responsavel,
            processoId,
            teamId: usuario.teamId,
            validado: true, // criado à mão por um humano — já nasce validado
          },
        });
        await registrarAuditoria({
          usuarioId: usuario.id,
          usuarioNome: usuario.nome,
          teamId: usuario.teamId,
          acao: "prazo.criado",
          detalhe: `criou o prazo '${descricao}'`,
        });
      }
    } catch {
      erro = "Não foi possível salvar — verifique a conexão com o banco.";
    }
  }

  if (erro) redirect(`/prazos/novo?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/prazos");
  redirect("/prazos");
}

export async function validarPrazo(id: string) {
  const usuario = await exigirUsuarioDoEscritorio();
  const prazo = await bd.prazo.findFirst({
    where: { id, teamId: usuario.teamId },
    select: { descricao: true },
  });
  if (!prazo) redirect("/prazos");
  await bd.prazo.updateMany({
    where: { id, teamId: usuario.teamId },
    data: { validado: true },
  });
  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId: usuario.teamId,
    acao: "prazo.validado",
    detalhe: `validou o prazo '${prazo.descricao}'`,
  });
  revalidatePath("/prazos");
}

export async function concluirPrazo(id: string) {
  const usuario = await exigirUsuarioDoEscritorio();
  await bd.prazo.updateMany({
    where: { id, teamId: usuario.teamId },
    data: { concluido: true },
  });
  revalidatePath("/prazos");
}

export async function excluirPrazo(id: string) {
  const usuario = await exigirUsuarioDoEscritorio();
  await bd.prazo.deleteMany({ where: { id, teamId: usuario.teamId } });
  revalidatePath("/prazos");
}

/*
 * Chamada pela tela de Intimações: valida o prazo de contestação
 * sugerido pela IA na demonstração. Cria (se preciso) o cliente, o
 * processo e o prazo — tudo idempotente — e marca como validado.
 * A partir daí ele aparece de verdade na aba Prazos.
 */
export async function validarPrazoDaCitacao(): Promise<{ ok: boolean; erro?: string }> {
  try {
    const usuario = await exigirUsuarioDoEscritorio();
    const joao = await bd.cliente.upsert({
      where: {
        teamId_cpfCnpj: { teamId: usuario.teamId, cpfCnpj: "555.666.777-88" },
      },
      update: {},
      create: {
        nome: "João Pereira",
        cpfCnpj: "555.666.777-88",
        email: "jpereira@email.com",
        telefone: "(27) 98822-4455",
        cidade: "Vitória/ES",
        teamId: usuario.teamId,
      },
    });
    const processo = await bd.processo.upsert({
      where: {
        teamId_numero: { teamId: usuario.teamId, numero: "0801234-55.2026.8.08.0024" },
      },
      update: {},
      create: {
        numero: "0801234-55.2026.8.08.0024",
        titulo: "Ação de cobrança — contrato de empreitada",
        area: "CIVEL",
        tribunal: "TJES · 3ª Vara Cível de Vitória",
        fase: "CONHECIMENTO",
        ultimoEvento: "Citação capturada do DJEN — contestar até 31/07",
        valorCausa: 85_000,
        clienteId: joao.id,
        teamId: usuario.teamId,
      },
    });

    const contestacao = await bd.prazo.findFirst({
      where: { processoId: processo.id, teamId: usuario.teamId, descricao: "Contestação" },
    });
    if (contestacao) {
      await bd.prazo.updateMany({
        where: { id: contestacao.id, teamId: usuario.teamId },
        data: { validado: true },
      });
    } else {
      await bd.prazo.create({
        data: {
          descricao: "Contestação",
          vencimento: new Date("2026-07-31T00:00:00.000Z"),
          responsavel: "Dr. Gustavo",
          validado: true,
          processoId: processo.id,
          teamId: usuario.teamId,
        },
      });
    }

    revalidatePath("/prazos");
    return { ok: true };
  } catch {
    return {
      ok: false,
      erro: "Banco de dados indisponível — confira a variável DATABASE_URL.",
    };
  }
}
