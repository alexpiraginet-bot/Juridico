// Renderiza alguns frames-chave como PNG, para validar a composição rápido.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdirSync } from "node:fs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(aqui, "out");
mkdirSync(OUT, { recursive: true });

// chrome-headless-shell do ambiente (headless "antigo" que o Remotion usa).
// Em outra máquina, ajuste com LEXFLOW_HEADLESS_SHELL — ou omita para o Remotion baixar o dele.
const CHROMIUM = process.env.LEXFLOW_HEADLESS_SHELL || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

console.log("Empacotando (bundle)…");
const serveUrl = await bundle({
  entryPoint: path.join(aqui, "src/index.ts"),
  onProgress: (p) => process.stdout.write(`\r  bundle ${Math.round(p)}%   `),
});
console.log("\nSelecionando composição…");
const composition = await selectComposition({ serveUrl, id: "LexFlowDemo", browserExecutable: CHROMIUM });

for (const frame of [55, 400, 700, 900, 1010, 1160]) {
  const output = path.join(OUT, `still-${frame}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable: CHROMIUM, overwrite: true });
  console.log("still:", output);
}
console.log("OK");
