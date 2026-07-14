import type { Metadata } from "next";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { formatarData } from "@/lib/formatar";
import { buscarTudoNoDjen } from "@/lib/djen/comunica";
import { acaoImportarIntimacoes, acaoAbrirIntimacao } from "@/lib/acoes/djen";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";

export const metadata: Metadata = { title: "Meus processos · DJEN" };
export const dynamic = "force-dynamic";
// A API do DJEN só aceita acessos do Brasil — esta página roda na
// região São Paulo da Vercel para egressar com IP brasileiro.
export const preferredRegion = "gru1";
export const runtime = "nodejs";
// Busca pode demorar; damos folga ao tempo da função.
export const maxDuration = 60;

function dataDjen(iso: string): string {
  // A API devolve "AAAA-MM-DD"; reaproveitamos o formatador com meio-dia UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return formatarData(new Date(`${iso}T12:00:00Z`));
  return iso || "—";
}

// Quantas intimações já estão guardadas no banco PARA ESTE USUÁRIO
// (isolamento: cada advogado só conta as suas). Protegido: sem banco
// configurado, a busca ao DJEN continua funcionando (degrada com elegância).
async function contarSalvas(usuarioId: string): Promise<number> {
  try {
    return await bd.intimacao.count({ where: { usuarioId } });
  } catch {
    return 0;
  }
}

