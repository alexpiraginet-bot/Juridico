# LexFlow (repositório "Juridico")

Sistema de gestão jurídica com IA para escritórios de advocacia (pt-BR):
atendimentos via WhatsApp, clientes, processos, intimações do DJEN, prazos
com validação humana, tarefas e minutas assistidas por IA.

O dono do projeto está aprendendo programação: o histórico do git e
`docs/PASSO-A-PASSO.md` são material de estudo — mantenha os dois legíveis.

## A especificação viva

`public/prototipo.html` é o protótipo original (uma única página HTML,
publicada primeiro em project-pqvs7.vercel.app). Ele define identidade
visual, textos, telas e fluxos — em caso de dúvida de produto ou design,
ele é a referência. Evitar editá-lo: só ajustes pontuais pedidos pelo
dono, registrados no diário (ex.: Passo 9 — fade-in do nome e miniatura).
O app em `app/` é a versão estruturada dele.

## Comandos

```bash
npm run dev        # desenvolvimento em http://localhost:3000
npm run build      # build de produção (também checa os tipos)
npm run typecheck  # só a checagem de tipos
```

## Stack

Next.js 15 (App Router) + React 19 + TypeScript estrito + Tailwind CSS 4
(sem tailwind.config; tokens no bloco `@theme` de `app/globals.css`).

## Convenções — seguir sempre

- **Tudo em português do Brasil**: UI, docs, commits e identificadores
  (`Processo`, `prazosJudiciais`, `BarraLateral`).
- Tokens de cor só em `app/globals.css` (paleta do protótipo: navy/verde);
  nas telas usar as classes derivadas (`bg-superficie`, `text-navy`,
  `bg-selo-verde`...). Não usar hex solto, salvo cores pontuais herdadas
  do protótipo.
- **Conteúdo de IA é sempre sinalizado** com `SeloIA` (✨) e depende de
  validação humana — princípio central do produto, não detalhe visual.
- Cor nunca carrega significado sozinha: todo selo/status tem texto
  (componente `Selo`).
- Páginas são componentes de servidor; interatividade vive em componentes
  de cliente por tela (`PainelAtendimentos`, `PainelIntimacoes`,
  `QuadroTarefas`, `PainelMinutas`) + `useAviso` para os toasts.
- O "mundo" dos dados fictícios é congelado em **10/07/2026**
  (`lib/dados.ts`) — não introduzir datas dinâmicas até a Fase 2.
- Commits pequenos, mensagem "Passo N: ..." quando fizer parte da
  construção guiada, corpo explicando o porquê.
- Ao concluir um passo relevante, atualizar `docs/PASSO-A-PASSO.md` e o
  roteiro do README.

## Roteiro de fases

1. ✅ Fase 1 — fundação Next.js.
2. ✅ Fase 1.5 — unificação com o protótipo LexFlow (identidade + 8 telas).
3. ⬜ Fase 2 — SQLite + Prisma, CRUD real.
4. ⬜ Fase 3 — autenticação, perfis e auditoria.
5. ⬜ Fase 4 — integrações reais (WhatsApp Business API, DJEN/Comunica API).
6. ⬜ Fase 5 — IA real via API do Claude (relato fático, análise de
   intimações, minutas), sempre com validação humana.

Antes de iniciar uma fase nova, alinhar o escopo com o dono do projeto.
