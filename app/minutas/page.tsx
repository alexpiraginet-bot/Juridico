import type { Metadata } from "next";
import { bd } from "@/lib/bd";
import { iaConfigurada } from "@/lib/ia";
import { PainelMinutas } from "./PainelMinutas";

export const metadata: Metadata = { title: "Minutas IA" };
export const dynamic = "force-dynamic";
// A geração de minuta chama a API do Claude e pode levar ~1 min;
// damos folga ao tempo da função na Vercel (Hobby aceita até 60s).
export const maxDuration = 60;

export default async function PaginaMinutas() {
  // Sem banco configurado a tela segue funcionando em modo demonstração.
  const processos = await bd.processo
    .findMany({
      select: { id: true, numero: true, titulo: true },
      orderBy: { criadoEm: "desc" },
    })
    .catch(() => []);

  return (
    <div>
      <h1 className="text-lg font-bold text-navy">Minutas Assistidas por IA</h1>
      <p className="mb-4 mt-0.5 text-xs text-suave">
        Contexto: capa do processo + cliente + prazos pendentes · redigido pelo Claude,
        revisado por você
      </p>
      <PainelMinutas processos={processos} iaAtiva={iaConfigurada()} />
    </div>
  );
}
