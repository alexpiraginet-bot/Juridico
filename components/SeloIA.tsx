/*
 * Selo roxo que sinaliza conteúdo gerado ou sugerido por IA.
 * Regra do produto: nada de IA circula sem esta marcação.
 */

export function SeloIA({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ia-fundo px-2.5 py-0.5 text-[10.5px] font-bold text-ia-tinta">
      ✨ {children}
    </span>
  );
}
