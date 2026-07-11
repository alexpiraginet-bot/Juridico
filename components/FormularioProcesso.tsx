/*
 * Formulário de processo (criar/editar). Os selects de área e fase
 * vêm dos enums do banco traduzidos em lib/opcoes.ts; o de cliente,
 * da tabela de clientes.
 */

import Link from "next/link";
import type { AreaProcesso, FaseProcesso } from "@/lib/generated/prisma/enums";
import { AREAS, FASES } from "@/lib/opcoes";

interface DadosDoProcesso {
  numero: string;
  titulo: string;
  area: AreaProcesso;
  tribunal: string | null;
  fase: FaseProcesso;
  ultimoEvento: string | null;
  valorCausa: number | null;
  clienteId: string;
}

interface Props {
  acao: (dados: FormData) => Promise<void>;
  clientes: { id: string; nome: string }[];
  processo?: DadosDoProcesso;
  erro?: string;
}

export function FormularioProcesso({ acao, clientes, processo, erro }: Props) {
  return (
    <form action={acao} className="max-w-2xl rounded-xl border border-borda bg-superficie p-5">
      {erro && (
        <p className="mb-4 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          rotulo="Número CNJ *"
          nome="numero"
          valorInicial={processo?.numero}
          obrigatorio
          dica="Ex.: 0801234-55.2026.8.08.0024"
        />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">Cliente *</span>
          <select
            name="clienteId"
            defaultValue={processo?.clienteId ?? ""}
            required
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
          >
            <option value="" disabled>
              Selecione o cliente…
            </option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2">
          <Campo rotulo="Título *" nome="titulo" valorInicial={processo?.titulo} obrigatorio />
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">Área</span>
          <select
            name="area"
            defaultValue={processo?.area ?? "CIVEL"}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
          >
            {Object.entries(AREAS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-suave">Fase</span>
          <select
            name="fase"
            defaultValue={processo?.fase ?? "CONHECIMENTO"}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
          >
            {Object.entries(FASES).map(([valor, { rotulo }]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>

        <Campo
          rotulo="Tribunal / vara"
          nome="tribunal"
          valorInicial={processo?.tribunal ?? ""}
          dica="Ex.: TJES · 3ª Vara Cível de Vitória"
        />
        <Campo
          rotulo="Valor da causa (R$)"
          nome="valorCausa"
          tipo="number"
          valorInicial={processo?.valorCausa != null ? String(processo.valorCausa) : ""}
        />

        <div className="sm:col-span-2">
          <Campo
            rotulo="Último evento"
            nome="ultimoEvento"
            valorInicial={processo?.ultimoEvento ?? ""}
            dica="Ex.: Audiência designada para 13/07"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          Salvar processo
        </button>
        <Link
          href="/processos"
          className="rounded-lg border border-borda px-4 py-2 text-[12.5px] font-semibold hover:bg-plano"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Campo({
  rotulo,
  nome,
  valorInicial,
  obrigatorio,
  tipo = "text",
  dica,
}: {
  rotulo: string;
  nome: string;
  valorInicial?: string;
  obrigatorio?: boolean;
  tipo?: string;
  dica?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-suave">{rotulo}</span>
      <input
        type={tipo}
        name={nome}
        defaultValue={valorInicial}
        required={obrigatorio}
        step={tipo === "number" ? "0.01" : undefined}
        min={tipo === "number" ? "0" : undefined}
        className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
      />
      {dica && <span className="mt-1 block text-[11px] text-suave">{dica}</span>}
    </label>
  );
}
