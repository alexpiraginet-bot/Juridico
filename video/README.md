# Vídeos do LexFlow (Remotion)

Duas peças de vídeo, ambas à parte do app (como a `/proposta`). O `video/` tem
**o próprio `package.json`**: Remotion e Playwright ficam isolados aqui, então
**não pesam no deploy** da aplicação. Fica fora do `next build` (excluído no
`tsconfig.json` da raiz).

São **duas composições Remotion** (em `src/Raiz.tsx`):

1. **`LexFlowDemo`** — vídeo-demo (~40s): anima **capturas fiéis do protótipo**
   (`public/prototipo.html`). Tour das telas + foco na IA.
2. **`LexFlowFilme`** — "LexFlow em Movimento" (~45s): filme **100% animado em
   componentes** (UI viva, sem screenshots) — o X da LEX se desenhando, o
   WhatsApp digitando, a IA redigindo o relato, o prazo sendo validado, a minuta
   se escrevendo, números de impacto e o fecho de marca.

## Setup (uma vez)

```bash
cd video
npm install
```

## Comandos (dentro de video/)

```bash
npm run capturar   # regera as capturas do protótipo em assets/ (fonte do LexFlowDemo)
npm run still      # frames-chave do LexFlowDemo (PNG) em out/
npm run render     # gera out/lexflow-demo.mp4
node stillfilme.mjs   # frames-chave do LexFlowFilme (um por cena)
node renderfilme.mjs  # gera out/lexflow-filme.mp4
```

O render usa o Chromium já instalado na máquina (chrome-headless-shell), sem
baixar navegador. Em outra máquina, aponte com `LEXFLOW_CHROMIUM` (captura) e
`LEXFLOW_HEADLESS_SHELL` (render). As pastas `out/` e `node_modules/` não vão
para o git (resultado e dependências, não fonte).

## Estrutura

- `src/index.ts` — ponto de entrada; registra a raiz.
- `src/Raiz.tsx` — as duas composições.
- `src/VideoDemo.tsx` — o vídeo-demo (capturas + molduras + legendas).
- `src/Filme.tsx` — o filme animado: monta as 7 cenas numa TransitionSeries.
- `src/tema.tsx` — tema/identidade compartilhada das cenas do filme.
- `src/cenas/` — uma cena animada por arquivo (o X, o WhatsApp, o relato, o
  prazo, a minuta, os números, o fecho).
- `assets/` — as capturas do protótipo (fonte do vídeo-demo).

## Como o filme foi construído

As 7 cenas foram orquestradas por um **workflow multi-agente**: um painel de
direção criativa convergiu num roteiro, agentes construíram as cenas em paralelo
(cada uma um componente Remotion autossuficiente) e cada cena passou por revisão.
