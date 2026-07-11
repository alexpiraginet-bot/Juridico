"use client";

/*
 * Botão de exclusão com confirmação. Recebe uma server action já
 * "amarrada" ao id do registro (acao.bind) e a executa numa transição
 * para o React manter a tela responsiva enquanto o banco trabalha.
 */

import { useTransition } from "react";

interface Props {
  acao: () => Promise<void>;
  confirmacao: string;
}

export function BotaoExcluir({ acao, confirmacao }: Props) {
  const [pendente, iniciar] = useTransition();

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => {
        if (window.confirm(confirmacao)) iniciar(() => acao());
      }}
      className="rounded-lg border border-[#E5C4C0] bg-white px-2.5 py-1 text-[11px] font-semibold text-vermelho hover:bg-selo-vermelho disabled:opacity-50"
    >
      {pendente ? "Excluindo…" : "Excluir"}
    </button>
  );
}
