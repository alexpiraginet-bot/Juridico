# LexFlow — Sistema de Gestão Jurídica

Plataforma de gestão para escritórios de advocacia que junta, em um só lugar:

- **Atendimentos via WhatsApp** — inbox multiatendente; enquanto a equipe conversa, a IA monta o relato fático, a linha do tempo e o checklist de documentos.
- **Clientes** — cadastro único com checagem automática de conflito de interesses.
- **Processos** — carteira monitorada, capa enriquecida pelo nº CNJ e linha do tempo unificada.
- **Intimações** — captura automática do DJEN, classificada e resumida pela IA.
- **Prazos** — cálculo determinístico com fundamento legal; nada entra na agenda sem validação de um advogado.
- **Minutas IA** — peças redigidas com o contexto completo do caso, com versões rastreadas; o sistema nunca protocola sozinho.

> Status: protótipo navegável com dados fictícios (o "mundo" da demonstração é 10/07/2026).
> O protótipo original de tela única está preservado em [`public/prototipo.html`](public/prototipo.html) — com o app rodando, acesse `/prototipo.html` para ver inclusive o modo apresentação.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router) + React 19 |
| Linguagem | TypeScript |
| Estilos | Tailwind CSS 4 (tokens da marca em `app/globals.css`) |
| Banco de dados | PostgreSQL na nuvem + [Prisma 7](https://prisma.io) |
| IA | [API do Claude](https://www.anthropic.com) (redação de minutas) |
| Dados públicos | [API Pública do DataJud/CNJ](https://datajud-wiki.cnj.jus.br/api-publica/) (jurisprudência) |

## Como rodar

Pré-requisitos: Node.js 20+ (`node -v`) e a URL de um banco PostgreSQL.

```bash
npm install                 # dependências + cliente do banco (postinstall)
npx vercel env pull .env    # puxa DATABASE_URL e ANTHROPIC_API_KEY do projeto na Vercel
                            # (alternativa: cp .env.example .env e preencher)
npx prisma db seed          # opcional: dados de exemplo do protótipo
npm run dev                 # sobe o servidor de desenvolvimento
```

Abra <http://localhost:3000> no navegador.

Cada integração é **opcional e degrada com elegância**:

- Sem `DATABASE_URL`: as telas de Clientes, Processos e Prazos ficam indisponíveis (as demais funcionam).
- Sem `ANTHROPIC_API_KEY`: a tela de Minutas roda em modo demonstração (crie a chave em <https://console.anthropic.com>).
- A Jurisprudência já vem com a chave pública do CNJ embutida — não exige configuração.

Outros comandos:

```bash
npm run build      # gera a versão otimizada de produção
npm start          # roda a versão de produção (depois do build)
npm run typecheck  # confere os tipos sem gerar nada
```

## Estrutura de pastas

```
app/                        # cada pasta vira uma página (App Router)
  page.tsx                  #   dashboard (rota /)
  atendimentos/             #   inbox WhatsApp + painel da IA (demonstração)
  clientes/                 #   cadastro real (listar/criar/editar/excluir)
  processos/                #   carteira real com filtros por área
  intimacoes/               #   publicações do DJEN + validação de prazo
  jurisprudencia/           #   consulta pública ao DataJud/CNJ (dados reais)
  prazos/                   #   agenda oficial com validação humana
  tarefas/                  #   kanban de fluxos (demonstração)
  minutas/                  #   minutas redigidas pela IA (com validação humana)
  globals.css               #   tokens de cor da marca (paleta do protótipo)
components/                 # peças reutilizáveis (Selo, SeloIA, formulários…)
lib/
  bd.ts                     #   conexão com o PostgreSQL (Prisma)
  ia.ts                     #   conexão com a API do Claude (redação de minutas)
  acoes/                    #   server actions — gravam no banco / chamam a IA
  juris/datajud.ts          #   cliente da API Pública do DataJud/CNJ
  generated/                #   cliente do Prisma (gerado; fora do git)
  dados.ts                  #   conteúdo das telas de demonstração
prisma/                     # schema do banco, migrações e semente
public/prototipo.html       # o protótipo original, intocado (especificação viva)
docs/                       # guias e diário de construção
```

## Publicação

O repositório está conectado à Vercel (deploy contínuo):

- **Produção** (branch `main`): <https://juridico-liard.vercel.app>
- Cada branch/PR ganha automaticamente um endereço de pré-visualização.
- O build é configurado por [`vercel.json`](vercel.json) (`framework: nextjs`).

## Documentação

- **[docs/SETUP-MAC.md](docs/SETUP-MAC.md)** — preparar um Mac do zero, clonar e rodar o projeto.
- **[docs/PASSO-A-PASSO.md](docs/PASSO-A-PASSO.md)** — como o projeto foi construído, passo a passo. Cada passo corresponde a um commit do git.

## Roteiro de fases

1. ✅ **Fase 1 — fundação**: estrutura Next.js, navegação e telas base.
2. ✅ **Fase 1.5 — unificação**: o protótipo LexFlow vira o produto (identidade, 8 telas e fluxos de demonstração).
3. ✅ **Fase 2 — banco de dados na nuvem**: PostgreSQL + Prisma, cadastro real de clientes, processos e prazos com validação humana.
4. 🟡 **Fase 5 — IA e dados reais** (em andamento): minutas redigidas pela API do Claude e consulta pública de jurisprudência ao DataJud/CNJ. Faltam: relato fático e análise de intimações por IA.
5. ⬜ **Fase 3 — autenticação e equipe**: login, perfis por função, auditoria.
6. ⬜ **Fase 4 — integrações de comunicação**: WhatsApp Business API (atendimentos) e captura automática do DJEN (intimações).