export default async function PaginaDjen({
  searchParams,
}: {
  searchParams: Promise<{
    oab?: string;
    uf?: string;
    buscar?: string;
    novas?: string;
    recebidas?: string;
    erroImport?: string;
  }>;
}) {
  const usuario = await exigirUsuario();
  const { oab, uf, buscar, novas, recebidas, erroImport } = await searchParams;
  const oabAtual = (oab ?? process.env.ADVOGADO_OAB ?? "").replace(/\D/g, "");
  const ufAtual = (uf ?? process.env.ADVOGADO_UF ?? "ES").toUpperCase();
  const nome = process.env.ADVOGADO_NOME;

  const deveBuscar = buscar === "1" && Boolean(oabAtual);
  // Busca paginada (não só a 1ª página) e com janela recente — para a tela
  // mostrar tudo o que a importação vê, sem uma publicação escapar por estar
  // além dos primeiros 30 resultados.
  const resultado = deveBuscar ? await buscarTudoNoDjen(oabAtual, ufAtual, { maxPaginas: 15 }) : null;
  const jaSalvas = await contarSalvas(usuario.id);

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Meus processos · DJEN</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Captura oficial das suas intimações pela OAB, direto do Diário de Justiça Eletrônico
        Nacional (CNJ).
        {jaSalvas > 0 && (
          <>
            {" "}
            · <b className="text-tinta">{jaSalvas.toLocaleString("pt-BR")}</b> já no sistema
          </>
        )}
      </p>

      <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
        📡 Fonte: <b>API Comunica / DJEN (CNJ)</b> — busca as comunicações processuais publicadas
        para a sua OAB. Roda na <b>região São Paulo</b> porque o CNJ só aceita acessos do Brasil.
      </div>

      <form
        action="/djen"
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-borda bg-superficie p-4"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">Número da OAB</span>
          <input
            name="oab"
            defaultValue={oabAtual}
            inputMode="numeric"
            placeholder="Ex.: 12345"
            className="w-40 rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">UF</span>
          <input
            name="uf"
            defaultValue={ufAtual}
            maxLength={2}
            placeholder="ES"
            className="w-20 rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] uppercase outline-none focus:border-verde"
          />
        </label>
        <input type="hidden" name="buscar" value="1" />
        <button
          type="submit"
          className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          🔎 Buscar meus processos
        </button>
        {nome && (
          <span className="text-[11.5px] text-suave">
            advogado(a): <b className="text-tinta">{nome}</b>
          </span>
        )}
      </form>

      {novas != null && (
        <div className="mb-3.5 rounded-lg border border-[#BFD8BF] bg-selo-verde px-3 py-2 text-[12.5px] text-sucesso-escuro">
          📥 Importadas <b>{novas}</b> nova{novas === "1" ? "" : "s"}
          {recebidas ? <> de {recebidas} comunicações lidas</> : null} — as repetidas foram ignoradas.
        </div>
      )}
      {erroImport && (
        <div className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erroImport}
        </div>
      )}

      {!resultado && (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[14px] font-semibold text-navy">
            Busque suas intimações e processos pela OAB
          </p>
          <p className="mx-auto mt-1 max-w-lg text-[12.5px] text-suave">
            O sistema consulta o DJEN e traz as comunicações publicadas para a OAB informada —
            cada uma com o número do processo. Depois de buscar, você pode importar tudo para o
            sistema; a busca automática de tempos em tempos vem em seguida.
          </p>
        </div>
      )}

      {resultado?.erro && (
        <p className="rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {resultado.erro}
        </p>
      )}

      {resultado && !resultado.erro && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Selo tom="navy">
              {resultado.total.toLocaleString("pt-BR")} comunicaç{resultado.total === 1 ? "ão" : "ões"}
            </Selo>
            <Selo tom="verde">
              {resultado.processosUnicos.length} processo{resultado.processosUnicos.length === 1 ? "" : "s"} distinto{resultado.processosUnicos.length === 1 ? "" : "s"}
            </Selo>
            <span className="text-xs text-suave">OAB/{ufAtual} {oabAtual}</span>
            {resultado.comunicacoes.length > 0 && (
              <form action={acaoImportarIntimacoes} className="ml-auto">
                <input type="hidden" name="oab" value={oabAtual} />
                <input type="hidden" name="uf" value={ufAtual} />
                <button
                  type="submit"
                  className="rounded-lg border border-verde bg-selo-azul px-3 py-1.5 text-[12px] font-semibold text-verde-escuro hover:bg-verde hover:text-white"
                >
                  📥 Importar para o sistema
                </button>
              </form>
            )}
          </div>

          {resultado.comunicacoes.length === 0 ? (
            <div className="rounded-xl border border-borda bg-superficie p-6 text-center text-[12.5px] text-suave">
              Nenhuma comunicação encontrada para esta OAB no período consultado.
            </div>
          ) : (
            <ul className="space-y-3">
              {resultado.comunicacoes.map((c) => (
                <li key={c.id} className="rounded-xl border border-borda bg-superficie p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-navy">
                      {c.numeroProcesso || "processo não informado"}
                    </span>
                    {c.tipo && <Selo tom="vermelho">{c.tipo}</Selo>}
                    {c.tribunal && <Selo tom="cinza">{c.tribunal}</Selo>}
                    {c.data && <span className="text-xs text-suave">{dataDjen(c.data)}</span>}
                  </div>
                  {(c.orgao || c.classe) && (
                    <p className="mt-1.5 text-[12.5px] text-tinta">
                      {[c.orgao, c.classe].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {c.resumo && <p className="mt-1.5 text-xs leading-relaxed text-suave">{c.resumo}</p>}

                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    {c.teor.length > c.resumo.length && (
                      <details className="min-w-0 text-xs">
                        <summary className="cursor-pointer font-semibold text-verde-escuro">
                          ler publicação inteira
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-tinta">{c.teor}</p>
                      </details>
                    )}
                    <form action={acaoAbrirIntimacao} className="ml-auto shrink-0">
                      <input type="hidden" name="djenId" value={c.id} />
                      <input type="hidden" name="numeroProcesso" value={c.numeroProcesso} />
                      <input type="hidden" name="tribunal" value={c.tribunal} />
                      <input type="hidden" name="tipo" value={c.tipo} />
                      <input type="hidden" name="orgao" value={c.orgao} />
                      <input type="hidden" name="classe" value={c.classe} />
                      <input type="hidden" name="resumo" value={c.resumo} />
                      <input type="hidden" name="teor" value={c.teor} />
                      <input type="hidden" name="data" value={c.data} />
                      <input type="hidden" name="oab" value={oabAtual} />
                      <input type="hidden" name="uf" value={ufAtual} />
                      <button
                        type="submit"
                        className="rounded-lg border border-[#D9CFF0] bg-ia-fundo px-3 py-1.5 text-[11.5px] font-semibold text-ia-tinta hover:brightness-95"
                      >
                        ✨ Ver publicação e resumo da IA
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 flex items-center gap-2 text-[11.5px] text-suave">
            <SeloIA>automático</SeloIA>
            toda manhã (08h) o sistema varre sozinho a sua OAB e guarda as novidades.
          </p>
        </>
      )}
    </div>
  );
}
