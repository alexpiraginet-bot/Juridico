"use client";

/*
 * Navegação lateral do LexFlow — as seções do protótipo, mais as telas
 * de dados reais que fomos acrescentando (Jurisprudência, Meus processos).
 * Componente de cliente: usa usePathname para destacar o item ativo.
 * Em telas estreitas mostra só os ícones.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usuario } from "@/lib/dados";

const itens = [
  { rotulo: "Dashboard", href: "/", icone: "📊" },
  { rotulo: "Atendimentos", href: "/atendimentos", icone: "💬" },
  { rotulo: "Clientes", href: "/clientes", icone: "👤" },
  { rotulo: "Processos", href: "/processos", icone: "⚖️" },
  { rotulo: "Intimações", href: "/intimacoes", icone: "📨" },
  { rotulo: "Meus processos", href: "/djen", icone: "📡" },
  { rotulo: "Jurisprudência", href: "/jurisprudencia", icone: "📚" },
  { rotulo: "Prazos", href: "/prazos", icone: "⏱️" },
  { rotulo: "Tarefas", href: "/tarefas", icone: "🗂️" },
  { rotulo: "Minutas IA", href: "/minutas", icone: "✍️" },
  { rotulo: "Usuários", href: "/usuarios", icone: "👥" },
  { rotulo: "Credenciais", href: "/credenciais", icone: "🔑" },
];

export function BarraLateral() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col bg-navy md:w-56">
      <div className="px-3 pb-4 pt-5 text-center md:px-5 md:text-left">
        <p className="text-xl font-bold tracking-wide text-white">
          <span className="md:hidden">
            L<span className="text-verde">F</span>
          </span>
          <span className="hidden md:inline">
            Lex<span className="text-verde">Flow</span>
          </span>
        </p>
        <p className="hidden text-[10px] tracking-[1px] text-[#8fa0b8] md:block">
          GESTÃO JURÍDICA · IA
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5">
        {itens.map(({ rotulo, href, icone }) => {
          const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] md:justify-start ${
                ativo
                  ? "bg-verde font-semibold text-white"
                  : "text-navy-tinta hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-[15px]">{icone}</span>
              <span className="hidden md:inline">{rotulo}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-white/10 px-4 py-3.5 text-xs text-[#9db0c6] md:block">
        <b className="block text-[13px] font-semibold text-white">{usuario.nome}</b>
        {usuario.cargo}
      </div>
    </aside>
  );
}
