/*
 * Recebimento de mensagens do WhatsApp — transforma o payload do webhook
 * (Meta Cloud API) em linhas no banco. Fica fora da rota para poder ser
 * testado isolado.
 *
 * Deduplicação em duas camadas: a conversa é única por (telefone, número de
 * negócio); a mensagem é única por `waMessageId`. O webhook pode reentregar o
 * mesmo evento — nada entra duas vezes.
 */

import { bd } from "@/lib/bd";

// Formato (parcial) do que o WhatsApp manda. Só lemos o que usamos.
interface EventoWhatsapp {
  entry?: {
    changes?: {
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { profile?: { name?: string }; wa_id?: string }[];
        messages?: {
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }[];
      };
    }[];
  }[];
}

export interface ResultadoRecebimento {
  novas: number; // mensagens realmente gravadas (após dedup)
  conversas: number; // conversas tocadas
}

async function acharOuCriarConversa(
  telefone: string,
  phoneNumberId: string | null,
  nome: string | undefined,
) {
  const existente = await bd.conversaWhatsapp.findFirst({ where: { telefone, phoneNumberId } });
  if (existente) {
    // Atualiza o nome do contato se o WhatsApp mandou um novo.
    if (nome && existente.nomeContato !== nome) {
      return bd.conversaWhatsapp.update({ where: { id: existente.id }, data: { nomeContato: nome } });
    }
    return existente;
  }
  try {
    return await bd.conversaWhatsapp.create({
      data: { telefone, phoneNumberId, nomeContato: nome ?? null },
    });
  } catch (excecao) {
    // Corrida: outra entrega criou a mesma conversa — busca de novo.
    if ((excecao as { code?: string }).code === "P2002") {
      const achada = await bd.conversaWhatsapp.findFirst({ where: { telefone, phoneNumberId } });
      if (achada) return achada;
    }
    throw excecao;
  }
}

export async function processarEventoWhatsapp(evento: unknown): Promise<ResultadoRecebimento> {
  const e = evento as EventoWhatsapp;
  let novas = 0;
  const tocadas = new Set<string>();

  for (const entry of e.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue; // ignora eventos de status (entregue/lido)

      const phoneNumberId = value.metadata?.phone_number_id ?? null;
      const nomes = new Map<string, string>();
      for (const c of value.contacts ?? []) {
        if (c.wa_id && c.profile?.name) nomes.set(c.wa_id, c.profile.name);
      }

      for (const m of value.messages) {
        const telefone = (m.from ?? "").replace(/\D/g, "");
        if (!telefone) continue;
        const texto =
          m.type === "text" ? (m.text?.body ?? "") : `[mensagem de ${m.type ?? "tipo desconhecido"}]`;
        const enviadoEm = m.timestamp ? new Date(Number(m.timestamp) * 1000) : new Date();

        const conversa = await acharOuCriarConversa(telefone, phoneNumberId, nomes.get(telefone));
        tocadas.add(conversa.id);

        try {
          await bd.mensagemWhatsapp.create({
            data: {
              conversaId: conversa.id,
              direcao: "RECEBIDA",
              texto,
              waMessageId: m.id ?? null,
              enviadoEm,
            },
          });
          novas += 1;
        } catch (excecao) {
          // P2002 = waMessageId repetido → já temos a mensagem, ignora.
          if ((excecao as { code?: string }).code !== "P2002") throw excecao;
        }
      }
    }
  }

  return { novas, conversas: tocadas.size };
}
