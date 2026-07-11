# Diário de construção — passo a passo

Este documento explica **como o Juridico foi construído, na ordem em que foi
construído**. Cada passo corresponde a um commit do git, então você pode
acompanhar pelo próprio histórico:

```bash
git log --oneline --reverse   # lista os passos na ordem
git show <hash>               # mostra tudo o que um passo adicionou
```

> **Nota importante:** os Passos 0 a 5 contam a construção da fundação,
> quando o projeto ainda se chamava "Juridico" e tinha telas genéricas.
> No Passo 6 reencontramos o protótipo original (LexFlow) e, no Passo 7,
> o app assumiu essa identidade — por isso alguns arquivos citados nos
> passos antigos mudaram depois. O git guarda cada estado: use
> `git show <hash>` para ver o projeto exatamente como era em cada passo.

---

## Passo 0 — as decisões antes do código

**O que estamos construindo:** um sistema de gestão para escritório de
advocacia — processos, clientes e prazos.

**Stack escolhida e por quê:**

- **Next.js (App Router)** — um framework de React em que *cada pasta dentro
  de `app/` vira uma página do site*. Ele resolve rota, servidor e
  otimização de uma vez, com um único comando (`npm run dev`).
- **TypeScript** — JavaScript com tipos. Os tipos documentam o formato dos
  dados (o que é um `Processo`? quais campos tem um `Cliente`?) e o editor
  avisa na hora quando algo não bate.
- **Tailwind CSS** — estilização por classes utilitárias (`p-4`,
  `text-sm`, `border`...) direto no HTML. Evita manter arquivos CSS gigantes
  separados do componente.

**Estratégia da Fase 1:** construir as telas com **dados de exemplo em
memória** antes de ter banco de dados. Assim vemos o sistema "de pé" desde o
primeiro dia, e o banco entra depois sem mudar as telas.

---

## Passo 1 — configuração base

> Commit: `Passo 1: configuração base — Next.js 15, TypeScript e Tailwind 4`

Quatro arquivos de configuração criados à mão (sem gerador automático, para
entendermos cada linha):

- **`package.json`** — a identidade do projeto. As partes importantes:
  - `dependencies`: o que o app usa em produção (`next`, `react`, `react-dom`);
  - `devDependencies`: o que só é usado durante o desenvolvimento
    (TypeScript, Tailwind, definições de tipos);
  - `scripts`: os atalhos que você digita (`npm run dev`, `npm run build`...).
- **`package-lock.json`** — gerado pelo `npm install`; "congela" as versões
  exatas de tudo, para o projeto instalar igual em qualquer máquina (por isso
  ele vai para o git).
- **`tsconfig.json`** — regras do TypeScript. Destaques: `"strict": true`
  (checagem máxima) e `"paths": { "@/*": ["./*"] }`, que permite importar
  `@/lib/dados` em vez de `../../lib/dados`.
- **`postcss.config.mjs`** — liga o plugin do Tailwind ao processamento de
  CSS. No Tailwind 4 é só isso: não existe mais `tailwind.config.js`
  obrigatório.
- **`next.config.ts`** — configurações do Next.js (vazio por enquanto, mas
  já no lugar certo para quando precisarmos).

---

## Passo 2 — layout global, tokens de design e navegação

> Commit: `Passo 2: layout global, tokens de design e navegação lateral`

- **`app/globals.css`** — importa o Tailwind e define os **tokens de
  design** no bloco `@theme`: todas as cores do sistema com nomes
  (`superficie`, `tinta`, `acento`, `status-bom`...). Definidas uma única
  vez, viram classes prontas (`bg-superficie`, `text-tinta`). Para mudar a
  cara do sistema inteiro, basta mexer neste arquivo.
- **`app/layout.tsx`** — a "moldura" que envolve todas as páginas: define o
  idioma (`<html lang="pt-BR">`), o título da aba e o esqueleto visual
  (barra lateral + área de conteúdo).
- **`components/BarraLateral.tsx`** — o menu lateral. Este é o primeiro
  **componente de cliente** do projeto: repare no `"use client"` na primeira
  linha. Por padrão os componentes do Next.js rodam **no servidor**; este
  precisa rodar **no navegador** porque usa `usePathname()` para saber qual
  página está aberta e destacar o item ativo. Os ícones são SVGs desenhados
  no próprio arquivo — zero dependências externas.
