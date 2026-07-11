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

## Passo 8 — documentação da unificação

> Commit: `Passo 8: documentação da unificação com o protótipo`

README e `CLAUDE.md` assumiram a identidade LexFlow e este diário ganhou
os capítulos dos Passos 6 e 7. Documentar a mudança faz parte da mudança.

---

## Passo 9 — caça ao bug na apresentação (e a miniatura)

> Commit: `Passo 9: apresentação — nome visível e miniatura do Dr. Gustavo`

Nosso primeiro bug de verdade! Na tela de boas-vindas da apresentação, o
nome **DR. GUSTAVO SHIMABUCO** simplesmente não aparecia — e um detalhe
curioso: ele nunca tinha aparecido, nem na versão publicada na Vercel.
O defeito veio junto com o protótipo original.

**A investigação.** Primeiro reproduzimos o problema (abrir a página e
fotografar a tela), depois fomos ler o CSS. O elemento do nome usa duas
classes:

```html
<div class="pwel-name fadeup d2">DR. GUSTAVO SHIMABUCO</div>
```

- `.fadeup` deixa o elemento invisível (`opacity: 0`) e define
  `animation: fu …` — a animação que o faz surgir;
- `.pwel-name` define `animation: glowp …` — o brilho verde pulsante.

Aí está o bug: **as duas regras definem a mesma propriedade
(`animation`)**. Quando duas regras de mesma especificidade disputam uma
propriedade, vence a que aparece **por último no arquivo** — no caso, a
`.pwel-name`. Resultado: o brilho substituía o fade-in; como o brilho só
anima a sombra do texto, a opacidade ficava em 0 para sempre. O nome
estava lá o tempo todo — invisível. O botão verde ("Conhecer o sistema")
tinha exatamente o mesmo problema com a animação de pulso.

**A correção.** Uma regra mais específica (duas classes) que roda as
duas animações **juntas, na mesma declaração**:

```css
.pwel-name.fadeup{animation:fu .9s .55s forwards,glowp 2.8s ease-in-out .55s infinite}
.pbtn.fadeup{animation:fu .9s 1.35s forwards,pulse 2s 1.35s infinite}
```

**Lição do passo:** no CSS, `animation` é uma propriedade só — se duas
regras a definem, uma engole a outra silenciosamente. Para combinar
efeitos, liste as animações separadas por vírgula na mesma regra. E na
dúvida sobre "quem venceu", o inspetor do navegador (botão direito →
Inspecionar) mostra as regras riscadas.

**A miniatura.** A foto do Dr. Gustavo entrou em `public/avatar-gustavo.png`
e aparece em dois lugares: na tela de boas-vindas (classe `.pavatar`, com
anel verde e brilho combinando com o nome) e na barra superior do app, ao
lado do sino. Se o arquivo da foto faltar, a apresentação mostra as
iniciais "GS" no lugar — o `onerror` da tag `<img>` remove a imagem
quebrada e revela o texto de reserva.

Este foi também o primeiro ajuste feito no `public/prototipo.html` — que
em regra não se edita. Correções pontuais pedidas pelo dono são a exceção,
sempre registradas aqui.

---

## Passo 10 — publicação na Vercel (deploy contínuo)

> Commit: `Passo 10: publicação — vercel.json define o framework do build`

O repositório foi conectado à Vercel, e isso liga o **deploy contínuo**:
todo push no `main` publica a versão de produção, e todo push em um
branch gera uma **pré-visualização** com endereço próprio. Merge do PR =
site atualizado, sem passo manual.

Só que os primeiros builds falharam todos, com o erro
`No entrypoint found … add one of: app.js, index.js, server.js…`.
O motivo: o projeto na Vercel foi criado quando o repositório ainda
estava **vazio** (só o README), então ficou configurado como framework
**"Node"** — que procura um arquivo de servidor para executar — em vez
de **"Next.js"** — que roda `next build`. O código estava certo; a
configuração do painel, não.

