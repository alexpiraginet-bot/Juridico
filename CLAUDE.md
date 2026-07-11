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
npm run dev          # desenvolvimento em http://localhost:3000 (exige DATABASE_URL no .env)
npm run build        # build de produção (também checa os tipos)
npm run typecheck    # só a checagem de tipos
npx prisma db seed   # semeia o banco com os dados do protótipo (idempotente)
npx prisma migrate dev --name <nome>  # nova migração após mudar o schema
```

## Stack

Next.js 15 (App Router) + React 19 + TypeScript estrito + Tailwind CSS 4
(sem tailwind.config; tokens no bloco `@theme` de `app/globals.css`) +
PostgreSQL na nuvem via Prisma 7 (`prisma/schema.prisma`; cliente gerado
em `lib/generated/`, fora do git; conexão única em `lib/bd.ts`) +
API do Claude para IA (`lib/ia.ts`; modelo `claude-opus-4-8`) +
API Pública do DataJud/CNJ para jurisprudência (`lib/juris/datajud.ts`).

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
- Telas de banco (clientes, processos, prazos): `force-dynamic`, leitura
  via `bd` (`lib/bd.ts`) e escrita só por server actions em `lib/acoes/`
  (validar → gravar → `revalidatePath` → `redirect`; erro volta por
  `?erro=` na URL). Enums do banco são traduzidos em `lib/opcoes.ts`.
- **IA e APIs externas rodam só no servidor** (`lib/ia.ts`,
  `lib/juris/datajud.ts`): segredos em variáveis de ambiente, nunca no
  cliente. Toda integração externa **degrada com elegância** — sem a
  chave/conexão, a tela mostra aviso ou modo demonstração, nunca quebra.
  A IA usa o SDK `@anthropic-ai/sdk`; consultar a skill `claude-api`
  antes de mexer nela (modelo, thinking, tratamento de erros).
- O "mundo" das telas de demonstração (dashboard, atendimentos,
  intimações, tarefas, minutas) segue congelado em **10/07/2026**
  (`lib/dados.ts`); datas dinâmicas são bem-vindas nas telas de banco.
- Commits pequenos, mensagem "Passo N: ..." quando fizer parte da
  construção guiada, corpo explicando o porquê.
- Ao concluir um passo relevante, atualizar `docs/PASSO-A-PASSO.md` e o
  roteiro do README.

## Roteiro de fases

1. ✅ Fase 1 — fundação Next.js.
2. ✅ Fase 1.5 — unificação com o protótipo LexFlow (identidade + 8 telas).
3. ✅ Fase 2 — PostgreSQL na nuvem + Prisma, CRUD real de clientes,
   processos e prazos (com validação humana de prazos).
4. 🟡 Fase 5 (em andamento) — IA real via API do Claude nas minutas, no
   resumo de processos (andamentos do DataJud) e no resumo de intimações
   do DJEN. Falta: relato fático dos atendimentos por IA.
5. ⬜ Fase 3 — autenticação, perfis e auditoria.
6. 🟡 Fase 4 (em andamento) — integrações de comunicação. Já feito: busca
   de processos pela OAB no DJEN/CNJ (tela `/djen`, roda em `gru1` por
   causa do geobloqueio). Faltam: importar para o banco, captura
   automática de hora em hora e o WhatsApp Business API dos atendimentos.

Antes de iniciar uma fase nova, alinhar o escopo com o dono do projeto.
