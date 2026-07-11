/*
 * Formulário de cliente, usado tanto para criar quanto para editar.
 * É um componente de servidor: o <form action={...}> chama a server
 * action diretamente, sem JavaScript manual no navegador.
 */

import Link from "next/link";

interface DadosDoCliente {
  nome: string;
  cpfCnpj: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
}

interface Props {
  acao: (dados: FormData) => Promise<void>;
  cliente?: DadosDoCliente;
  erro?: string;
}

export function FormularioCliente({ acao, cliente, erro }: Props) {
  return (
    <form action={acao} className="max-w-lg rounded-xl border border-borda bg-superficie p-5">
      {erro && (
        <p className="mb-4 rounded-lg border border-[#E5C4C0] bg-selo-vermelho px-3 py-2 text-[12.5px] font-semibold text-vermelho">
          ⚠️ {erro}
        </p>
      )}

      <div className="grid gap-4">
        <Campo rotulo="Nome completo *" nome="nome" valorInicial={cliente?.nome} obrigatorio />
        <Campo
          rotulo="CPF ou CNPJ *"
          nome="cpfCnpj"
          valorInicial={cliente?.cpfCnpj}
          obrigatorio
          dica="Ex.: 111.222.333-44 ou 12.345.678/0001-90"
        />
        <Campo rotulo="E-mail" nome="email" tipo="email" valorInicial={cliente?.email ?? ""} />
        <Campo rotulo="Telefone" nome="telefone" valorInicial={cliente?.telefone ?? ""} />
        <Campo rotulo="Cidade/UF" nome="cidade" valorInicial={cliente?.cidade ?? ""} />
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-verde px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-verde-escuro"
        >
          Salvar cliente
        </button>
        <Link
          href="/clientes"
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
        className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-[13px] outline-none focus:border-verde"
      />
      {dica && <span className="mt-1 block text-[11px] text-suave">{dica}</span>}
    </label>
  );
}