A correção mora no repositório, não no painel: o arquivo `vercel.json`
com `"framework": "nextjs"` diz à Vercel como construir o projeto, e a
configuração **em código** vence a do painel. É a mesma filosofia dos
outros arquivos de configuração do projeto: tudo versionado no git.

**Lição do passo:** em deploy contínuo, o erro pode estar fora do seu
código — leia o log do build de cima a baixo; a primeira linha de erro
conta a história. E prefira configuração versionada (`vercel.json`) a
cliques no painel: ela viaja com o projeto.

---

## Passo 11 — banco de dados na nuvem (Prisma + PostgreSQL)

> Commit: `Passo 11: banco de dados na nuvem — Prisma + PostgreSQL`

**Por que na nuvem?** O site roda na Vercel em funções que nascem e
morrem a cada requisição, sem disco persistente — um arquivo de banco
local sumiria a cada deploy. A solução é o banco virar um serviço: um
**PostgreSQL** hospedado (criado pelo painel da Vercel, aba Storage),
que o app acessa pela variável de ambiente `DATABASE_URL`. O mesmo
banco atende o site publicado e o `npm run dev` no seu Mac.

As peças, na ordem em que trabalham:

1. **`prisma/schema.prisma`** — a fonte da verdade: cada `model`
   (Cliente, Processo, Prazo) descreve uma tabela, com relações
   (processo pertence a cliente; prazo pertence a processo) e enums
   (área, fase).
2. **Migrações** (`prisma/migrations/`) — `npx prisma migrate dev` compara
   o schema com o banco e gera o SQL da diferença, versionado no git.
   É o "histórico de commits" do banco.
3. **Cliente gerado** (`lib/generated/`, fora do git) — `prisma generate`
   escreve uma biblioteca TypeScript sob medida para o nosso schema:
   `bd.cliente.findMany(...)` já sabe quais campos existem. Recriado a
   cada `npm install` (script `postinstall`).
4. **`lib/bd.ts`** — a conexão única (no Prisma 7, via adaptador do
   driver `pg`).
5. **Semente** (`prisma/seed.ts`) — grava os dados fictícios do
   protótipo com `upsert` (idempotente: rode `npx prisma db seed`
   quantas vezes quiser, nada duplica).

No build da Vercel, `scripts/migrar-se-configurado.mjs` aplica as
migrações quando o `DATABASE_URL` existe — e, em produção sem banco,
falha de propósito com uma mensagem que explica o que criar.

---

## Passo 12 — cadastro real: clientes, processos e prazos

> Commit: `Passo 12: cadastro real — telas e ações de clientes, processos e prazos`

O CRUD (criar, ler, atualizar, excluir) chegou. A engrenagem nova são as
**server actions** (`lib/acoes/`): funções marcadas com `"use server"`
que o formulário chama direto — sem API manual. O ciclo de vida é sempre
o mesmo e vale a pena decorar:

```
<form action={criarCliente}>  →  valida os campos
                              →  grava no banco (Prisma)
                              →  revalidatePath("/clientes")  (limpa o cache da listagem)
                              →  redirect("/clientes")        (volta para a lista)
```

Erros fazem o caminho inverso pela URL (`?erro=CPF já cadastrado`) e a
tela mostra a mensagem — funciona até com JavaScript desligado.

Outras novidades para estudar:

- **`export const dynamic = "force-dynamic"`** nas telas de banco: elas
  consultam o PostgreSQL a cada acesso (aparecem como `ƒ` no build),
  enquanto as telas de demonstração seguem estáticas (`○`).
- **Filtros reais** em Processos: os chips por área saem de um
  `groupBy` no banco, e o filtro viaja pela URL (`?area=TRABALHISTA`).
- **Validação humana de verdade**: prazo criado pela "IA" nasce com o
  selo âmbar "Pendente de validação"; o botão ✔ Validar (uma server
  action) o promove à agenda oficial. E o botão da tela de Intimações
  agora **grava mesmo**: valide lá e veja o prazo aparecer na aba Prazos.
