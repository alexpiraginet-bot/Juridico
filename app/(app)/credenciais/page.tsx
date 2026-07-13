import type { Metadata } from "next";
import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Selo } from "@/components/Selo";
import { bd } from "@/lib/bd";
import { exigirDono } from "@/lib/auth";
import { alternarCredencial, criarCredencial, excluirCredencial } from "@/lib/acoes/credenciais";
import { salvarNumeroWhatsapp, salvarModeloWhatsapp, excluirModeloWhatsapp } from "@/lib/acoes/whatsapp";

export const metadata: Metadata = { title: "Credenciais jurídicas" };
export const dynamic = "force-dynamic";

const entrada =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde";

export default async function PaginaCredenciais({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const dono = await exigirDono();
  const { erro } = await searchParams;

  const [usuarios, credenciais, time, modelos] = await Promise.all([
    bd.usuario.findMany({
      where: { teamId: dono.teamId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    bd.credencialOab.findMany({
      where: { usuario: { teamId: dono.teamId } },
      orderBy: { criadoEm: "asc" },
      include: { usuario: { select: { nome: true } } },
    }),
    bd.team.findUnique({
      where: { id: dono.teamId },
      select: { whatsappPhoneNumberId: true },
    }),
    bd.modeloWhatsapp.findMany({
      where: { teamId: dono.teamId },
      orderBy: { criadoEm: "asc" },
    }),
  ]);

  const ativas = credenciais.filter((c) => c.ativa).length;

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Credenciais jurídicas</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        A OAB de cada usuário do seu escritório. Toda manhã, a captura automática do DJEN varre as
        credenciais <b>ativas</b> e traz os processos de cada um.
      </p>

      {erro && (
        <p className="mb-3.5 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      <div className="mb-3.5 rounded-lg border border-[#C9DAEA] bg-selo-azul px-3 py-2 text-[11.5px] text-azul">
        🔑 As credenciais <b>ativas</b> ({ativas}) são varridas automaticamente às <b>08h</b> (São
        Paulo). Pause uma credencial para tirá-la da automação sem apagá-la.
      </div>

      {/* Número do WhatsApp do escritório (Fase 4) */}
      <div className="mb-4 rounded-xl border border-borda bg-superficie p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold text-navy">💬 WhatsApp do escritório</span>
          <Selo tom={time?.whatsappPhoneNumberId ? "verde" : "cinza"}>
            {time?.whatsappPhoneNumberId ? "vinculado" : "não vinculado"}
          </Selo>
        </div>
        <p className="mt-1 text-[11.5px] text-suave">
          Informe a <b>identificação do número</b> (<i>phone number ID</i>) da Meta — é o que liga as
          conversas recebidas a este escritório. Passo a passo em{" "}
          <code className="rounded bg-plano px-1">docs/whatsapp-configuracao.md</code>.
        </p>
        <form action={salvarNumeroWhatsapp} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">
              Identificação do número (phone_number_id)
            </span>
            <input
              name="phoneNumberId"
              defaultValue={time?.whatsappPhoneNumberId ?? ""}
              inputMode="numeric"
              placeholder="Ex.: 123456789012345"
              className="w-72 max-w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
          >
            Salvar
          </button>
        </form>
      </div>

      {/* Modelos (templates) de mensagem do WhatsApp — para falar fora da janela de 24h */}
      <div className="mb-4 rounded-xl border border-borda bg-superficie p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold text-navy">📄 Modelos de mensagem (WhatsApp)</span>
          <Selo tom={modelos.length ? "verde" : "cinza"}>
            {modelos.length} cadastrado{modelos.length === 1 ? "" : "s"}
          </Selo>
        </div>
        <p className="mt-1 text-[11.5px] text-suave">
          Fora da <b>janela de 24h</b>, a Meta só permite enviar mensagens a partir de um{" "}
          <b>modelo aprovado</b>. Cadastre aqui os que você já aprovou na Meta — o <b>nome exato</b>,
          o idioma e o corpo. Use <code className="rounded bg-plano px-1">{"{{1}}"}</code>,{" "}
          <code className="rounded bg-plano px-1">{"{{2}}"}</code>… nos lugares que mudam.
        </p>

        <details className="mt-3 rounded-lg border border-borda">
          <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-[12.5px] font-semibold text-verde-escuro">
            ＋ Novo modelo
          </summary>
          <form action={salvarModeloWhatsapp} className="grid gap-3 border-t border-borda p-3.5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-suave">Nome do modelo (igual ao da Meta)</span>
              <input name="nome" required className={entrada} placeholder="ex.: aviso_de_prazo" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-suave">Idioma</span>
              <input name="idioma" defaultValue="pt_BR" className={entrada} placeholder="pt_BR" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-suave">Categoria</span>
              <select name="categoria" defaultValue="UTILITY" className={entrada}>
                <option value="UTILITY">Utilidade (avisos, atualizações)</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Autenticação (código)</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-suave">Corpo do modelo</span>
              <textarea
                name="corpo"
                required
                rows={3}
                className={entrada}
                placeholder="Olá {{1}}, aqui é do escritório. Seu prazo de {{2}} vence em {{3}}. Qualquer dúvida, estamos à disposição."
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
              >
                Cadastrar modelo
              </button>
            </div>
          </form>
        </details>

        {modelos.length > 0 && (
          <ul className="mt-3 space-y-2">
            {modelos.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-start gap-x-3 gap-y-2 rounded-lg border border-borda bg-plano px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[12.5px] font-bold text-navy">{m.nome}</span>
                    <Selo tom="cinza">{m.idioma}</Selo>
                    {m.categoria && <Selo tom="navy">{m.categoria}</Selo>}
                    {m.numParams > 0 && (
                      <span className="text-[11px] text-suave">
                        {m.numParams} parâmetro{m.numParams === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[11.5px] text-tinta">{m.corpo}</p>
                </div>
                <BotaoExcluir
                  acao={excluirModeloWhatsapp.bind(null, m.id)}
                  confirmacao={`Excluir o modelo "${m.nome}"?`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Nova credencial */}
      <details className="mb-4 rounded-xl border border-borda bg-superficie">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-[13px] font-semibold text-verde-escuro">
          ＋ Nova credencial de OAB
        </summary>
        <form action={criarCredencial} className="grid gap-3 border-t border-borda p-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">Usuário</span>
            <select name="usuarioId" required defaultValue="" className={entrada}>
              <option value="" disabled>
                Escolha o usuário…
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Número da OAB</span>
            <input name="numero" required inputMode="numeric" className={entrada} placeholder="Ex.: 12345" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">UF</span>
            <input name="uf" required maxLength={2} className={`${entrada} uppercase`} placeholder="ES" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-suave">
              Nome do(a) advogado(a) (como consta na OAB)
            </span>
            <input name="nomeAdvogado" required className={entrada} placeholder="Nome completo" />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
            >
              Cadastrar credencial
            </button>
          </div>
        </form>
      </details>

      {credenciais.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-superficie p-8 text-center text-[12.5px] text-suave">
          Nenhuma credencial cadastrada. Adicione a primeira OAB acima.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {credenciais.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-borda bg-superficie p-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[13px] font-bold text-navy">
                  OAB {c.numero}/{c.uf}
                </p>
                <p className="truncate text-[12px] text-tinta">{c.nomeAdvogado}</p>
                <p className="truncate text-[11px] text-suave">{c.usuario.nome}</p>
              </div>
              <Selo tom={c.ativa ? "verde" : "cinza"}>{c.ativa ? "ativa" : "pausada"}</Selo>
              <form action={alternarCredencial.bind(null, c.id, !c.ativa)}>
                <button
                  type="submit"
                  className="rounded-lg border border-borda px-2.5 py-1 text-[11px] font-semibold text-tinta hover:bg-plano"
                >
                  {c.ativa ? "Pausar" : "Ativar"}
                </button>
              </form>
              <BotaoExcluir
                acao={excluirCredencial.bind(null, c.id)}
                confirmacao={`Excluir a credencial OAB ${c.numero}/${c.uf}?`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
