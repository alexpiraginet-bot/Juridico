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
npm test             # testes automatizados
npm run check        # tipos + testes + build
npm run db:migrate   # migração explícita antes de promover um deploy
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
- Toda leitura/escrita de cliente, processo e prazo exige `teamId`; relações
  compostas no Prisma impedem ligar registros de escritórios diferentes.
- Build da Vercel nunca executa migrações. O rollout é migração explícita →
  validação → promoção do preview, usando `DIRECT_URL` para DDL.
- **IA e APIs externas rodam só no servidor** (`lib/ia.ts`,
  `lib/juris/datajud.ts`): segredos em variáveis de ambiente, nunca no
  cliente. Toda integração externa **degrada com elegância** — sem a
  chave/conexão, a tela mostra aviso ou modo demonstração, nunca quebra.
  A IA usa o SDK `@anthropic-ai/sdk`; consultar a skill `claude-api`
  antes de mexer nela (modelo, thinking, tratamento de erros).
- Sobrou só o **fallback de atendimentos** (quando não há conversas reais)
  usando os dados de demonstração congelados em **10/07/2026** (`lib/dados.ts`).
  Datas dinâmicas são bem-vindas nas telas de banco. O **dashboard** agora é
  real: agrega do banco (prazos a validar/vencer, intimações novas, tarefas
  por coluna, minutas por status). **Intimações**, **Tarefas** e **Minutas**
  também são reais (`Intimacao` do DJEN; `Tarefa` no kanban por escritório;
  `Minuta` persistida com status IA→humana→aprovada). Minutas ainda caem no
  roteiro de demonstração **sem** a `ANTHROPIC_API_KEY`.
- Commits pequenos, mensagem "Passo N: ..." quando fizer parte da
  construção guiada, corpo explicando o porquê.
- Ao concluir um passo relevante, atualizar `docs/PASSO-A-PASSO.md` e o
  roteiro do README.

## Roteiro de fases

1. ✅ Fase 1 — fundação Next.js.
2. ✅ Fase 1.5 — unificação com o protótipo LexFlow (identidade + 8 telas).
3. ✅ Fase 2 — PostgreSQL na nuvem + Prisma, CRUD real de clientes,
   processos e prazos (com validação humana de prazos).
4. ✅ Fase 5 — IA real via API do Claude nas minutas, no resumo de
   processos (andamentos do DataJud), no resumo de intimações do DJEN e no
   **relato fático dos atendimentos** (`gerarAnaliseDoAtendimentoComClaude`
   lê a conversa do WhatsApp e redige relato + linha do tempo + checklist +
   perguntas; degrada para o rascunho de demonstração sem a chave).
5. ✅ Fase 3 — multi-inquilino com login. **login por e-mail+senha**
   (`lib/auth.ts`, scrypt + sessão em cookie httpOnly); **painel central**
   do super-admin (`/central`) que cadastra escritórios (`Team`, com logo);
   **app inteiro atrás do login** (grupo `app/(app)/` + `exigirUsuario`) com
   **navegação por papel**; **dono gere a própria equipe** (usuários e
   credenciais escopados ao `teamId`); **isolamento** (cada intimação tem
   dono; cada um vê só as suas); **compartilhamento** (o dono libera a
   leitura de uma intimação a um colega do mesmo Team,
   `CompartilhamentoIntimacao`); **log de auditoria** (`RegistroAuditoria`
   append-only, `lib/auditoria.ts`; tela `/auditoria` escopada por papel —
   dono vê o escritório, super-admin vê a plataforma).
6. ✅ Fase 4 — integrações de comunicação. Já feito: busca
   de processos pela OAB no DJEN/CNJ (tela `/djen`, roda em `gru1` por
   causa do geobloqueio), importação para o banco (tabela `Intimacao`,
   dedup), **captura automática diária** (cron da Vercel às 08h BRT /
   11h UTC → `/api/djen/varrer`, protegida por `CRON_SECRET`) e a **fundação
   do WhatsApp Business** (Meta Cloud API): tabelas reais `ConversaWhatsapp`/
   `MensagemWhatsapp`, o **webhook** (`/api/whatsapp/webhook`: handshake de
   verificação + recebimento com validação de assinatura HMAC e dedup) e o
   **envio** pela Graph API (`lib/whatsapp/`), tudo em modo demonstração sem
   as chaves. Já **roteia** as conversas: cada Team registra o seu
   `whatsappPhoneNumberId` (tela `/credenciais`) e o webhook liga a conversa
   recebida ao escritório dono do número. A tela de **Atendimentos** já lê as
   conversas reais do Team (`force-dynamic`, escopadas por `teamId`; cai no
   mundo de demonstração quando não há nenhuma), com o **relato fático da IA**
   rodando sobre as mensagens reais. E já **responde pelo chat**
   (`responderAtendimento`: envia pela Graph API, grava a resposta como
   `ENVIADA` e audita), com aviso quando a **janela de 24h** está fechada.
   Guia de configuração da Meta em `docs/whatsapp-configuracao.md`. O ciclo
   receber → rotear → mostrar → responder está fechado. E a **gestão de modelos
   (templates)** aprovados (tabela `ModeloWhatsapp`): o dono cadastra em
   `/credenciais` os modelos que aprovou na Meta e, **fora da janela de 24h**,
   o atendente dispara um modelo pelo próprio chat (`enviarModeloParaConversa`,
   com os parâmetros `{{1}}…` preenchidos). A **captura do DJEN** passou a
   consultar sempre uma **janela recente de datas** (fuso de Brasília,
   `DJEN_DIAS_JANELA`, padrão 30 dias) — antes ia sem faixa e uma publicação
   disponibilizada tarde no dia escapava; agora, com a sobreposição diária e a
   dedup, nada some pela borda do dia.

Antes de iniciar uma fase nova, alinhar o escopo com o dono do projeto.