- **Datas dinâmicas liberadas**: com dados reais, os chips "faltam N
  dias" calculam de verdade — o mundo congelado em 10/07/2026 agora
  vale só para as telas de demonstração.

**Como foi verificado:** além do build e da checagem de tipos, o
formulário de novo cliente foi submetido por HTTP puro (sem JavaScript)
— resposta 303, registro no banco, e o caminho de erro de CPF duplicado
voltando com a mensagem certa na URL.

---

## Passo 14 — jurisprudência de verdade: a fonte oficial (DataJud/CNJ)

> Commit: `Passo 14: jurisprudência — consulta pública ao DataJud/CNJ`

**A pergunta que originou este passo:** "como montamos a base de dados
do Jusbrasil de todas as jurisprudências?" A resposta honesta muda o
rumo — e é uma lição importante sobre dados e legalidade.

O **Jusbrasil é uma empresa privada**. A base dele não está à venda nem
pode ser "copiada": fazer isso violaria os termos de uso e o direito
autoral da compilação. Mas há uma notícia melhor: **os dados que o
Jusbrasil usa vêm, na origem, de fontes públicas e gratuitas** — e nós
podemos beber direto da fonte.

A fonte é a **API Pública do DataJud**, a Base Nacional de Dados do
Poder Judiciário, mantida pelo **CNJ** (Conselho Nacional de Justiça).
Ela expõe os metadados de processos de *todos* os tribunais do país —
classe, assuntos, órgão julgador, movimentos — de graça, para qualquer
um. É a mesma água; só que da nascente.

O que foi construído:

- **`lib/juris/datajud.ts`** — o cliente da API. Um `fetch` para o
  endpoint do tribunal escolhido, com a chave pública que o próprio CNJ
  divulga na documentação (trocável por `DATAJUD_API_KEY` se o CNJ
  mudá-la). A busca aceita tanto texto livre (assunto/classe) quanto um
  número CNJ. A função `formatarNumeroCnj` transforma
  `07084425520238080035` no `0708442-55.2023.8.08.0035` que a gente lê.
- **`app/jurisprudencia/page.tsx`** — a tela: escolha o tribunal, digite
  o termo, e os processos aparecem com classe, assuntos e o último
  movimento. É uma página de servidor `force-dynamic` que consulta o CNJ
  a cada busca.
- Um item **Jurisprudência** entrou na barra lateral.

**Lições do passo, que valem além do código:**

1. **Vá à fonte primária.** Antes de pagar por um agregador, veja se o
   dado nasce público. No Direito brasileiro, muita coisa nasce.
2. **Erros de rede são parte do produto.** A API do CNJ tem limite de
   uso na chave pública compartilhada; quando ele estoura, ela responde
   `429`. A tela trata isso com uma mensagem amigável em vez de quebrar —
   o mesmo vale para quedas de conexão. Software que fala com o mundo
   externo *precisa* prever que o mundo às vezes não responde.
3. **Legalidade é requisito, não detalhe.** A solução certa (fonte
   oficial) é também a única sustentável.

**Nota de bastidor:** no ambiente de nuvem onde este passo foi
construído, o `fetch` do servidor não conseguia atravessar o proxy da
sandbox, então a busca ao vivo só roda quando publicada na Vercel. A
correção da transformação (resposta do CNJ → tela) foi verificada
rodando o parser sobre uma resposta real da API.

---

## Passo 15 — a IA de verdade nas minutas (API do Claude)

> Commit: `Passo 15: IA real — minutas geradas pela API do Claude`

Até aqui, o botão "Gerar minuta" reproduzia um texto pronto (o roteiro
do protótipo). Neste passo ele passa a **redigir de verdade**, chamando
a API do Claude com o contexto real do processo.

As peças:

- **`lib/ia.ts`** — a conexão com a Anthropic. Roda **só no servidor**
  (a chave `ANTHROPIC_API_KEY` nunca chega ao navegador). O coração é o
  *system prompt* do redator: escreve em português forense, usa **apenas
  os fatos fornecidos**, nunca inventa lei ou jurisprudência, marca o que
  falta com `[PENDENTE: ...]` e sempre fecha com uma "⚠ NOTA DA IA" de
  pendências e riscos. É o princípio do produto virado regra técnica:
  *a IA redige, o advogado decide.*
