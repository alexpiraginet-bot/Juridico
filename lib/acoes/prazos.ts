"use server";

/*
 * Ações de servidor dos prazos — incluindo a validação humana,
 * princípio central do produto: prazo só vale na agenda oficial
 * depois que um advogado o valida.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarPrazo(dados: FormData) {
  const descricao = texto(dados, "descricao");
  const vencimento = texto(dados, "vencimento"); // AAAA-MM-DD do <input type="date">
  const processoId = texto(dados, "processoId");
  const responsavel = texto(dados, "responsavel") || null;

  let erro: string | null = null;
  if (!descricao || !vencimento || !processoId) {
    erro = "Descrição, vencimento e processo são obrigatórios.";
  } else {
    try {
      await bd.prazo.create({
        data: {
          descricao,
          vencimento: new Date(`${vencimento}T00:00:00.000Z`),
          responsavel,
          processoId,
          validado: true, // criado à mão por um humano — já nasce validado
        },
      });
    } catch {
      erro = "Não foi possível salvar — verifique a conexão com o banco.";
    }
  }

  if (erro) redirect(`/prazos/novo?erro=${encodeURIComponent(erro)}`);
  revalidatePath("/prazos");
  redirect("/prazos");
}

export async function validarPrazo(id: string) {
  const usuario = await exigirUsuario();
  // O update devolve o prazo já atualizado — usamos a descrição no log.
  const prazo = await bd.prazo.update({ where: { id }, data: { validado: true } });
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
  await bd.prazo.update({ where: { id }, data: { concluido: true } });
  revalidatePath("/prazos");
}

export async function excluirPrazo(id: string) {
  await bd.prazo.delete({ where: { id } });
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
    const joao = await bd.cliente.upsert({
      where: { cpfCnpj: "555.666.777-88" },
      update: {},
      create: {
        nome: "João Pereira",
        cpfCnpj: "555.666.777-88",
        email: "jpereira@email.com",
        telefone: "(27) 98822-4455",
        cidade: "Vitória/ES",
      },
    });
    const processo = await bd.processo.upsert({
      where: { numero: "0801234-55.2026.8.08.0024" },
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
      },
    });

    const contestacao = await bd.prazo.findFirst({
      where: { processoId: processo.id, descricao: "Contestação" },
    });
    if (contestacao) {
      await bd.prazo.update({ where: { id: contestacao.id }, data: { validado: true } });
    } else {
      await bd.prazo.create({
        data: {
          descricao: "Contestação",
          vencimento: new Date("2026-07-31T00:00:00.000Z"),
          responsavel: "Dr. Gustavo",
          validado: true,
          processoId: processo.id,
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
