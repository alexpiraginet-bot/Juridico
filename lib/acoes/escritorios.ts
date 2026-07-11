"use server";

/*
 * Ações do painel central (super-admin). É onde nós, a plataforma,
 * cadastramos os escritórios (Team) — cada um com nome e logo — e criamos
 * o acesso do dono (DONO_ESCRITORIO). Daí em diante o escritório cuida dos
 * próprios usuários.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { exigirSuperadmin, hashSenha } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export async function criarEscritorio(dados: FormData) {
  const admin = await exigirSuperadmin();

  const nome = texto(dados, "nome");
  const logoUrl = texto(dados, "logoUrl") || null;
  const donoNome = texto(dados, "donoNome");
  const donoEmail = texto(dados, "donoEmail").toLowerCase();
  const donoSenha = String(dados.get("donoSenha") ?? "");

  let erro: string | null = null;
  let novoTeamId: string | null = null;
  if (!nome || !donoNome || !donoEmail || !donoSenha) {
    erro = "Nome do escritório e os dados do dono (nome, e-mail, senha) são obrigatórios.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donoEmail)) {
    erro = "Informe um e-mail válido para o dono.";
  } else if (donoSenha.length < 6) {
    erro = "A senha do dono deve ter ao menos 6 caracteres.";
  } else {
    try {
      const time = await bd.team.create({
        data: {
          nome,
          logoUrl,
          usuarios: {
            create: {
              nome: donoNome,
              email: donoEmail,
              senhaHash: hashSenha(donoSenha),
              papel: "DONO_ESCRITORIO",
            },
          },
        },
      });
      novoTeamId = time.id;
    } catch (excecao) {
      erro =
        (excecao as { code?: string }).code === "P2002"
          ? "Já existe um usuário com esse e-mail."
          : "Não foi possível criar o escritório — verifique a conexão com o banco.";
    }
  }

  if (erro) redirect(`/central?erro=${encodeURIComponent(erro)}`);
  // Registra no log do PRÓPRIO escritório recém-criado: é a primeira linha
  // que o dono verá na auditoria dele ("a plataforma criou o escritório").
  await registrarAuditoria({
    usuarioId: admin.id,
    usuarioNome: admin.nome,
    teamId: novoTeamId,
    acao: "escritorio.criado",
    detalhe: `criou o escritório ${nome} (dono: ${donoNome})`,
  });
  revalidatePath("/central");
  redirect("/central");
}

export async function excluirEscritorio(id: string) {
  const admin = await exigirSuperadmin();
  let nomeRemovido: string | null = null;
  try {
    // Apagar o Team leva junto o log dele (cascade); guardamos o nome antes
    // e registramos a remoção como evento de PLATAFORMA (teamId nulo).
    const time = await bd.team.findUnique({ where: { id }, select: { nome: true } });
    if (time) {
      await bd.team.delete({ where: { id } });
      nomeRemovido = time.nome;
    }
  } catch {
    redirect(
      `/central?erro=${encodeURIComponent("Não foi possível excluir — verifique a conexão com o banco.")}`,
    );
  }
  if (nomeRemovido) {
    await registrarAuditoria({
      usuarioId: admin.id,
      usuarioNome: admin.nome,
      teamId: null,
      acao: "escritorio.removido",
      detalhe: `removeu o escritório ${nomeRemovido}`,
    });
  }
  revalidatePath("/central");
}
