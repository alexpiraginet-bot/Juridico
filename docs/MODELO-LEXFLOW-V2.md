# LexFlow — Blueprint de Alto Nível (para planejar a V2)

> **Como usar este documento:** é o retrato fiel da V1 do LexFlow (produto +
> arquitetura + integrações + lições de operação) para servir de base a um
> modelo de planejamento (Fable 5.2) desenhar a **V2 ultra ambiciosa**. Não é
> código — é o "mapa mental" do sistema. As seções 1–11 descrevem o que
> **existe hoje**; a seção 12 abre as **oportunidades da V2**; a 13 fixa os
> **inegociáveis** que a V2 não pode quebrar.

---

## 1. O que é o LexFlow

SaaS **multi-escritório** de gestão jurídica com IA para **advocacia
brasileira** (pt-BR de ponta a ponta). A tese central: **o escritório inteiro
num só lugar**, com a IA fazendo o trabalho braçal (ler, resumir, redigir,
captar) e **o advogado decidindo** — nada é protocolado ou enviado
automaticamente.

**Dor que resolve:** o advogado perde tempo e perde prazo. O LexFlow (a) capta
sozinho as intimações oficiais pela OAB, (b) transforma conversa de WhatsApp em
relato jurídico, (c) resume processos e andamentos, (d) rascunha peças, e (e)
centraliza prazos/tarefas com **validação humana obrigatória**.

---

## 2. Usuários e papéis (multi-inquilino)

Hierarquia de acesso (`PapelUsuario`):

| Papel | Enxerga | Faz |
|---|---|---|
| **SUPERADMIN** | a plataforma inteira (`/central`) | cadastra escritórios (`Team`), vê auditoria global |
| **DONO_ESCRITORIO** | o próprio escritório + gestão | cadastra usuários e credenciais, libera compartilhamentos, vê auditoria do escritório |
| **ADVOGADO / ASSESSOR / ESTAGIARIO** | as telas do dia a dia do seu escritório | operam atendimentos, prazos, tarefas, minutas, intimações |

- Cada **escritório é um `Team`** (com logo, número de WhatsApp próprio).
- **Isolamento**: cada intimação tem dono; cada um vê só as suas. O dono pode
  **compartilhar** a leitura de uma intimação com um colega do mesmo Team.
- `teamId` pode ser nulo (superadmin) — todo acesso a dado de escritório
  verifica isso antes de filtrar.

---

## 3. Princípios inegociáveis (o DNA do produto)

Estes não são detalhes visuais — são a identidade:

1. **IA sempre sinalizada + validação humana.** Todo conteúdo gerado por IA
   leva o selo `SeloIA` (✨) e depende de decisão de uma pessoa. A IA redige, o
   advogado aprova. Nada sai sozinho.
2. **Cor nunca carrega significado sozinha.** Todo status/selo tem **texto**
   (componente `Selo`). Acessibilidade e clareza acima de estética.
3. **Degrada com elegância.** Sem chave/conexão de uma integração, a tela
   mostra aviso ou **modo demonstração** — **nunca quebra**.
4. **Prazo é sagrado e tem dupla checagem.** Prazo capturado entra como "a
   validar"; só depois de **validação humana** vira oficial.
5. **Auditoria append-only.** Ações sensíveis gravam em `RegistroAuditoria`
   (imutável), com tela escopada por papel.
6. **Tudo em português do Brasil** — UI, código, docs, identificadores.
7. **Segredos só no servidor**, nunca no cliente; **PII do dono** (nome, OAB)
   só via variável de ambiente, nunca hardcoded.

---

## 4. O "motor da operação" (o ciclo central)

O coração do produto é um **loop fechado** em que cada etapa alimenta a
seguinte:

```
WhatsApp (cliente escreve)
    │  webhook recebe, roteia pro Team dono do número
    ▼
IA lê a conversa → RELATO FÁTICO (resumo + linha do tempo + checklist + perguntas)
    │
    ▼
Intimação oficial (DJEN/CNJ, captada pela OAB)  ──► vira PRAZO "a validar"
    │                                                     │ validação humana
    ▼                                                     ▼
Resumo do PROCESSO (andamentos do DataJud, resumidos pela IA)        PRAZO oficial
    │                                                     │
    ▼                                                     ▼
MINUTA assistida por IA (rascunho → edição → aprovação)        TAREFA no kanban
    │
    ▼
DASHBOARD (agrega tudo em tempo real: prazos a validar/vencer, intimações novas,
           tarefas por coluna, minutas por status)
```

