"use client";

/*
 * Barra superior: busca inteligente (demonstração), selo de protótipo,
 * atalho para a apresentação original e sino de notificações.
 */

import { useAviso } from "./useAviso";

export function BarraSuperior() {
  const { avisar, elemento } = useAviso();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-borda bg-superficie px-4 md:px-5">
      <div className="relative w-full max-w-md">
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

      <span className="hidden whitespace-nowrap rounded-full border border-[#EBD7AE] bg-selo-ambar px-2.5 py-1 text-[11px] font-semibold text-ambar lg:inline">
        PROTÓTIPO — dados fictícios
      </span>

      <a
        href="/prototipo.html"
        target="_blank"
        rel="noopener"
        className="hidden whitespace-nowrap rounded-lg border border-borda px-3 py-1.5 text-[11.5px] font-semibold hover:bg-plano md:inline"
      >
        ▶ Apresentação
      </a>

      <button
        type="button"
        className="relative ml-auto shrink-0 cursor-pointer text-lg"
        onClick={() => avisar("3 notificações: 1 prazo a validar · 2 intimações novas")}
        aria-label="Notificações"
      >
        🔔
        <i className="absolute -right-1.5 -top-1 rounded-full bg-vermelho px-1.5 py-px text-[9.5px] font-bold not-italic text-white">
          3
        </i>
      </button>

      {elemento}
    </header>
  );
}