- **`app/icon.svg`** — o favicon. No App Router basta existir um arquivo com
  esse nome dentro de `app/` que o Next.js o serve automaticamente
  ("metadados por convenção de arquivo").

**Experimente:** mude `--color-acento` no `globals.css` para `#7c3aed` (roxo),
salve e veja o logo e os links mudarem sozinhos com o servidor rodando.

---

## Passo 3 — modelo de domínio e dados de exemplo

> Commit: `Passo 3: modelo de domínio e dados de exemplo`

- **`lib/tipos.ts`** — o **vocabulário do sistema** em interfaces
  TypeScript: `Cliente`, `Processo` (com número CNJ, área, vara, status,
  valor da causa) e `Prazo`. Na Fase 2, essas interfaces guiarão as tabelas
  do banco.
- **`lib/dados.ts`** — 5 clientes, 7 processos e 9 prazos fictícios, mais as
  funções de consulta que as telas usam (`clientePorId`, `prazosPendentes`...).
  As telas **nunca acessam os arrays diretamente**: passam por essas funções.
  Esse detalhe é o que vai permitir trocar os arrays por um banco de dados
  sem reescrever as telas.
- **`lib/formatar.ts`** — formatação em pt-BR num lugar só: moeda
  (`R$ 85.000,00`), datas (`14/07/2026`) e o cálculo de dias até um prazo.

**Experimente:** adicione um cliente novo no array de `lib/dados.ts`, salve e
veja a tela de Clientes (e o cartão do painel) atualizarem na hora.

---

## Passo 4 — as telas

> Commit: `Passo 4: telas — painel, processos, clientes e prazos`

Cada pasta em `app/` vira uma rota:

| Arquivo | Rota | O que mostra |
| --- | --- | --- |
| `app/page.tsx` | `/` | painel com indicadores, próximos prazos e processos recentes |
| `app/processos/page.tsx` | `/processos` | tabela completa de processos |
| `app/clientes/page.tsx` | `/clientes` | tabela de clientes com contagem de processos |
| `app/prazos/page.tsx` | `/prazos` | prazos pendentes por urgência + concluídos |

Componentes reutilizáveis criados neste passo:

- **`CartaoIndicador`** — cartão do painel: rótulo, número grande, apoio.
- **`SeloStatus`** — selo "Ativo/Suspenso/Arquivado/Encerrado". Regra de
  acessibilidade aplicada: a cor **nunca** carrega o significado sozinha — o
  texto sempre diz o status; a bolinha colorida apenas reforça.
- **`ChipPrazo`** — "faltam 4 dias", "vence hoje", "vencido há 2 dias".
  A urgência muda a cor (crítico/sério/alerta), o texto continua dizendo tudo.

Repare que as páginas são **componentes de servidor** (não têm
`"use client"`): elas leem os dados e entregam HTML pronto. Só a barra
lateral roda no navegador.

**Uma curiosidade para estudar:** rodando `npm run build`, o Next.js marca
todas as rotas com `○ (Static)` — como os dados são fixos, ele gera as
páginas **uma vez, no build**. É por isso que, na versão de produção
(`npm start`), a data do painel fica congelada no dia do build. No modo
desenvolvimento (`npm run dev`) tudo é recalculado a cada acesso. Quando o
banco de dados chegar, as rotas passam a ser dinâmicas naturalmente.

**Experimente:** crie `app/sobre/page.tsx` exportando um componente qualquer
e acesse `http://localhost:3000/sobre` — uma pasta + `page.tsx` = uma rota.

---

## Passo 5 — documentação

> Commit: `Passo 5: documentação — README, guia do Mac e diário passo a passo`

README com visão geral, este diário, o guia de setup no Mac
(`docs/SETUP-MAC.md`) e o `CLAUDE.md` — arquivo de contexto que as próximas
sessões do Claude leem para continuar o projeto seguindo as mesmas convenções.

---

## Passo 6 — o reencontro com o protótipo

> Commit: `Passo 6: resgate do protótipo LexFlow`

Aqui a história deu uma volta. O projeto **não** nasceu neste repositório:
ele nasceu como um protótipo navegável de página única — o **LexFlow** —
criado em outra conversa e publicado na Vercel
(`project-pqvs7.vercel.app`). Só que esse código nunca tinha sido salvo no
GitHub: o repositório estava vazio, e por isso os Passos 1–5 construíram
uma fundação genérica.

