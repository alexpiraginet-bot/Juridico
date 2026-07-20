/*
 * Autenticação do LexFlow (Fase 3) — e-mail + senha, com sessão própria.
 *
 * Roda só no servidor. A senha nunca é guardada em texto: usamos `scrypt`
 * do próprio Node (sem dependência externa) com um sal aleatório por
 * senha. A sessão é uma linha na tabela `sessoes`; o id dela vai num
 * cookie httpOnly (o navegador manda de volta, o JavaScript da página não
 * lê). Nada de segredo no cliente.
 */

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { bd } from "@/lib/bd";
import type { PapelUsuario } from "@/lib/generated/prisma/enums";

const COOKIE = "lexflow_sessao";
const DIAS = 30;

export function hashSenha(senha: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

export function verificarSenha(senha: string, armazenado: string | null | undefined): boolean {
  if (!armazenado || !armazenado.includes(":")) return false;
  const [sal, hashHex] = armazenado.split(":");
  const alvo = Buffer.from(hashHex, "hex");
  const teste = scryptSync(senha, sal, 64);
  return alvo.length === teste.length && timingSafeEqual(alvo, teste);
}

export async function criarSessao(usuarioId: string): Promise<void> {
  const expiraEm = new Date(Date.now() + DIAS * 24 * 60 * 60 * 1000);
  const sessao = await bd.sessao.create({ data: { usuarioId, expiraEm } });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, sessao.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });
}

export async function encerrarSessao(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (token) {
    await bd.sessao.deleteMany({ where: { id: token } });
    cookieStore.delete(COOKIE);
  }
}

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  teamId: string | null;
  team: { id: string; nome: string; logoUrl: string | null } | null;
}

/*
 * Sessão do request atual. Embrulhada em `cache()` do React: o layout do
 * grupo (app) e a própria página chamam isto no mesmo request — com o cache,
 * a consulta à sessão roda uma vez só por request (dedupe), sem mudar o
 * comportamento (cada request tem seu próprio cache).
 */
export const usuarioAtual = cache(async function usuarioAtual(): Promise<UsuarioLogado | null> {
  let token: string | undefined;
  try {
    token = (await cookies()).get(COOKIE)?.value;
  } catch {
    return null;
  }
  if (!token) return null;

  try {
    const sessao = await bd.sessao.findUnique({
      where: { id: token },
      include: { usuario: { include: { team: true } } },
    });
    if (!sessao || sessao.expiraEm < new Date()) return null;
    const u = sessao.usuario;
    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      papel: u.papel,
      teamId: u.teamId,
      team: u.team ? { id: u.team.id, nome: u.team.nome, logoUrl: u.team.logoUrl } : null,
    };
  } catch {
    return null;
  }
});

export async function exigirUsuario(): Promise<UsuarioLogado> {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar");
  return u;
}

// Toda tela operacional pertence a um escritório. Além de reduzir repetição,
// este guard impede que um SUPERADMIN sem Team consulte acidentalmente dados
// globais: administração da plataforma continua em /central; carteira jurídica
// sempre exige um tenant explícito.
export async function exigirUsuarioDoEscritorio(): Promise<UsuarioLogado & { teamId: string }> {
  const u = await exigirUsuario();
  if (!u.teamId) redirect(u.papel === "SUPERADMIN" ? "/central" : "/entrar");
  return u as UsuarioLogado & { teamId: string };
}

export async function exigirSuperadmin(): Promise<UsuarioLogado> {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar");
  if (u.papel !== "SUPERADMIN") redirect("/");
  return u;
}

// Exige um DONO_ESCRITORIO com Team — quem gere a própria equipe. Garante
// `teamId` não-nulo para as telas e ações scoparem pelo escritório.
export async function exigirDono(): Promise<UsuarioLogado & { teamId: string }> {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar");
  if (u.papel === "SUPERADMIN") redirect("/central");
  if (u.papel !== "DONO_ESCRITORIO" || !u.teamId) redirect("/");
  return u as UsuarioLogado & { teamId: string };
}

/*
 * Garante que o SUPERADMIN (nós, a plataforma) exista, a partir das
 * variáveis de ambiente — idempotente. Chamada no fluxo de login, para o
 * primeiro acesso funcionar sem semear o banco à mão.
 */
export async function garantirSuperadmin(): Promise<void> {
  const email = (process.env.SUPERADMIN_EMAIL ?? "").trim().toLowerCase();
  const senha = process.env.SUPERADMIN_SENHA ?? "";
  if (!email || !senha) return;
  try {
    const jaExiste = await bd.usuario.findFirst({ where: { papel: "SUPERADMIN" } });
    if (jaExiste) return;
    await bd.usuario.create({
      data: { nome: "Administração", email, senhaHash: hashSenha(senha), papel: "SUPERADMIN" },
    });
  } catch {
    // e-mail já em uso, corrida de concorrência etc. — ignora.
  }
}
