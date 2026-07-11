"use server";

/*
 * Ações de login e logout. `entrar` garante o superadmin (via env) no
 * primeiro acesso, confere a senha e abre a sessão. `sair` encerra.
 */

import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import { criarSessao, encerrarSessao, garantirSuperadmin, verificarSenha } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

export async function entrar(dados: FormData) {
  const email = String(dados.get("email") ?? "").trim().toLowerCase();
  const senha = String(dados.get("senha") ?? "");

  if (!email || !senha) {
    redirect(`/entrar?erro=${encodeURIComponent("Informe e-mail e senha.")}`);
  }

  await garantirSuperadmin();

  const usuario = await bd.usuario.findUnique({ where: { email } });
  if (!usuario || !verificarSenha(senha, usuario.senhaHash)) {
    redirect(`/entrar?erro=${encodeURIComponent("E-mail ou senha incorretos.")}`);
  }

  await criarSessao(usuario.id);
  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    teamId: usuario.teamId,
    acao: "login",
    detalhe: "entrou no sistema",
  });
  redirect(usuario.papel === "SUPERADMIN" ? "/central" : "/");
}

export async function sair() {
  await encerrarSessao();
  redirect("/entrar");
}