Neste passo o protótipo foi baixado da própria página publicada (o arquivo
HTML completo, com estilos, dados e scripts) e guardado **intocado** em
`public/prototipo.html`. Duas consequências:

1. Ele nunca mais depende de um servidor externo — está versionado no git.
2. Tudo que está em `public/` é servido como arquivo estático pelo
   Next.js, então com o app rodando você pode abrir
   `http://localhost:3000/prototipo.html` e ver o protótipo original,
   incluindo o modo apresentação ("Seja bem-vindo, Dr. Gustavo…").

**Lição do passo:** um protótipo de arquivo único é ótimo para vender a
ideia e testar o produto, mas difícil de crescer (tudo misturado: dados,
visual e comportamento num arquivo só). A versão estruturada em Next.js
separa essas camadas — e é o que o Passo 7 faz.

---

## Passo 7 — a unificação: o app vira o LexFlow

> Commit: `Passo 7: unificação — o app agora é o LexFlow`

O protótipo deixou de ser referência externa e virou o produto. O que
mudou, camada por camada:

- **Identidade (`app/globals.css`)** — os tokens trocaram para a paleta do
  protótipo: `navy` (#1B2A41) na barra lateral e títulos, `verde` (#7FA65A)
  nas ações, fundo bege claro, seis variações de selo e o par roxo que
  marca conteúdo de IA. Mudou-se um arquivo; o sistema inteiro trocou de
  roupa.
- **Navegação** — as 8 seções do protótipo: Dashboard, Atendimentos,
  Clientes, Processos, Intimações, Prazos, Tarefas e Minutas IA. A barra
  superior ganhou a busca inteligente (demonstração), o selo
  "PROTÓTIPO — dados fictícios" e o atalho **▶ Apresentação**, que abre o
  protótipo original.
- **Dados (`lib/dados.ts` e `lib/tipos.ts`)** — todo o conteúdo fictício
  do protótipo foi tipado: as conversas de Maria Santos e João Pereira com
  a análise da IA, os 4 processos, as intimações com o teor da publicação
  do DJEN, os prazos, o kanban e a minuta de contestação completa.
  Detalhe importante: o "mundo" da demonstração é **congelado em
  10/07/2026** (a citação saiu dia 09/07, o prazo vence 31/07) — datas
  dinâmicas só voltam quando houver banco de dados.
- **Telas** — quatro são páginas simples de servidor (Dashboard, Clientes,
  Processos, Prazos) e quatro têm um componente de cliente com os fluxos
  interativos do protótipo:

  | Tela | Componente de cliente | O que ele faz |
  | --- | --- | --- |
  | Atendimentos | `PainelAtendimentos` | troca de conversa, envio de mensagem, painel da IA |
  | Intimações | `PainelIntimacoes` | **validar o prazo de 31/07** (o coração do produto) |
  | Tarefas | `QuadroTarefas` | mover cards no kanban com ▶ |
  | Minutas | `PainelMinutas` | gerar a minuta com efeito de digitação e aprovar versões |

  Os avisos flutuantes que aparecem embaixo da tela vêm de um só lugar:
  o gancho `useAviso` (`components/useAviso.tsx`).

**Experimente:** abra Intimações e clique em "✔ Validar prazo (31/07)" —
o status da citação muda para "tratada". Depois abra Minutas IA e clique
em "✨ Gerar minuta de contestação" para ver a peça ser "digitada".

**O que ficou de fora (de propósito):** o modo apresentação e o layout de
celular do protótipo (disponíveis em `/prototipo.html`), e a sincronização
entre telas (validar o prazo em Intimações ainda não atualiza a tela de
Prazos — isso precisa de estado compartilhado de verdade, que chega com o
banco de dados na Fase 2).

---

## O que vem a seguir

A Fase 2 troca `lib/dados.ts` por um banco **SQLite** acessado via
**Prisma** e adiciona os primeiros formulários de verdade (cadastrar
cliente, processo e prazo). É também quando ações como "validar prazo"
passam a valer para o sistema inteiro, não só para a tela aberta. Nas
fases seguintes entram autenticação e equipe, as integrações reais
(WhatsApp Business API, DJEN/Comunica API) e a IA de verdade via API do
Claude — sempre com validação humana, como o protótipo promete.
