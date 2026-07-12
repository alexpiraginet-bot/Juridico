// Renderiza o vídeo-demo completo em .mp4, usando o Chromium local (sem baixar nada).
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdirSync } from "node:fs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(aqui, "out");
mkdirSync(OUT, { recursive: true });

// chrome-headless-shell do ambiente (headless "antigo" que o Remotion usa).
// Em outra máquina, ajuste com LEXFLOW_HEADLESS_SHELL — ou omita para o Remotion baixar o dele.
const CHROMIUM = process.env.LEXFLOW_HEADLESS_SHELL || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const saida = path.join(OUT, "lexflow-demo.mp4");

console.log("Empacotando (bundle)…");
const serveUrl = await bundle({
  entryPoint: path.join(aqui, "src/index.ts"),
  onProgress: (p) => process.stdout.write(`\r  bundle ${Math.round(p)}%   `),
});

console.log("\nSelecionando composição…");
const composition = await selectComposition({ serveUrl, id: "LexFlowDemo", browserExecutable: CHROMIUM });
console.log(`  ${composition.durationInFrames} frames @ ${composition.fps}fps = ${(composition.durationInFrames / composition.fps).toFixed(1)}s`);

console.log("Renderizando…");
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: saida,
  browserExecutable: CHROMIUM,
  concurrency: 3,
  crf: 18,
  onProgress: ({ progress, renderedFrames }) =>
    process.stdout.write(`\r  render ${Math.round(progress * 100)}%  (frames: ${renderedFrames})   `),
});

console.log("\nOK ->", saida);