- **`lib/acoes/minutas.ts`** — a server action. Busca no banco a capa do
  processo, o cliente e os prazos pendentes, monta o contexto e pede a
  peça ao Claude. Todo erro da API (chave inválida, limite, sem conexão)
  vira uma mensagem clara — a tela nunca quebra.
- **`app/minutas/PainelMinutas.tsx`** — agora tem dois modos:
  - **com chave configurada:** você escolhe o processo, dá orientações
    opcionais ("foque na preliminar de incompetência") e clica em "Gerar
    minuta com IA"; o texto é "digitado" na tela e entra no histórico de
    versões (v1 IA → v2 humana → v3 aprovada);
  - **sem chave:** volta ao modo demonstração, com um aviso de como ligar
    a IA. O app funciona nos dois casos.

**Detalhes que valem estudar:**

- **Segredo no lugar certo.** A chave da API vive numa variável de
  ambiente do servidor, nunca no código nem no navegador. Quem olha o
  "código-fonte" da página no navegador não a encontra.
- **Esforço e tempo.** Gerar uma peça leva tempo; usamos
  `effort: "medium"` e `export const maxDuration = 60` para caber no
  tempo de uma função da Vercel.
- **A IA é sempre sinalizada.** O texto nasce com o `SeloIA` e o rótulo
  "pendente de revisão humana". O sistema **nunca protocola sozinho**.

---

## Passo 16 — documentação das integrações reais

> Commit: `Passo 16: documentação — jurisprudência e IA`

README, `CLAUDE.md` e este diário ganham as duas integrações; o
`.env.example` passa a listar `ANTHROPIC_API_KEY` (IA) e `DATAJUD_API_KEY`
(opcional). Documentar como ligar cada integração faz parte de entregá-la.

---

## Passo 17 — buscar "os meus processos" pela OAB (DJEN)

> Commit: `Passo 17: DJEN — busca de processos pela OAB (captura oficial)`

Até aqui as intimações da tela `/intimacoes` eram de demonstração. Este
passo abre a **captura oficial**: informar a OAB e receber, direto do
**Diário de Justiça Eletrônico Nacional (DJEN/CNJ)**, todas as
comunicações processuais publicadas para aquele advogado — cada uma com o
número do processo. É o começo da Fase 4: primeiro **um botão de busca**;
a automação de hora em hora vem no próximo passo.

As peças:

- **`lib/djen/comunica.ts`** — o cliente da **API Comunica / DJEN**
  (`comunicaapi.pje.jus.br`), a fonte oficial e gratuita, pesquisável
  **pela OAB**. Roda só no servidor. A `buscarNoDjen(oab, uf)` monta a
  consulta, trata os erros com mensagens claras e devolve as comunicações
  já organizadas, com a lista de **processos distintos**.
- **`app/djen/page.tsx`** — a tela *Meus processos*: um formulário com
  OAB e UF (já preenchidos pelas variáveis de ambiente, se existirem) e o
  botão "🔎 Buscar meus processos". Lista cada comunicação com número do
  processo, tribunal, tipo, órgão e um resumo do teor.

**Detalhes que valem estudar:**

- **Geobloqueio — e a região São Paulo.** O CNJ só aceita acessos vindos
  do **Brasil**; de fora, responde `403`. A solução é de infraestrutura,
  não de código: a rota declara `export const preferredRegion = "gru1"` e
  o `vercel.json` fixa `"regions": ["gru1"]`, de modo que a função roda no
  data center de São Paulo e sai com IP brasileiro. É um exemplo de como
  *onde* o código roda pode importar tanto quanto o que ele faz.