Hoje o ciclo é **real de ponta a ponta** (dados do banco), com um único
fallback de demonstração restante: a tela de **Atendimentos** quando não há
conversas reais.

---

## 5. Mapa de telas

**Públicas:** `/entrar` (login), `/proposta` (apresentação comercial estática).

**App (atrás de login, grupo `app/(app)/` com `exigirUsuario`):**

| Tela | Função |
|---|---|
| `/` **Dashboard** | KPIs agregados do banco + atenção/prazos/tarefas/minutas |
| `/atendimentos` | conversas de WhatsApp reais + relato fático da IA + responder pelo chat |
| `/clientes` | CRUD de clientes |
| `/processos` + `/processos/[id]` | carteira de processos; detalhe com andamentos do DataJud + resumo IA (streaming) |
| `/intimacoes` + `/intimacoes/[id]` | intimações captadas do DJEN, com resumo IA e compartilhamento |
| `/djen` | busca "meus processos" pela OAB no DJEN/CNJ + importação |
| `/jurisprudencia` | consulta pública na base nacional (DataJud) |
| `/prazos` | agenda com validação humana; **vista Lista \| Calendário** |
| `/tarefas` | kanban por escritório (A fazer → Em andamento → Em revisão → Concluída) |
| `/minutas` | peças assistidas por IA (rascunho → edição → aprovação, persistidas) |
| `/usuarios` | dono gere a equipe |
| `/credenciais` | dono cadastra OAB, número de WhatsApp e modelos aprovados |
| `/auditoria` | log append-only, escopado por papel |
| `/central` | painel do superadmin: cadastra escritórios |

---

## 6. Modelo de dados (15 entidades)

**Globais (Fase 2 — sem inquilino):**
- **`Cliente`** — pessoa/empresa atendida.
- **`Processo`** — nº CNJ, `AreaProcesso` (TRABALHISTA, CIVEL, FAMILIA,
  TRIBUTARIO, CRIMINAL, CONSUMIDOR, OUTRA), `FaseProcesso` (CONHECIMENTO,
  INSTRUCAO, SENTENCA, RECURSAL, …), tribunal, valor da causa. FK → Cliente.
- **`Prazo`** — descrição, vencimento (data pura, meia-noite UTC), `validado`,
  `concluido`. FK → Processo. **Validação humana é a regra de ouro.**

**Por escritório (multi-inquilino, com `teamId`):**
- **`Team`** — o escritório (nome, logo, `whatsappPhoneNumberId`).
- **`Usuario`** — `PapelUsuario`, senha (scrypt), FK → Team.
- **`Sessao`** — sessão de login (id em cookie httpOnly, expira em 30 dias).
- **`CredencialOab`** — OAB do advogado para a busca no DJEN.
- **`Intimacao`** — publicação captada do DJEN (dedup por `djenId`), com
  `teor`, resumo IA, **dono** (FK → Usuario).
- **`CompartilhamentoIntimacao`** — libera leitura de uma intimação a um colega.
- **`ConversaWhatsapp`** + **`MensagemWhatsapp`** (`DirecaoMensagem`
  RECEBIDA/ENVIADA) — atendimentos reais.
- **`ModeloWhatsapp`** — templates aprovados na Meta (parâmetros `{{1}}…`).
- **`Tarefa`** — kanban (`ColunaTarefa`, `PrioridadeTarefa`). FK → Processo/Usuario.
- **`Minuta`** — peça IA persistida (`StatusMinuta`: RASCUNHO_IA → EDITADA →
  APROVADA). FK → Processo.
- **`RegistroAuditoria`** — trilha append-only.

> A V2 provavelmente quer **promover Cliente/Processo/Prazo a multi-inquilino**
> (hoje são globais) — foi um débito da Fase 2, e o PR de "tenant isolation"
> começou a endurecer isso.

---

## 7. Integrações externas (todas degradam com elegância)

1. **DJEN / Comunica (CNJ)** — captura de intimações pela OAB.
   - Geo-restrito ao Brasil → rotas rodam em **`gru1` (São Paulo)**.
   - Consulta sempre uma **janela recente de datas** (fuso de Brasília,
     `DJEN_DIAS_JANELA`, padrão 30d) + dedup → nada escapa pela borda do dia.
   - **Cron diário** (Vercel, 08h BRT) varre e importa automaticamente,
     protegido por `CRON_SECRET`.
