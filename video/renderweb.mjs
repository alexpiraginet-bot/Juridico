// Versão web (leve) do filme, para embutir na /proposta sem travar:
// 720p + compressão maior + faststart (já padrão do Remotion para h264).
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdirSync } from "node:fs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(aqui, "out");
mkdirSync(OUT, { recursive: true });
const CHROMIUM = process.env.LEXFLOW_HEADLESS_SHELL || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const saida = path.join(OUT, "lexflow-filme-web.mp4");

console.log("Empacotando…");
const serveUrl = await bundle({ entryPoint: path.join(aqui, "src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: "LexFlowFilme", browserExecutable: CHROMIUM });

console.log("Renderizando versão web (720p)…");
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: saida,
  browserExecutable: CHROMIUM,
  scale: 2 / 3, // 1920x1080 -> 1280x720
  crf: 23, // mais leve que o crf 18 do master
  concurrency: 3,
  onProgress: ({ progress }) => process.stdout.write(`\r  render ${Math.round(progress * 100)}%   `),
});
console.log("\nOK ->", saida);
