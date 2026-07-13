/*
 * Calendário mensal dos prazos — a visão visual da aba de Prazos.
 * Componente de servidor (sem JS no cliente): a navegação de mês é por link
 * (?mes=AAAA-MM). Mostra os prazos reais do banco no dia do vencimento,
 * com cor por situação.
 *
 * Datas: o vencimento é "data pura" (meia-noite UTC), então agrupamos por
 * componentes UTC (igual ao resto do app). Já o "hoje" é o dia no fuso de
 * Brasília — o dia que o usuário enxerga.
 */
import Link from "next/link";

export type PrazoCalendario = {
  id: string;
  vencimento: Date;
  descricao: string;
  validado: boolean;
  concluido: boolean;
  responsavel: string | null;
  processo: { numero: string; titulo: string };
};

const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const doisDigitos = (n: number) => String(n).padStart(2, "0");

// Chave AAAA-MM-DD de uma data-pura (vem à meia-noite UTC).
function chaveDia(d: Date): string {
  return `${d.getUTCFullYear()}-${doisDigitos(d.getUTCMonth() + 1)}-${doisDigitos(d.getUTCDate())}`;
}

// Hoje (AAAA-MM-DD) no fuso de Brasília — o "hoje" do usuário.
export function hojeEmBrasilia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function mesDeHoje(): string {
  return hojeEmBrasilia().slice(0, 7);
}

function deslocarMes(mes: string, delta: number): string {
  const [ano, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(ano, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${doisDigitos(d.getUTCMonth() + 1)}`;
}

// Cor/estilo do chip conforme a situação do prazo.
function estiloDoPrazo(p: PrazoCalendario, hoje: string): { chip: string; ponto: string } {
  if (p.concluido) return { chip: "bg-selo-cinza text-suave line-through", ponto: "bg-suave" };
  if (chaveDia(p.vencimento) < hoje) return { chip: "bg-selo-vermelho text-vermelho", ponto: "bg-vermelho" };
  if (!p.validado) return { chip: "bg-selo-ambar text-ambar", ponto: "bg-ambar" };
  return { chip: "bg-selo-verde text-verde-escuro", ponto: "bg-verde" };
}

export function CalendarioPrazos({ prazos, mes }: { prazos: PrazoCalendario[]; mes: string }) {
  const hoje = hojeEmBrasilia();
  const [ano, mesN] = mes.split("-").map(Number);
  const primeiroDia = new Date(Date.UTC(ano, mesN - 1, 1));
  const inicioSemana = primeiroDia.getUTCDay(); // 0 = domingo
  const diasNoMes = new Date(Date.UTC(ano, mesN, 0)).getUTCDate();
  const nomeMesBruto = primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  const nomeMes = nomeMesBruto.charAt(0).toUpperCase() + nomeMesBruto.slice(1); // "Julho de 2026"

  // Agrupa os prazos por dia de vencimento.
  const porDia = new Map<string, PrazoCalendario[]>();
  for (const p of prazos) {
    const k = chaveDia(p.vencimento);
    const lista = porDia.get(k);
    if (lista) lista.push(p);
    else porDia.set(k, [p]);
  }

  // Células da grade: brancos antes do dia 1 e depois, completando as semanas.
  const celulas: (number | null)[] = [];
  for (let i = 0; i < inicioSemana; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d);
  while (celulas.length % 7 !== 0) celulas.push(null);

  const link = (m: string) => `/prazos?vista=calendario&mes=${m}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={link(deslocarMes(mes, -1))}
            aria-label="Mês anterior"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-borda text-suave hover:bg-plano"
          >
            ‹
          </Link>
          <span className="min-w-40 text-center text-[13.5px] font-bold text-navy">{nomeMes}</span>
          <Link
            href={link(deslocarMes(mes, 1))}
            aria-label="Próximo mês"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-borda text-suave hover:bg-plano"
          >
            ›
          </Link>
        </div>
        {mes !== mesDeHoje() && (
          <Link
            href="/prazos?vista=calendario"
            className="rounded-lg border border-borda px-3 py-1.5 text-[12px] font-semibold text-tinta hover:bg-plano"
          >
            Hoje
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] overflow-hidden rounded-xl border border-borda bg-superficie">
          <div className="grid grid-cols-7 border-b border-borda bg-plano">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-suave">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {celulas.map((dia, i) => {
              const chave = dia ? `${ano}-${doisDigitos(mesN)}-${doisDigitos(dia)}` : null;
              const doDia = chave ? porDia.get(chave) ?? [] : [];
              const ehHoje = chave === hoje;
              const ultimaColuna = i % 7 === 6;
              return (
                <div
                  key={i}
                  className={`min-h-[108px] border-b border-plano-2 p-1.5 ${ultimaColuna ? "" : "border-r"} ${dia ? "" : "bg-plano/50"}`}
                >
                  {dia && (
                    <>
                      <div
                        className={`mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[12px] font-bold tabular-nums ${
                          ehHoje ? "bg-navy text-white" : "text-tinta"
                        }`}
                      >
                        {dia}
                      </div>
                      <div className="space-y-1">
                        {doDia.slice(0, 3).map((p) => {
                          const e = estiloDoPrazo(p, hoje);
                          return (
                            <div
                              key={p.id}
                              title={`${p.descricao} · ${p.processo.numero}${p.responsavel ? ` · ${p.responsavel}` : ""}`}
                              className={`truncate rounded px-1.5 py-0.5 text-[10.5px] font-semibold ${e.chip}`}
                            >
                              {p.descricao}
                            </div>
                          );
                        })}
                        {doDia.length > 3 && (
                          <div className="px-1 text-[10px] font-medium text-suave">+{doDia.length - 3} mais</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-suave">
        {[
          ["bg-verde", "validado"],
          ["bg-ambar", "pendente de validação"],
          ["bg-vermelho", "atrasado"],
          ["bg-suave", "concluído"],
        ].map(([cor, rotulo]) => (
          <span key={rotulo} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${cor}`} /> {rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}