2. **DataJud (CNJ)** — API pública oficial (Elasticsearch) de metadados de
   processos. Dois usos: andamentos de **um** processo (`/processos/[id]`) e
   **jurisprudência**/consulta pública. Roteia o tribunal pelo próprio nº CNJ.
   Chave pública embutida, sobreponível por `DATAJUD_API_KEY`.
3. **WhatsApp Business (Meta Cloud API)** — webhook (handshake + assinatura
   HMAC + dedup), envio pela Graph API, **janela de 24h** respeitada, templates
   fora da janela. Cada Team registra seu `whatsappPhoneNumberId`.
4. **Claude (Anthropic)** — IA real nas minutas, nos resumos de processo e
   intimação, e no **relato fático dos atendimentos**. SDK `@anthropic-ai/sdk`,
   modelo `claude-opus-4-8`. Sem `ANTHROPIC_API_KEY` → modo demonstração.

---

## 8. Arquitetura técnica (V1)

- **Next.js 15** (App Router) + **React 19** + **TypeScript estrito**.
- **Tailwind CSS 4** — sem `tailwind.config`; tokens no bloco `@theme` de
  `app/globals.css`; telas usam classes derivadas (`bg-superficie`, `text-navy`).
- **Prisma 7 + PostgreSQL** (Supabase) — schema em `prisma/schema.prisma`,
  cliente gerado fora do git, conexão única em `lib/bd.ts` (adaptador `PrismaPg`).
- **Páginas = componentes de servidor**; interatividade em componentes de
  cliente por tela (`PainelAtendimentos`, `PainelMinutas`, `QuadroTarefas`…) +
  `useAviso` para toasts.
- **Escrita só por Server Actions** (`lib/acoes/`): validar → gravar →
  `revalidatePath` → `redirect`; erro volta por `?erro=` na URL.
- **Telas de banco** são `force-dynamic`, leitura via `bd`.
- **Auth própria** (`lib/auth.ts`): e-mail+senha (scrypt), sessão em cookie
  httpOnly; `exigirUsuario`/`exigirDono`/`exigirSuperadmin`; `usuarioAtual`
  embrulhado em `cache()` (dedup por request).
- **Performance**: streaming com `<Suspense>` para não deixar API lenta
  (DataJud, até 20s) travar o primeiro paint; `loading.tsx` com esqueletos.

---

## 9. Identidade visual — LEX TECHNOLOGY (feel iOS 26)

- Marca: **"X" de fita dobrada em degradê azul→violeta** (`#2e7dff → #7c3aed`),
  componente `MarcaX`, também favicon.
- Tinta **navy profunda** (`#0f1729`), superfícies claras e frias, squircles,
  sombras suaves em camadas, anel de foco consistente — **feel iOS 26**.
- Sistema de **tokens por significado**: o acento de **ação** é o azul da marca;
  o **sucesso** (validado/aprovado/concluído) tem tokens próprios e **continua
  verde**. Degradê da marca em `.grad-lex`/`.text-grad-lex`.
- O protótipo `public/prototipo.html` é a **especificação viva** (telas, textos,
  fluxos) — referência de produto/design.

---

## 10. Infra, deploy e lições aprendidas (vale ouro para a V2)

- **Deploy na Vercel**; produção em `gru1` (São Paulo), fixado por causa do
  geobloqueio do DJEN/DataJud. **Não mover** as funções dessa região.
- **Banco em São Paulo (`sa-east-1`)** no Supabase, via **Session Pooler**
  (`aws-1-sa-east-1.pooler.supabase.com:5432`). **Lição central:** co-localizar
  banco + função na **mesma região** foi o que matou a latência — não é o plano
  nem o código, é **geografia**. (Conexão *direta* do Supabase é IPv6 e a Vercel
  não alcança; **sempre** usar o pooler.)
- **Migrações no build** (`prisma migrate deploy` via `vercel-build`) — apontar
  `DATABASE_URL` pro banco novo + redeploy reconstrói o schema sozinho.
