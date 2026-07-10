# Diário de construção — passo a passo

Este documento explica **como o Juridico foi construído, na ordem em que foi
construído**. Cada passo corresponde a um commit do git, então você pode
acompanhar pelo próprio histórico:

```bash
git log --oneline --reverse   # lista os passos na ordem
git show <hash>               # mostra tudo o que um passo adicionou
```

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

## O que vem a seguir

A Fase 2 troca os arrays de `lib/dados.ts` por um banco **SQLite** acessado
via **Prisma**, e adiciona formulários de cadastro (criar/editar processos,
clientes e prazos). Como as telas já leem tudo por funções de consulta, a
troca será localizada — um bom teste da arquitetura da Fase 1.
