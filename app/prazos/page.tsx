import type { Metadata } from "next";
import { ChipPrazo } from "@/components/ChipPrazo";
import { processoPorId, prazosConcluidos, prazosPendentes } from "@/lib/dados";
import { formatarData } from "@/lib/formatar";

export const metadata: Metadata = { title: "Prazos" };

export default function PaginaPrazos() {
  const pendentes = prazosPendentes();
  const concluidos = prazosConcluidos();

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Prazos</h1>
        <p className="mt-1 text-sm text-tinta-2">
          {pendentes.length} prazos pendentes, do mais urgente para o mais distante.
        </p>
      </header>

      <section className="mt-6 rounded-xl border border-borda bg-superficie">
        <ul>
          {pendentes.map((prazo) => {
            const processo = processoPorId(prazo.processoId);
            return (
              <li
                key={prazo.id}
                className="flex items-center gap-4 border-b border-borda px-5 py-4 last:border-b-0"
              >
                <div className="w-24 shrink-0 rounded-lg border border-borda bg-plano px-2 py-1.5 text-center tabular-nums">
                  <p className="text-sm font-semibold">{formatarData(prazo.data)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{prazo.descricao}</p>
                  <p className="mt-0.5 truncate text-xs text-suave">
                    {processo?.numero} · {processo?.titulo}
                  </p>
                </div>
                <ChipPrazo dataIso={prazo.data} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-tinta-2">Concluídos</h2>
        <ul className="mt-3 rounded-xl border border-borda bg-superficie">
          {concluidos.map((prazo) => {
            const processo = processoPorId(prazo.processoId);
            return (
              <li
                key={prazo.id}
                className="flex items-center gap-3 border-b border-borda px-5 py-3 text-sm text-suave last:border-b-0"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="tabular-nums">{formatarData(prazo.data)}</span>
                <span className="min-w-0 truncate">
                  {prazo.descricao} · {processo?.numero}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
