"use client";

/*
 * Navegação lateral do sistema.
 *
 * Este é um "componente de cliente" ("use client"): ele roda no navegador
 * porque precisa saber qual página está aberta (usePathname) para
 * destacar o item ativo. Em telas estreitas mostra só os ícones.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { rotulo: "Painel", href: "/", Icone: IconePainel },
  { rotulo: "Processos", href: "/processos", Icone: IconeProcessos },
  { rotulo: "Clientes", href: "/clientes", Icone: IconeClientes },
  { rotulo: "Prazos", href: "/prazos", Icone: IconePrazos },
];

export function BarraLateral() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col bg-lateral md:w-64">
      <div className="flex items-center justify-center gap-3 border-b border-white/10 p-4 md:justify-start md:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-acento text-lg font-bold text-white">
          J
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-white">Juridico</p>
          <p className="text-xs text-lateral-tinta">gestão jurídica</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {itens.map(({ rotulo, href, Icone }) => {
          const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:justify-start ${
                ativo
                  ? "bg-lateral-hover text-white"
                  : "text-lateral-tinta hover:bg-lateral-hover hover:text-white"
              }`}
            >
              <Icone />
              <span className="hidden md:inline">{rotulo}</span>
            </Link>
          );
        })}
      </nav>

      <p className="mt-auto hidden p-5 text-[11px] text-lateral-tinta/70 md:block">
        Fase 1 · dados de exemplo
      </p>
    </aside>
  );
}

/* Ícones desenhados à mão em SVG, herdando a cor do texto (currentColor). */

function IconePainel() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconeProcessos() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
}

function IconeClientes() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconePrazos() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}
