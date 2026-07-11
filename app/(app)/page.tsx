import Link from "next/link";
import { CartaoKpi } from "@/components/CartaoKpi";
import { Selo } from "@/components/Selo";
import { SeloIA } from "@/components/SeloIA";
import {
  atendimentosPorArea,
  compromissos,
  exigeAtencao,
  kpis,
  produtividade,
  usuario,
} from "@/lib/dados";

export default function PaginaDashboard() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy">{usuario.saudacao}</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        {usuario.dataDeHoje} · Visão geral do escritório
      </p>

      <section className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <CartaoKpi key={kpi.rotulo} {...kpi} />
        ))}
      </section>

      <div className="grid gap-3.5 xl:grid-cols-2">
        <section className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">⚠️ Exige sua atenção</h3>
          <table className="w-full text-[13px]">
            <tbody>
              {exigeAtencao.map((item) => (
                <tr key={item.titulo} className="border-b border-plano-2 last:border-b-0">
                  <td className="py-2.5 pr-2">
                    <Selo tom={item.selo.tom}>{item.selo.texto}</Selo>
                  </td>
                  <td className="py-2.5 pr-2">
                    <b>{item.titulo}</b>
                    <br />
                    <small className="text-suave">{item.detalhe}</small>
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      href={item.href}
                      className={`inline-block rounded-lg px-3 py-1.5 text-[11.5px] font-semibold ${
                        item.primaria
                          ? "bg-verde text-white hover:bg-verde-escuro"
                          : "border border-borda hover:bg-plano"
                      }`}
                    >
                      {item.acao}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">📈 Atendimentos por área (mês)</h3>
          <div className="flex h-[150px] items-end gap-4 px-1.5 pt-2">
            {atendimentosPorArea.map((item) => (
              <div key={item.area} className="flex-1 text-center">
                <div
                  className={`${item.cor} rounded-t-md`}
                  style={{ height: `${item.altura}px` }}
                />
                <small className="text-suave">
                  {item.area}
                  <br />
                  <b className="text-tinta">{item.quantidade}</b>
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">🕓 Próximos compromissos</h3>
          <table className="w-full text-[13px]">
            <tbody>
              {compromissos.map((compromisso) => (
                <tr key={compromisso.quando} className="border-b border-plano-2 last:border-b-0">
                  <td className="whitespace-nowrap py-2.5 pr-3 align-top text-tinta">
                    {compromisso.quando}
                  </td>
                  <td className="py-2.5 pr-2">
                    <b>{compromisso.titulo}</b> — {compromisso.detalhe}
                  </td>
                  <td className="py-2.5 text-right">
                    {compromisso.ia && <SeloIA>{compromisso.ia}</SeloIA>}
                    {compromisso.selo && (
                      <Selo tom={compromisso.selo.tom}>{compromisso.selo.texto}</Selo>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-borda bg-superficie p-4">
          <h3 className="mb-3 text-[13px] font-bold text-navy">
            👥 Produtividade da equipe (semana)
          </h3>
          <table className="w-full text-[13px]">
            <tbody>
              {produtividade.map((pessoa) => (
                <tr key={pessoa.nome} className="border-b border-plano-2 last:border-b-0">
                  <td className="py-2.5 pr-2 font-bold">{pessoa.nome}</td>
                  <td className="py-2.5 pr-2 text-tinta">{pessoa.feito}</td>
                  <td className="py-2.5 text-right">
                    <Selo tom={pessoa.selo.tom}>{pessoa.selo.texto}</Selo>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
