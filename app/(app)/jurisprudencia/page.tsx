import type { Metadata } from "next";
import Link from "next/link";
import { Selo } from "@/components/Selo";
import { formatarData } from "@/lib/formatar";
import { consultarDataJud, TRIBUNAIS } from "@/lib/juris/datajud";

export const metadata: Metadata = { title: "Jurisprudência" };
export const dynamic = "force-dynamic";

const EXEMPLOS = ["dano moral", "horas extras", "execução fiscal"];

export default async function PaginaJurisprudencia({
  searchParams,
}: {
  searchParams: Promise<{ tribunal?: string; q?: string }>;
}) {
  const { tribunal, q } = await searchParams;
  const alias = TRIBUNAIS.some((t) => t.alias === tribunal) ? tribunal! : "tjes";
  const termo = (q ?? "").trim();

  const resultado = termo ? await consultarDataJud(alias, termo) : null;

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Jurisprudência & Consulta Pública</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Pesquisa em tempo real na base nacional do Judiciário — direto da fonte oficial.
      </p>

      <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
        📡 Fonte: <b>API Pública do DataJud/CNJ</b> — metadados de processos de todos os
        tribunais do país (classe, assuntos, órgão julgador e movimentos), mantidos pelo
        Conselho Nacional de Justiça.
      </div>

      <form
        action="/jurisprudencia"
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-borda bg-superficie p-4"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">Tribunal</span>
          <select
            name="tribunal"
            defaultValue={alias}
            className="rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
          >
            {TRIBUNAIS.map((t) => (
              <option key={t.alias} value={t.alias}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-56 flex-1">
          <span className="mb-1 block text-xs font-semibold text-suave">
            Assunto, classe ou número do processo
          </span>
          <input
            name="q"
            defaultValue={termo}
            placeholder="Ex.: dano moral · execução fiscal · 0708442-55.2023.8.08.0035"
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          🔎 Pesquisar
        </button>
      </form>

      {!resultado && (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center">
          <p className="text-[14px] font-semibold text-navy">
            Pesquise a base pública do Judiciário
          </p>
          <p className="mx-auto mt-1 max-w-lg text-[12.5px] text-suave">
            Digite um assunto ("dano moral"), uma classe processual ("execução fiscal") ou
            o número CNJ de um processo. Alguns exemplos para começar:
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {EXEMPLOS.map((exemplo) => (
              <Link key={exemplo} href={`/jurisprudencia?tribunal=${alias}&q=${encodeURIComponent(exemplo)}`}>
                <Selo tom="navy">{exemplo}</Selo>
              </Link>
            ))}
          </div>
        </div>
      )}

      {resultado?.erro && (
        <p className="rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {resultado.erro}
        </p>
      )}

      {resultado && !resultado.erro && (
        <>
          <p className="mb-3 text-xs text-suave">
            {resultado.total === 0
              ? `Nada encontrado para "${termo}" — tente outro termo ou tribunal.`
              : `${resultado.total.toLocaleString("pt-BR")} processo${resultado.total === 1 ? "" : "s"} encontrado${resultado.total === 1 ? "" : "s"} · mostrando ${resultado.processos.length}.`}
          </p>

          <ul className="space-y-3">
            {resultado.processos.map((processo, indice) => (
              <li key={`${processo.numero}-${indice}`} className="rounded-xl border border-borda bg-superficie p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-navy">
                    {processo.numero}
                  </span>
                  <Selo tom="azul">{processo.classe}</Selo>
                  <Selo tom="cinza">{processo.grau}</Selo>
                </div>

                <p className="mt-1.5 text-[12.5px] text-tinta">{processo.orgaoJulgador}</p>

                {processo.assuntos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {processo.assuntos.slice(0, 5).map((assunto) => (
                      <Selo key={assunto} tom="verde">
                        {assunto}
                      </Selo>
                    ))}
                    {processo.assuntos.length > 5 && (
                      <Selo tom="cinza">+{processo.assuntos.length - 5}</Selo>
                    )}
                  </div>
                )}

                <p className="mt-2 text-xs text-suave">
                  {processo.dataAjuizamento && (
                    <>Ajuizado em {formatarData(processo.dataAjuizamento)} · </>
                  )}
                  {processo.ultimoMovimento && (
                    <>
                      Último movimento: <b className="text-tinta">{processo.ultimoMovimento.nome}</b>{" "}
                      ({formatarData(processo.ultimoMovimento.data)})
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
