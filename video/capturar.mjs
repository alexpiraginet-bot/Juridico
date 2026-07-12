/**
 * Captura as telas do protótipo (public/prototipo.html) como PNG em assets/,
 * dirigindo o Chromium por cada tela e estado de IA. Rode antes de renderizar
 * o vídeo — as imagens são a fonte do vídeo.
 *
 * O caminho do Chromium abaixo é o do ambiente na nuvem; ajuste com a variável
 * LEXFLOW_CHROMIUM se estiver em outra máquina (ex.: seu Mac).
 */
import pw from "playwright-core";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const { chromium } = pw;
const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, "..");
const OUT = path.join(aqui, "assets");
const PROTOTIPO = path.join(raiz, "public", "prototipo.html");
const CHROMIUM = process.env.LEXFLOW_CHROMIUM || "/opt/pw-browsers/chromium";
mkdirSync(OUT, { recursive: true });

const W = 1440, H = 900;
const browser = await chromium.launch({ executablePath: CHROMIUM, args: ["--no-sandbox", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto("file://" + PROTOTIPO, { waitUntil: "networkidle" });

// A apresentação (overlay #prez) aparece por padrão — fecha para revelar o app.
await page.evaluate(() => window.endPrez && window.endPrez());
await page.waitForTimeout(400);

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 0, width: W, height: H } });
  console.log("shot:", name);
}
async function go(v) { await page.evaluate((v) => window.go(v), v); await page.waitForTimeout(500); }

await go("dash"); await shot("01-painel");
await go("atend"); await page.waitForTimeout(400); await shot("02-atendimentos");
await go("cli"); await shot("03-clientes");
await go("proc"); await shot("04-processos");
await go("inti"); await shot("05-intimacoes");
await go("prazo"); await shot("06-prazos");
await page.evaluate(() => window.aprovaPrazo && window.aprovaPrazo()); // validação humana
await page.waitForTimeout(500); await shot("07-prazos-validado");
await go("task"); await shot("08-tarefas");
await go("min"); await shot("09-minutas-antes");
await page.evaluate(() => window.gerarMinuta && window.gerarMinuta()); // IA gera a peça
await page.waitForTimeout(2200);
await page.evaluate(() => { document.getElementById("min-badge").style.visibility = "visible"; });
await shot("10-minutas-depois");

await browser.close();
console.log("OK — assets em", OUT);
