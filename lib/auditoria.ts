/*
 * Log de auditoria (Fase 3) — "quem fez o quê, e quando".
 *
 * Fica fora de "use server" porque é chamado por várias ações; é só o
 * gravador. Guardamos o NOME de quem agiu (`usuarioNome`), não só o id: se o
 * usuário for removido depois, o histórico continua legível (a FK vira nula,
 * o registro fica).
 *
 * Regra de ouro: auditar NUNCA quebra a ação principal. Se o banco falhar
 * aqui, engolimos o erro — perder um registro de log é bem menos grave do que
 * derrubar a operação que o usuário pediu.
 */

import { bd } from "@/lib/bd";

export interface EntradaAuditoria {
  usuarioId?: string | null; // nulo = sistema (ex.: cron)
  usuarioNome: string;
  teamId?: string | null; // nulo = plataforma (super-admin)
  acao: string; // rótulo curto, ex.: "prazo.validado"
  detalhe?: string | null; // texto legível para a tela
}

export async function registrarAuditoria(entrada: EntradaAuditoria): Promise<void> {
  try {
    await bd.registroAuditoria.create({
      data: {
        usuarioId: entrada.usuarioId ?? null,
        usuarioNome: entrada.usuarioNome,
        teamId: entrada.teamId ?? null,
        acao: entrada.acao,
        detalhe: entrada.detalhe ?? null,
      },
    });
  } catch {
    // Degrada em silêncio — a ação principal já aconteceu.
  }
}