- **Parsing defensivo.** Como a resposta real só pode ser inspecionada
  rodando do Brasil, o cliente aceita variações de nome de campo
  (`numero_processo` ou `numeroProcesso`, `siglaTribunal` ou
  `tribunal`…). Programar defensivamente contra um formato que você ainda
  não viu de perto evita que a tela quebre na primeira surpresa.
- **Dados pessoais em variável de ambiente.** Nome e OAB do advogado são
  dados reais: entram por `ADVOGADO_OAB`, `ADVOGADO_UF` e `ADVOGADO_NOME`,
  nunca chumbados no código versionado.

---

## Passo 18 — guardar as intimações no banco (sem duplicar)

> Commit: `Passo 18: DJEN — importar e deduplicar intimações no banco`

O Passo 17 trouxe as comunicações do DJEN para a tela; este passo as
**guarda**. Agora um botão "📥 Importar para o sistema" salva no banco
tudo o que a OAB tem no Diário — inclusive os processos antigos (o
*backfill* histórico).

As peças:

- **`prisma/schema.prisma`** ganha o modelo **`Intimacao`** — a captura
  crua do Diário. Repare que ela **não vira `Processo`** ainda: um
  `Processo` exige um `Cliente` (a parte representada), e dizer quem é o
  cliente é uma decisão humana. A intimação é a matéria-prima; promovê-la
  a processo é um passo posterior, feito por uma pessoa. Fiel ao
  princípio: *a máquina traz, o advogado decide.*
- **`lib/djen/comunica.ts`** ganha duas coisas: um **id estável**
  (`djenId`) para cada comunicação — a mesma publicação sempre gera o
  mesmo id — e a função **`buscarTudoNoDjen`**, que varre todas as
  páginas (não só a primeira), para a importação e o backfill.
- **`lib/acoes/djen.ts`** é a server action da importação: busca tudo e
  grava com `createMany({ skipDuplicates: true })`. A deduplicação é o
  coração aqui — rodar a importação dez vezes **não cria repetido**,
  porque o `djenId` é único no banco. A ação devolve quantas eram novas.

**Detalhes que valem estudar:**

- **Deduplicação no banco, não na memória.** Em vez de a gente comparar
  listas, o próprio PostgreSQL recusa `djenId` repetido (índice único) e
  o Prisma pula essas linhas. É o banco garantindo a regra, sempre.
- **Migração sem banco à mão.** Esta migração foi gerada pelo próprio
  Prisma (`prisma migrate diff` entre o schema antigo e o novo) e é
  aplicada na Vercel pelo `prisma migrate deploy` no build. O SQL é do
  Prisma, não escrito no braço.
- **Degrada com elegância.** A contagem "X já no sistema" é protegida:
  sem banco configurado, a busca ao DJEN continua funcionando.

---

## Passo 19 — abrir o processo com um resumo da IA

> Commit: `Passo 19: processo — resumo da IA a partir dos andamentos (DataJud)`

Clicar num processo agora abre uma **página de detalhe** que conta, em
português claro, do que ele trata, em que fase provavelmente está e o que
aconteceu de mais recente — um resumo escrito pela IA a partir dos
**andamentos oficiais** do processo.

De onde vêm os andamentos: da **API Pública do DataJud/CNJ**, a mesma da
tela de Jurisprudência. O truque é descobrir o tribunal **pelo próprio
número CNJ**: no formato `…AAAA.J.TR.OOOO`, o dígito `J` diz o ramo da
Justiça e `TR` o tribunal — então `…8.08…` é o TJES, `…5.17…` o TRT-17,
`…4.02…` a Justiça Federal. Sem precisar escolher nada, o sistema sabe
onde buscar.

As peças:

- **`lib/juris/datajud.ts`** ganha `aliasDoNumeroCnj` (o número → índice do
  DataJud) e `consultarProcesso`, que devolve a **linha do tempo completa**
  dos movimentos, ordenada do mais novo para o mais antigo.
