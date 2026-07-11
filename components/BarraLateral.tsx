"use client";

/*
 * Navegação lateral do LexFlow — agora ciente do papel do usuário:
 * o super-admin vê só a Central; o dono do escritório vê as telas do app
 * mais Usuários/Credenciais; os demais veem as telas do app.
 * Componente de cliente: usa usePathname para destacar o item ativo.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

// Papéis que enxergam as telas do dia a dia do escritório.
const EQUIPE = ["DONO_ESCRITORIO", "ADVOGADO", "ASSESSOR", "ESTAGIARIO"];

const itens = [
  { rotulo: "Dashboard", href: "/", icone: "📊", papeis: EQUIPE },
  { rotulo: "Atendimentos", href: "/atendimentos", icone: "💬", papeis: EQUIPE },
  { rotulo: "Clientes", href: "/clientes", icone: "👤", papeis: EQUIPE },
  { rotulo: "Processos", href: "/processos", icone: "⚖️", papeis: EQUIPE },
  { rotulo: "Intimações", href: "/intimacoes", icone: "📨", papeis: EQUIPE },
  { rotulo: "Meus processos", href: "/djen", icone: "📡", papeis: EQUIPE },
  { rotulo: "Jurisprudência", href: "/jurisprudencia", icone: "📚", papeis: EQUIPE },
  { rotulo: "Prazos", href: "/prazos", icone: "⏱️", papeis: EQUIPE },
  { rotulo: "Tarefas", href: "/tarefas", icone: "🗂️", papeis: EQUIPE },
  { rotulo: "Minutas IA", href: "/minutas", icone: "✍️", papeis: EQUIPE },
  { rotulo: "Usuários", href: "/usuarios", icone: "👥", papeis: ["DONO_ESCRITORIO"] },
  { rotulo: "Credenciais", href: "/credenciais", icone: "🔑", papeis: ["DONO_ESCRITORIO"] },
  { rotulo: "Auditoria", href: "/auditoria", icone: "📋", papeis: ["DONO_ESCRITORIO", "SUPERADMIN"] },
  { rotulo: "Central", href: "/central", icone: "🏛️", papeis: ["SUPERADMIN"] },
];

export function BarraLateral({
  papel,
  nome,
  subtitulo,
}: {
  papel: string;
  nome: string;
  subtitulo: string;
}) {
  const pathname = usePathname();
  const visiveis = itens.filter((i) => i.papeis.includes(papel));

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
        <p className="hidden text-[10px] tracking-[1px] text-[#8fa0b8] md:block">GESTÃO JURÍDICA · IA</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5">
        {visiveis.map(({ rotulo, href, icone }) => {
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
        <b className="block truncate text-[13px] font-semibold text-white">{nome}</b>
        <span className="truncate">{subtitulo}</span>
      </div>
    </aside>
  );
}
