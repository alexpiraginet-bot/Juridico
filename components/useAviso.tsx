"use client";

/*
 * Aviso flutuante (toast) idêntico ao do protótipo: aparece embaixo,
 * some sozinho depois de 3,4 segundos.
 *
 * Uso em um componente de cliente:
 *   const { avisar, elemento } = useAviso();
 *   ... onClick={() => avisar("mensagem")} ... e renderize {elemento}.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function useAviso() {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const avisar = useCallback((texto: string) => {
    setMensagem(texto);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMensagem(null), 3400);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const elemento = (
    <div
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl bg-navy px-5 py-2.5 text-[13px] text-white transition-opacity duration-300 ${
        mensagem ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {mensagem}
    </div>
  );

  return { avisar, elemento };
}
