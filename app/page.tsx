import Link from "next/link";
import { CartaoIndicador } from "@/components/CartaoIndicador";
import { ChipPrazo } from "@/components/ChipPrazo";
import { SeloStatus } from "@/components/SeloStatus";
import {
  clientes,
  processoPorId,
  processos,
  clientePorId,
  prazosPendentes,
} from "@/lib/dados";
import {
  diasAte,
  formatarDataCurta,
  formatarMoedaCompacta,
  primeiraMaiuscula,
} from "@/lib/formatar";

export default function PaginaPainel() {
  const ativos = processos.filter((processo) => processo.status === "ativo");
  const pendentes = prazosPendentes();
  const prazosDaSemana = pendentes.filter((prazo) => diasAte(prazo.data) <= 7);
  const valorEmCausa = ativos.reduce((soma, processo) => soma + processo.valorCausa, 0);

  const hoje = primeiraMaiuscula(
    new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );

  const processosRecentes = [...processos]
    .sort((a, b) => b.aberturaEm.localeCompare(a.aberturaEm))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="text-2xl font-semibold">Painel</h1>
        <p className="mt-1 text-sm text-tinta-2">{hoje}</p>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoIndicador
          rotulo="Processos ativos"
          valor={String(ativos.length)}
          apoio={`de ${processos.length} cadastrados`}
        />
        <CartaoIndicador
          rotulo="Clientes"
          valor={String(clientes.length)}
          apoio="pessoas físicas e jurídicas"
        />
        <CartaoIndicador
          rotulo="Prazos nos próximos 7 dias"
          valor={String(prazosDaSemana.length)}
          apoio={`de ${pendentes.length} pendentes`}
        />
        <CartaoIndicador
          rotulo="Valor em causa"
          valor={formatarMoedaCompacta(valorEmCausa)}
          apoio="soma dos processos ativos"
        />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-borda bg-superficie">
          <header className="flex items-baseline justify-between border-b border-borda px-5 py-4">
            <h2 className="font-semibold">Próximos prazos</h2>
            <Link href="/prazos" className="text-sm font-medium text-acento hover:underline">
              ver todos
            </Link>
          </header>
          <ul>
            {pendentes.slice(0, 5).map((prazo) => {
              const processo = processoPorId(prazo.processoId);
              return (
                <li
                  key={prazo.id}
                  className="flex items-center justify-between gap-4 border-b border-borda px-5 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{prazo.descricao}</p>
                    <p className="mt-0.5 truncate text-xs text-suave">
                      {formatarDataCurta(prazo.data)} · {processo?.numero}
                    </p>
                  </div>
                  <ChipPrazo dataIso={prazo.data} />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-borda bg-superficie">
          <header className="flex items-baseline justify-between border-b border-borda px-5 py-4">
            <h2 className="font-semibold">Processos recentes</h2>
            <Link href="/processos" className="text-sm font-medium text-acento hover:underline">
              ver todos
            </Link>
          </header>
          <ul>
            {processosRecentes.map((processo) => (
              <li
                key={processo.id}
                className="flex items-center justify-between gap-4 border-b border-borda px-5 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{processo.titulo}</p>
                  <p className="mt-0.5 truncate text-xs text-suave">
                    {clientePorId(processo.clienteId)?.nome} · {processo.area}
                  </p>
                </div>
                <SeloStatus status={processo.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
