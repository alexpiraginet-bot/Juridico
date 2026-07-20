import { describe, expect, it } from "vitest";
import { mapearEmLotes } from "../lib/async/lotes";

describe("mapearEmLotes", () => {
  it("limita a concorrência e preserva a ordem", async () => {
    let ativas = 0;
    let pico = 0;
    const resultados = await mapearEmLotes([5, 4, 3, 2, 1], 2, async (valor) => {
      ativas += 1;
      pico = Math.max(pico, ativas);
      await new Promise((resolve) => setTimeout(resolve, valor));
      ativas -= 1;
      return valor * 10;
    });

    expect(pico).toBe(2);
    expect(resultados).toEqual([50, 40, 30, 20, 10]);
  });

  it("trata limites inválidos como execução unitária", async () => {
    let ativas = 0;
    let pico = 0;
    await mapearEmLotes([1, 2], 0, async () => {
      ativas += 1;
      pico = Math.max(pico, ativas);
      await Promise.resolve();
      ativas -= 1;
    });
    expect(pico).toBe(1);
  });
});
