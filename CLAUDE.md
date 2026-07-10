# Juridico

Sistema de gestão para escritórios de advocacia (pt-BR): processos, clientes
e prazos. Projeto em construção guiada — o dono está aprendendo; o histórico
do git e `docs/PASSO-A-PASSO.md` são material de estudo.

## Comandos

```bash
npm run dev        # desenvolvimento em http://localhost:3000
npm run build      # build de produção (também roda a checagem de tipos)
npm run typecheck  # só a checagem de tipos
```

## Stack

Next.js 15 (App Router) + React 19 + TypeScript estrito + Tailwind CSS 4
(sem tailwind.config; tokens no bloco `@theme` de `app/globals.css`).

## Convenções — seguir sempre

- **Tudo em português do Brasil**: UI, docs, mensagens de commit e
  identificadores de domínio (`Processo`, `clientePorId`, `BarraLateral`).
- Tokens de cor só em `app/globals.css` (`@theme`); nas telas usar as
  classes derivadas (`bg-superficie`, `text-tinta`, `border-borda`,
  `bg-status-bom`...). Não usar hex solto em componente.
- Cor nunca carrega significado sozinha: status e urgência sempre com texto
  (ver `SeloStatus` e `ChipPrazo`).
- Páginas são componentes de servidor por padrão; `"use client"` apenas
  quando há interação no navegador (hoje, só `BarraLateral`).
- As telas leem dados apenas pelas funções de `lib/dados.ts`
  (`clientePorId`, `prazosPendentes`...), nunca pelos arrays diretamente —
  isso é o que permitirá trocar para banco de dados na Fase 2.
- Commits pequenos, mensagem começando com o passo/fase quando fizer parte
  da construção guiada ("Passo N: ..."), corpo explicando o porquê.
- Ao concluir uma fase ou passo relevante, atualizar
  `docs/PASSO-A-PASSO.md` (diário de construção) e o roteiro do README.

## Roteiro de fases

1. ✅ Fase 1 — fundação: estrutura, navegação, telas com dados de exemplo.
2. ⬜ Fase 2 — SQLite + Prisma, CRUD de processos/clientes/prazos.
3. ⬜ Fase 3 — autenticação e usuários.
4. ⬜ Fase 4 — alertas de prazos e agenda.
5. ⬜ Fase 5 — documentos e anexos.

Antes de iniciar uma fase nova, alinhar o escopo com o dono do projeto.
