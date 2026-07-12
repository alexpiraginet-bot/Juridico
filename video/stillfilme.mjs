// Renderiza um still por cena do filme (LexFlowFilme), para validar.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdirSync } from "node:fs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(aqui, "out", "stills-filme");
mkdirSync(OUT, { recursive: true });
const CHROMIUM = process.env.LEXFLOW_HEADLESS_SHELL || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

console.log("Empacotando…");
const serveUrl = await bundle({ entryPoint: path.join(aqui, "src/index.ts"), onProgress: () => {} });
console.log("Selecionando composição…");
const composition = await selectComposition({ serveUrl, id: "LexFlowFilme", browserExecutable: CHROMIUM });
console.log(`  ${composition.durationInFrames} frames @ ${composition.fps}fps`);

const frames = [65, 230, 460, 680, 900, 1110, 1300];
for (const frame of frames) {
  const output = path.join(OUT, `f-${frame}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable: CHROMIUM, overwrite: true });
  console.log("still:", output);
}
console.log("OK");
