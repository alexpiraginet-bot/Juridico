import type { Metadata } from "next";
import Link from "next/link";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { formatarData } from "@/lib/formatar";

export const metadata: Metadata = { title: "Intimações" };
export const dynamic = "force-dynamic";

function dataDjen(iso: string | null): string {
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return formatarData(new Date(`${iso}T12:00:00Z`));
  return iso ?? "—";
}

// O que o usuário vê na lista: as SUAS capturas + as que colegas do mesmo
// Team compartilharam com ele. Inclui o nome do dono, para marcar as
// recebidas ("de Fulano"). Tipo inferido daqui — inclui a relação `usuario`.
async function carregarIntimacoes(usuarioId: string) {
  return bd.intimacao.findMany({
    where: {
      OR: [
        { destinatarios: { some: { usuarioId } } },
        { usuarioId },
        { compartilhamentos: { some: { usuarioId } } },
      ],
    },
    include: {
      usuario: { select: { nome: true } },
      destinatarios: { where: { usuarioId }, select: { id: true } },
    },
    orderBy: [{ dataDisponibilizacao: "desc" }, { criadoEm: "desc" }],
    take: 100,
  });
}

export default async function PaginaIntimacoes() {
  const usuario = await exigirUsuario();

  let intimacoes: Awaited<ReturnType<typeof carregarIntimacoes>> = [];
  let semBanco = false;
  try {
    intimacoes = await carregarIntimacoes(usuario.id);
  } catch {
    semBanco = true;
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Publicações &amp; Intimações</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Capturadas pela sua OAB no DJEN/CNJ. Abra uma publicação para ver o teor completo e o
        resumo da IA.
      </p>

      {/* Resumo + ação */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {intimacoes.length > 0 && (
          <Selo tom="navy">
            {intimacoes.length.toLocaleString("pt-BR")} publicaç{intimacoes.length === 1 ? "ão" : "ões"}
          </Selo>
        )}
        <Link
          href="/djen"
          className="ml-auto rounded-lg bg-verde px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          🔎 Buscar/atualizar pela OAB
        </Link>
      </div>

      {semBanco ? (
        <div className="rounded-xl border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ Banco de dados indisponível no momento.
        </div>
      ) : intimacoes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[15px] font-semibold text-navy">Nenhuma publicação capturada ainda</p>
          <p className="mx-auto mt-1 max-w-md text-[12.5px] text-suave">
            Vá em <b>Meus processos</b>, informe sua OAB e importe as comunicações do DJEN. Elas
            aparecem aqui, cada uma com teor completo e resumo da IA.
          </p>
          <Link
            href="/djen"
            className="mt-4 inline-block rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
          >
            Ir para Meus processos
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {intimacoes.map((it) => {
            // Recebida = de outro dono, compartilhada comigo.
            const ehDestinatario = it.usuarioId === usuario.id || it.destinatarios.length > 0;
            const recebida = !ehDestinatario;
            return (
            <li key={it.id}>
              <Link
                href={`/intimacoes/${it.id}`}
                className="block rounded-xl border border-borda bg-superficie p-3.5 transition-colors hover:border-verde hover:bg-realce"
              >
                {/* linha 1: processo + data (a data desce embaixo no celular) */}
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 break-words font-mono text-[13px] font-bold text-navy">
                    {it.numeroProcesso || "processo não informado"}
                  </span>
                  {it.dataDisponibilizacao && (
                    <span className="shrink-0 text-[11px] text-suave">
                      {dataDjen(it.dataDisponibilizacao)}
                    </span>
                  )}
                </div>

                {/* linha 2: selos de tipo, tribunal e (se for) recebida */}
                {(it.tipo || it.tribunal || recebida) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {it.tipo && <Selo tom="vermelho">{it.tipo}</Selo>}
                    {it.tribunal && <Selo tom="cinza">{it.tribunal}</Selo>}
                    {recebida && (
                      <Selo tom="azul">🤝 recebida{it.usuario ? ` de ${it.usuario.nome}` : ""}</Selo>
                    )}
                  </div>
                )}

                {/* órgão · classe */}
                {(it.orgao || it.classe) && (
                  <p className="mt-1.5 text-[12.5px] leading-snug text-tinta">
                    {[it.orgao, it.classe].filter(Boolean).join(" · ")}
                  </p>
                )}

                {/* prévia do teor */}
                {it.resumo && (
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-suave">{it.resumo}</p>
                )}

                <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-verde-escuro">
                  <SeloIA>abrir</SeloIA>
                  publicação inteira e resumo da IA →
                </span>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
