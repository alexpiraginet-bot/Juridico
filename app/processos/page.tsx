import type { Metadata } from "next";
import Link from "next/link";
import { LinhaDoTempo } from "@/components/LinhaDoTempo";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import { detalheProcesso, filtrosProcessos, processos } from "@/lib/dados";

export const metadata: Metadata = { title: "Processos" };

export default function PaginaProcessos() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Processos</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Carteira monitorada automaticamente · capa enriquecida pelo nº CNJ
      </p>

      <div className="mb-3.5 flex flex-wrap gap-2">
        {filtrosProcessos.map((filtro) => (
          <Selo key={filtro.texto} tom={filtro.tom}>
            {filtro.texto}
          </Selo>
        ))}
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-xl border border-borda bg-superficie p-4">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-borda text-left text-[11px] uppercase tracking-wide text-suave">
                <th className="px-2.5 py-2 font-semibold">Processo</th>
                <th className="px-2.5 py-2 font-semibold">Cliente</th>
                <th className="px-2.5 py-2 font-semibold">Tribunal</th>
                <th className="px-2.5 py-2 font-semibold">Fase</th>
                <th className="px-2.5 py-2 font-semibold">Último evento</th>
              </tr>
            </thead>
            <tbody>
              {processos.map((processo) => (
                <tr
                  key={processo.id}
                  className={`border-b border-plano-2 last:border-b-0 hover:bg-realce ${
                    processo.destaque ? "bg-realce" : ""
                  }`}
                >
                  <td className="whitespace-nowrap px-2.5 py-2.5 font-bold">{processo.numero}</td>
                  <td className="px-2.5 py-2.5">{processo.cliente}</td>
                  <td className="whitespace-nowrap px-2.5 py-2.5">{processo.tribunal}</td>
                  <td className="px-2.5 py-2.5">
                    <Selo tom={processo.fase.tom}>{processo.fase.texto}</Selo>
                  </td>
                  <td className="px-2.5 py-2.5">
                    {typeof processo.ultimoEvento === "string" ? (
                      processo.ultimoEvento
                    ) : (
                      <Selo tom={processo.ultimoEvento.tom}>{processo.ultimoEvento.texto}</Selo>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-2 flex flex-wrap items-center gap-2 text-[13px] font-bold text-navy">
            ⚖️ Proc. {detalheProcesso.numero}
            <SeloIA>linha do tempo unificada</SeloIA>
          </h3>
          <p className="mb-2.5 text-xs text-suave">{detalheProcesso.resumo}</p>
          <LinhaDoTempo eventos={detalheProcesso.timeline} />
          <div className="mt-3 flex gap-2">
            <Link
              href="/minutas"
              className="rounded-lg bg-verde px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Abrir minuta IA
            </Link>
            <Link
              href="/intimacoes"
              className="rounded-lg border border-borda px-3 py-1.5 text-[11.5px] font-semibold hover:bg-plano"
            >
              Ver intimação
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
