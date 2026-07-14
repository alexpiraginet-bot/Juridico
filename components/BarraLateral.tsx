"use client";

/*
 * Navegação lateral — identidade LEX TECHNOLOGY (feel iOS 26):
 * símbolo MarcaX + wordmark "LEX / TECHNOLOGY", fundo navy profundo com
 * dois brilhos sutis (azul/violeta) da marca, e item ativo em pílula com
 * o degradê da marca + halo. Ciente do papel: super-admin vê só a Central;
 * o dono vê tudo + Usuários/Credenciais; os demais veem as telas do dia a dia.
 * Componente de cliente: usa usePathname para destacar o item ativo.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarcaX } from "@/components/MarcaX";

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

// Brilhos sutis azul/violeta da marca sobre o navy profundo (feel iOS 26).
const fundoBarra =
  "radial-gradient(360px 300px at 92% -6%, rgba(124,58,237,.22), transparent 62%)," +
  "radial-gradient(320px 340px at 4% 106%, rgba(46,125,255,.18), transparent 60%)";

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
  const inicial = nome.trim().charAt(0).toUpperCase() || "•";

  return (
    <aside
      className="flex h-screen w-16 shrink-0 flex-col bg-navy md:w-56"
      style={{ backgroundImage: fundoBarra }}
    >
      <div className="flex items-center justify-center gap-2.5 px-2 pb-4 pt-5 md:justify-start md:px-5">
        <MarcaX tamanho={30} brilho />
        <div className="hidden leading-tight md:block">
          <p className="text-[16px] font-bold tracking-wide text-white">
            Lex<span className="text-grad-lex">Flow</span>
          </p>
          <p className="mt-0.5 text-[8.5px] font-semibold tracking-[0.3em] text-[#8fa0b8]">
            LEX TECHNOLOGY
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5">
        {visiveis.map(({ rotulo, href, icone }) => {
          const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={`flex items-center justify-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] transition-colors md:justify-start ${
                ativo
                  ? "grad-lex font-semibold text-white shadow-[0_6px_18px_-8px_rgba(46,125,255,.75)] ring-1 ring-inset ring-white/15"
                  : "text-navy-tinta hover:bg-white/[.06] hover:text-white"
              }`}
            >
              <span className="text-[15px]">{icone}</span>
              <span className="hidden md:inline">{rotulo}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-2.5 border-t border-white/10 px-4 py-3.5 md:flex">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-[12px] font-bold text-white ring-1 ring-inset ring-white/15 grad-lex">
          {inicial}
        </span>
        <div className="min-w-0">
          <b className="block truncate text-[13px] font-semibold text-white">{nome}</b>
          <span className="block truncate text-[11px] text-[#9db0c6]">{subtitulo}</span>
        </div>
      </div>
    </aside>
  );
}