- **`lib/ia.ts`** ganha `resumirProcessoComClaude`. Mesma disciplina do
  redator de minutas: usa **só os andamentos dados**, não inventa, e trata
  a fase como **leitura** da IA (a conferir nos autos). A resposta vem em
  **JSON estruturado** (`output_config.format`) — resumo, fase provável,
  andamentos "em miúdos" e pontos de atenção — para a tela montar tudo
  bonitinho, sempre com o `SeloIA`.
- **`app/processos/[id]/page.tsx`** — a tela de detalhe. A página aparece
  na hora (cabeçalho + andamentos) e o **resumo da IA entra depois**, dentro
  de um `<Suspense>`: nada de esperar a IA de tela em branco. Mostra também
  as **intimações do DJEN** já capturadas para aquele processo (Passo 18) —
  as duas pontas se encontram.

**Detalhes que valem estudar:**

- **O número já diz o tribunal.** Programar o `aliasDoNumeroCnj` é um bom
  exercício de ler um padrão (a numeração única do CNJ) e extrair
  significado dele.
- **`<Suspense>` para o que é lento.** A parte cara (a IA) carrega em
  separado; a página não trava esperando. É o jeito do Next.js de
  "streamar" pedaços prontos.
- **Autos completos ≠ andamentos.** Puxar os *autos* inteiros (petições,
  decisões) exige login/certificado por tribunal no PJe — fica para
  depois. Os andamentos públicos do DataJud já bastam para o resumo.

---

## Passo 20 — a publicação inteira e o resumo da IA da intimação

> Commit: `Passo 20: DJEN — publicação na íntegra e resumo da IA por intimação`

Na tela *Meus processos*, cada comunicação mostrava só um trecho do teor
(cortado com "…"). Agora dá para ler a **publicação inteira** e pedir um
**resumo da IA** daquela intimação — do que se trata, o que ela exige e o
prazo que o próprio texto menciona.

O que mudou:

- **`lib/djen/comunica.ts`** passa a guardar o **teor completo** (`teor`),
  não só a prévia (`resumo`). Antes a gente jogava o texto fora ao cortar;
  agora ele fica.
- **`prisma/schema.prisma`** ganha a coluna `teor` na `Intimacao` (migração
  automática), e a importação salva o texto todo.
- **`lib/ia.ts`** ganha `resumirIntimacaoComClaude`: lê o teor e devolve, em
  JSON, o resumo, "o que pede", o **prazo mencionado no texto** (sem
  calcular datas nem inventar prazo) e pontos de atenção.
- **`app/intimacoes/[id]/page.tsx`** — a página da publicação: resumo da IA
  (dentro de `<Suspense>`) e a **íntegra** logo abaixo.
- Na lista (`/djen`), cada cartão ganhou um **"ler publicação inteira"**
  (abre o texto ali mesmo) e um botão **"✨ Ver publicação e resumo da IA"**
  que salva aquela intimação e leva para a página de detalhe.

**Detalhes que valem estudar:**

- **Não perca o dado na origem.** O erro anterior era resumir cedo demais e
  descartar o resto. Guardar o teor inteiro e cortar só na exibição é a
  regra: transforme para mostrar, não para armazenar.
- **Prazo é do texto, não da IA.** O resumo só repete o prazo que a
  publicação traz — nada de calcular vencimento. Prazo na agenda continua
  exigindo validação humana (princípio do produto).
- **`<details>` nativo.** "Ler publicação inteira" usa a tag `<details>` do
  HTML — abre e fecha sem uma linha de JavaScript.

---

## O que vem a seguir

Ainda na **Fase 4**: ligar a **busca automática de hora em hora** do DJEN
(captura sozinha os processos novos) — além do WhatsApp Business API para
os atendimentos. E, quando fizer sentido, puxar os **autos completos** do
PJe (com credenciais) para além dos andamentos e das intimações.
Depois, a **Fase 3** (autenticação, perfis por função e o log de
auditoria — "quem validou este prazo, e quando?") e o que falta da
**Fase 5** (estender a IA para o relato fático e a análise de
intimações). O alicerce — banco na nuvem, IA conectada, consulta pública
ao Judiciário e agora a captura oficial pela OAB — já está de pé.
