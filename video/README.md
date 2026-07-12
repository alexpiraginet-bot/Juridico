# Vídeo-demo interno (Remotion)

Vídeo curto (~40s, 1080p) que apresenta o LexFlow: abertura de marca →
tour das telas → foco na IA (sempre com validação humana) → fecho.

Não faz parte do app (Next.js) — é uma peça à parte, como a `/proposta`.
Tem **o próprio `package.json`**: o Remotion e o Playwright ficam isolados
aqui, então **não pesam no deploy** da aplicação. E fica fora do `next build`
(excluído no `tsconfig.json` da raiz).

## Setup (uma vez)

```bash
cd video
npm install
```

## Como as telas entram no vídeo

As imagens em `assets/` são **capturas fiéis do protótipo**
(`public/prototipo.html`, a "especificação viva"). Foram tiradas com o
Chromium dirigindo o protótipo por cada tela e estado de IA (relato fático,
prazo validado, minuta gerada). O Remotion só anima essas capturas.

## Comandos (dentro de video/)

```bash
npm run capturar   # regera as capturas do protótipo em assets/
npm run still      # gera alguns frames-chave (PNG) em out/, para conferência rápida
npm run render     # gera o vídeo final em out/lexflow-demo.mp4
```

O render usa o Chromium já instalado na máquina (chrome-headless-shell), sem
baixar navegador. Em outra máquina, aponte com as variáveis `LEXFLOW_CHROMIUM`
(captura) e `LEXFLOW_HEADLESS_SHELL` (render). As pastas `out/` e
`node_modules/` não vão para o git (resultado e dependências, não fonte).

## Estrutura

- `src/index.ts` — ponto de entrada do Remotion.
- `src/Raiz.tsx` — registra a composição `LexFlowDemo`.
- `src/VideoDemo.tsx` — o vídeo: cenas, marca, moldura de navegador, legendas.
- `assets/` — as capturas das telas (fonte do vídeo).
- `capturar.mjs` / `still.mjs` / `renderizar.mjs` — os scripts acima.
