"use client";

/*
 * Botão de demonstração da checagem de conflito de interesses:
 * ao "cadastrar", o sistema cruza o CPF com toda a base e alerta.
 */

import { useAviso } from "./useAviso";

export function BotaoNovoCliente() {
  const { avisar, elemento } = useAviso();

  return (
    <>
      <button
        type="button"
        className="rounded-lg bg-verde px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-verde-escuro"
        onClick={() =>
          avisar(
            "⚠️ Demonstração: CPF informado pertence à parte CONTRÁRIA no Proc. 0803344-12 — conflito de interesses detectado",
          )
        }
      >
        + Novo cliente (demo conflito)
      </button>
      {elemento}
    </>
  );
}
