import type { Metadata } from "next";
import { PainelAtendimentos } from "./PainelAtendimentos";
import { bd } from "@/lib/bd";
import { exigirUsuario } from "@/lib/auth";
import { conversas as conversasDemo } from "@/lib/dados";
import type { ConversaPainel, Mensagem } from "@/lib/tipos";

export const metadata: Metadata = { title: "Atendimentos" };
export const dynamic = "force-dynamic";

function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function hhmm(data: Date): string {
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default async function PaginaAtendimentos() {
  const usuario = await exigirUsuario();

  // Conversas reais do escritório (isolamento por Team). Sem banco/sem Team,
  // cai no mundo de demonstração — nada quebra.
  let reais: ConversaPainel[] = [];
  try {
    if (usuario.teamId) {
      const linhas = await bd.conversaWhatsapp.findMany({
        where: { teamId: usuario.teamId },
        include: { mensagens: { orderBy: { enviadoEm: "asc" } } },
        orderBy: { atualizadoEm: "desc" },
        take: 50,
      });
      reais = linhas.map((c) => {
        const nome = c.nomeContato ?? `+${c.telefone}`;
        const mensagens: Mensagem[] = c.mensagens.map((m) => ({
          de: m.direcao === "RECEBIDA" ? "cliente" : "escritorio",
          texto: m.texto,
          hora: hhmm(m.enviadoEm),
        }));
        const ultima = c.mensagens[c.mensagens.length - 1];
        return {
          id: c.id,
          nome,
          iniciais: iniciaisDe(nome),
          contexto: `WhatsApp Business · +${c.telefone}`,
          previa: ultima?.texto ?? "—",
          horario: ultima ? hhmm(ultima.enviadoEm) : "",
          situacao: { texto: "WhatsApp", tom: "verde" },
          telefone: c.telefone,
          mensagens,
          analiseDemo: null,
        };
      });
    }
  } catch {
    reais = [];
  }

  const demo = reais.length === 0;
  const conversas: ConversaPainel[] = demo
    ? conversasDemo.map((c) => ({
        id: String(c.id),
        nome: c.nome,
        iniciais: c.iniciais,
        contexto: c.contexto,
        previa: c.previa,
        horario: c.horario,
        situacao: c.situacao,
        telefone: null,
        mensagens: c.mensagens,
        analiseDemo: {
          relatoFatico: c.relatoFatico,
          linhaDoTempo: c.linhaDoTempo,
          checklist: c.checklist,
          percentualDocs: c.percentualDocs,
          perguntas: c.perguntas,
        },
      }))
    : reais;

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Atendimentos · WhatsApp</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Inbox oficial multiatendente — cada conversa vinculada a cliente, caso e responsável
      </p>

      {demo && (
        <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
          💬 Modo demonstração. Configure o WhatsApp (veja{" "}
          <code className="rounded bg-white/60 px-1">docs/whatsapp-configuracao.md</code> e a tela de{" "}
          <b>Credenciais</b>) para ver aqui as conversas reais do escritório.
        </div>
      )}

      <PainelAtendimentos conversas={conversas} demo={demo} />
    </div>
  );
}
