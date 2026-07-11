import type { Metadata } from "next";
import { Selo } from "@/components/Selo";
import { agendaSemana, prazosJudiciais } from "@/lib/dados";
import type { TomSelo } from "@/lib/tipos";

export const metadata: Metadata = { title: "Prazos" };

const corEvento: Record<TomSelo, string> = {
  verde: "bg-selo-verde text-verde-escuro",
  ambar: "bg-selo-ambar text-ambar",
  vermelho: "bg-selo-vermelho text-vermelho",
  azul: "bg-selo-azul text-azul",
  cinza: "bg-selo-cinza text-[#666666]",
  navy: "bg-selo-navy text-navy",
};

export default function PaginaPrazos() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Prazos & Agenda</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Semana de 13 a 17 de julho · prazos validados entram automaticamente aqui
      </p>

      <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
        ⏳ 1 prazo aguardando validação na aba Intimações — prazos não validados não entram na
        agenda oficial.
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {agendaSemana.map((dia) => (
          <div key={dia.dia} className="min-h-[130px] rounded-xl border border-borda bg-superficie p-2">
            <h6 className="mb-1.5 text-[11px] font-semibold text-suave">{dia.dia}</h6>
            {dia.eventos.map((evento) => (
              <div
                key={evento.texto}
                className={`mb-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${corEvento[evento.tom]}`}
              >
                {evento.texto}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3.5 overflow-x-auto rounded-xl border border-borda bg-superficie p-4">
        <h3 className="mb-3 text-[13px] font-bold text-navy">⏱️ Prazos judiciais em aberto</h3>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-borda text-left text-[11px] uppercase tracking-wide text-suave">
              <th className="px-2.5 py-2 font-semibold">Vencimento</th>
              <th className="px-2.5 py-2 font-semibold">Providência</th>
              <th className="px-2.5 py-2 font-semibold">Processo</th>
              <th className="px-2.5 py-2 font-semibold">Responsável</th>
              <th className="px-2.5 py-2 font-semibold">Status</th>
              <th className="px-2.5 py-2 font-semibold">Alertas</th>
            </tr>
          </thead>
          <tbody>
            {prazosJudiciais.map((prazo) => (
              <tr key={prazo.processo + prazo.vencimento} className="border-b border-plano-2 last:border-b-0">
                <td className="px-2.5 py-2.5 font-bold">{prazo.vencimento}</td>
                <td className="px-2.5 py-2.5">{prazo.providencia}</td>
                <td className="px-2.5 py-2.5">{prazo.processo}</td>
                <td className="px-2.5 py-2.5">{prazo.responsavel}</td>
                <td className="px-2.5 py-2.5">
                  <Selo tom={prazo.status.tom}>{prazo.status.texto}</Selo>
                </td>
                <td className="whitespace-nowrap px-2.5 py-2.5 text-suave">{prazo.alertas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
