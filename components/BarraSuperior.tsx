"use client";

/*
 * Barra superior: busca (demonstração), atalho para a apresentação,
 * o escritório e o usuário logado, com o botão Sair.
 */

import { sair } from "@/lib/acoes/auth";
import { useAviso } from "./useAviso";

export function BarraSuperior({
  nome,
  teamNome,
  teamLogo,
}: {
  nome: string;
  teamNome: string | null;
  teamLogo: string | null;
}) {
  const { avisar, elemento } = useAviso();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-borda bg-superficie px-4 md:px-5">
      <div className="relative hidden w-full max-w-md sm:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] opacity-60">
          🔎
        </span>
        <input
          className="w-full rounded-lg border border-borda bg-plano py-2 pl-9 pr-3 text-[13px] outline-none placeholder:text-suave"
          placeholder="Busque: 'processos com tese de dano moral'…"
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              avisar("🔎 Pesquisa inteligente: 3 processos encontrados com essa tese (demonstração)");
            }
          }}
        />
      </div>

      <a
        href="/prototipo.html"
        target="_blank"
        rel="noopener"
        className="ml-auto hidden whitespace-nowrap rounded-lg border border-borda px-3 py-1.5 text-[11.5px] font-semibold hover:bg-plano md:inline"
      >
        ▶ Apresentação
      </a>

      <button
        type="button"
        className="relative shrink-0 cursor-pointer text-lg sm:ml-1"
        onClick={() => avisar("3 notificações: 1 prazo a validar · 2 intimações novas")}
        aria-label="Notificações"
      >
        🔔
        <i className="absolute -right-1.5 -top-1 rounded-full bg-vermelho px-1.5 py-px text-[9.5px] font-bold not-italic text-white">
          3
        </i>
      </button>

      <div className="ml-1 flex shrink-0 items-center gap-2">
        {teamLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teamLogo}
            alt=""
            className="h-8 w-8 rounded-lg border border-borda object-cover"
          />
        ) : null}
        <div className="hidden text-right leading-tight md:block">
          <b className="block max-w-[150px] truncate text-[12px] text-navy">{nome}</b>
          {teamNome && <span className="block max-w-[150px] truncate text-[10.5px] text-suave">{teamNome}</span>}
        </div>
        <form action={sair}>
          <button
            type="submit"
            className="rounded-lg border border-borda px-2.5 py-1.5 text-[11.5px] font-semibold text-tinta hover:bg-plano"
          >
            Sair
          </button>
        </form>
      </div>

      {elemento}
    </header>
  );
}
