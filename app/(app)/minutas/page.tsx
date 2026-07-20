import type { Metadata } from "next";
import { bd } from "@/lib/bd";
import { exigirUsuarioDoEscritorio } from "@/lib/auth";
import { iaConfigurada } from "@/lib/ia";
import type { MinutaSalva } from "@/lib/acoes/minutas";
import { PainelMinutas } from "./PainelMinutas";

export const metadata: Metadata = { title: "Minutas IA" };
export const dynamic = "force-dynamic";
// A geração de minuta chama a API do Claude e pode levar ~1 min;
// damos folga ao tempo da função na Vercel (Hobby aceita até 60s).
export const maxDuration = 60;

export default async function PaginaMinutas() {
  const usuario = await exigirUsuarioDoEscritorio();

  const [processos, minutasSalvas] = await Promise.all([
    bd.processo
      .findMany({
        where: { teamId: usuario.teamId },
        select: { id: true, numero: true, titulo: true },
        orderBy: { criadoEm: "desc" },
      })
      .catch(() => []),
    bd.minuta
      .findMany({
        where: { teamId: usuario.teamId },
        orderBy: { atualizadoEm: "desc" },
        take: 30,
        select: { id: true, titulo: true, teor: true, status: true },
      })
      .catch(() => [] as MinutaSalva[]),
  ]);

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Minutas Assistidas por IA</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Contexto: capa do processo + cliente + prazos pendentes · redigido pelo Claude,
        revisado por você · salvo no banco
      </p>
      <PainelMinutas
        processos={processos}
        iaAtiva={iaConfigurada()}
        minutasSalvas={minutasSalvas as MinutaSalva[]}
      />
    </div>
  );
}