- **Variáveis de ambiente** guardam todos os segredos e a identidade do dono
  (`SUPERADMIN_*`, `ADVOGADO_*`, `DATABASE_URL`, `ANTHROPIC_API_KEY`,
  `WHATSAPP_*`, `CRON_SECRET`, `DJEN_DIAS_JANELA`).

---

## 11. Estado atual da V1 (pronto / demo / dívidas)

**Pronto (real, do banco):** fases 1 → 5 completas — fundação, CRUD de
clientes/processos/prazos com validação humana, IA real (minutas, resumos,
relato fático), multi-inquilino com login e auditoria, DJEN (busca + cron +
captura), WhatsApp (receber → rotear → mostrar → responder + templates),
dashboard real, tarefas e minutas persistidas.

**Ainda demo/fallback:** atendimentos sem conversas reais; minutas sem
`ANTHROPIC_API_KEY`.

**Dívidas conhecidas (de auditorias de performance + UI/UX):**
- Listas sem paginação (clientes/processos/prazos) e `select` de minutas
  trazendo `teor` inteiro — escalam mal.
- Faltam índices em colunas quentes (`Prazo.vencimento`, `Processo.area/criadoEm`,
  `Cliente.nome`).
- Cliente/Processo/Prazo **globais** (deveriam ser por escritório).
- Sem **modo escuro**; alguns contrastes/alvos de toque a revisar (AA).
- `scryptSync` bloqueante no login; `BarraSuperior` client quase estática.

---

## 12. Oportunidades para a V2 "ultra foda" (matéria-prima pro Fable)

Agrupadas por ambição. Nenhuma é obrigatória — são o cardápio.

**A. Inteligência (o maior diferencial)**
- **Intake agêntico**: a IA conduz o atendimento no WhatsApp (faz as perguntas
  do checklist sozinha), classifica a área, abre o cliente/processo e já sugere
  o próximo passo — sempre com aprovação humana.
- **Minutas com citação verificável** (RAG sobre jurisprudência do DataJud +
  base do escritório): a peça cita precedentes reais, com link à fonte.
- **Previsão de prazo e risco**: a partir dos andamentos, estimar fase e
  prazos prováveis, e sinalizar risco de perda.
- **Assistente transversal** ("pergunte ao LexFlow"): copiloto que responde
  sobre a carteira do escritório (sob isolamento + auditoria).

**B. Operação e colaboração**
- **Portal do cliente**: o cliente acompanha o próprio caso, recebe updates e
  envia documentos.
- **Assinatura eletrônica** de procurações/contratos (DocuSign ou e-CPF/ICP).
- **Financeiro**: honorários, contratos de êxito, cobrança, conciliação.
- **Agenda real** (sync com Google/Outlook) e **notificações** (push/e-mail/
  WhatsApp) para prazos e tarefas.
- **OCR + leitura de peças** (PDF dos autos) alimentando os resumos.

**C. Plataforma e confiança**
- **Multi-inquilino de verdade** em todas as tabelas + RLS no Postgres.
- **LGPD por desenho**: consentimento, retenção, export/delete de dados do
  titular, trilha de acesso.
- **Observabilidade** (erros/latência), **testes** (hoje ausentes) e **CI**.
- **Tempo real** (WhatsApp e dashboard ao vivo), **modo escuro**, **mobile/PWA**.
- **Marketplace de modelos** de peças e de fluxos por área do direito.

**D. Dívidas a pagar junto** (da seção 11): paginação, índices, modo escuro,
acessibilidade AA, `scrypt` assíncrono.

---

## 13. Restrições que a V2 NÃO pode quebrar

1. **IA sempre sinalizada + validação humana** — o produto é "a IA ajuda, o
   advogado decide". Nada protocola/envia sozinho sem aprovação.
2. **Degradação com elegância** em toda integração.
3. **Isolamento multi-inquilino + auditoria** de ações sensíveis.
4. **Sigilo e LGPD**: dado de cliente é privado; PII do dono só em env.
5. **pt-BR** em tudo.
6. **Geografia**: DJEN/DataJud exigem Brasil (`gru1`); banco co-localizado em
   São Paulo. É requisito de performance **e** de conformidade.
7. **Prazo com dupla checagem** (capturado → validado → oficial).

---

*LexFlow V1 — base para a V2. Documento de planejamento; não contém segredos
nem dados reais. Identidade do dono e chaves vivem só em variáveis de ambiente.*
