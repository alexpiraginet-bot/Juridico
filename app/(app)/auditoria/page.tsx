import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { formatarDataHora } from "@/lib/formatar";
import type { TomSelo } from "@/lib/tipos";

export const metadata: Metadata = { title: "Auditoria" };
export const dynamic = "force-dynamic";

// Rótulo legível + cor de cada tipo de ação. Fallback cinza para o que não
// estiver mapeado (o log nunca "quebra" por causa de uma ação nova).
const ACOES: Record<string, { rotulo: string; tom: TomSelo }> = {
  login: { rotulo: "Login", tom: "azul" },
  "usuario.criado": { rotulo: "Usuário criado", tom: "navy" },
  "usuario.removido": { rotulo: "Usuário removido", tom: "vermelho" },
  "credencial.criada": { rotulo: "OAB cadastrada", tom: "verde" },
  "credencial.removida": { rotulo: "OAB removida", tom: "vermelho" },
  "intimacao.importada": { rotulo: "Intimações importadas", tom: "verde" },
  "intimacao.compartilhada": { rotulo: "Publicação compartilhada", tom: "verde" },
  "intimacao.revogada": { rotulo: "Compartilhamento revogado", tom: "ambar" },
  "prazo.validado": { rotulo: "Prazo validado", tom: "verde" },
  "escritorio.criado": { rotulo: "Escritório criado", tom: "navy" },
  "escritorio.removido": { rotulo: "Escritório removido", tom: "vermelho" },
};

// Consulta o log. Sempre inclui o Team (a coluna só aparece para o
// super-admin). O tipo do resultado é inferido daqui.
async function carregarAuditoria(apenasTeamId: string | null) {
  return bd.registroAuditoria.findMany({
    where: apenasTeamId ? { teamId: apenasTeamId } : {},
    include: { team: { select: { nome: true } } },
    orderBy: { criadoEm: "desc" },
    take: 200,
  });
}

export default async function PaginaAuditoria() {
  const usuario = await exigirUsuario();
  const ehSuper = usuario.papel === "SUPERADMIN";
  const ehDono = usuario.papel === "DONO_ESCRITORIO";
  // Auditoria é ferramenta de gestão: só super-admin e dono do escritório.
  if (!ehSuper && !ehDono) redirect("/");

  // Super-admin vê tudo (plataforma); dono vê só o próprio escritório.
  const escopo = ehSuper ? null : usuario.teamId;
  if (!ehSuper && !escopo) redirect("/"); // dono sem escritório: nada a ver

  let registros: Awaited<ReturnType<typeof carregarAuditoria>> = [];
  let semBanco = false;
  try {
    registros = await carregarAuditoria(escopo);
  } catch {
    semBanco = true;
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">
        Auditoria{ehSuper ? " · plataforma" : usuario.team ? ` · ${usuario.team.nome}` : ""}
      </h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Registro de quem fez o quê, e quando. É só leitura — o histórico não se
        apaga nem se edita.
      </p>

      {semBanco ? (
        <div className="rounded-xl border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ Banco de dados indisponível no momento.
        </div>
      ) : registros.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[15px] font-semibold text-navy">Nada registrado ainda</p>
          <p className="mx-auto mt-1 max-w-md text-[12.5px] text-suave">
            As ações da equipe (logins, cadastros, validações de prazo,
            compartilhamentos) aparecem aqui conforme acontecem.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {registros.map((r) => {
            const info = ACOES[r.acao] ?? { rotulo: r.acao, tom: "cinza" as TomSelo };
            return (
              <li
                key={r.id}
                className="rounded-xl border border-borda bg-superficie p-3.5"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Selo tom={info.tom}>{info.rotulo}</Selo>
                  <span className="font-semibold text-navy">{r.usuarioNome}</span>
                  {ehSuper && r.team && (
                    <span className="text-[11px] text-suave">· {r.team.nome}</span>
                  )}
                  <span className="ml-auto shrink-0 text-[11px] text-suave">
                    {formatarDataHora(r.criadoEm)}
                  </span>
                </div>
                {r.detalhe && (
                  <p className="mt-1 text-[12.5px] leading-snug text-tinta">{r.detalhe}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
