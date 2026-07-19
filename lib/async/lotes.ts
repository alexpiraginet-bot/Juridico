// Executa uma coleção com concorrência limitada, preservando a ordem dos
// resultados. Evita tanto o processamento serial lento quanto uma rajada que
// esgote conexões do banco ou limites da API externa.
export async function mapearEmLotes<T, R>(
  itens: readonly T[],
  concorrencia: number,
  executar: (item: T, indice: number) => Promise<R>,
): Promise<R[]> {
  const limite = Math.max(1, Math.min(Math.floor(concorrencia) || 1, itens.length || 1));
  const resultados = new Array<R>(itens.length);
  let proximo = 0;

  async function trabalhador() {
    while (true) {
      const indice = proximo++;
      if (indice >= itens.length) return;
      resultados[indice] = await executar(itens[indice], indice);
    }
  }

  await Promise.all(Array.from({ length: limite }, () => trabalhador()));
  return resultados;
}
