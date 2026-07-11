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

## Como rodar

Pré-requisito: Node.js 20 ou mais novo (`node -v` para conferir).

```bash
npm install   # baixa as dependências (só na primeira vez)
npm run dev   # sobe o servidor de desenvolvimento
```

Abra <http://localhost:3000> no navegador.

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
  atendimentos/             #   inbox WhatsApp + painel da IA
  clientes/                 #   base de clientes
  processos/                #   carteira + detalhe com linha do tempo
  intimacoes/               #   publicações do DJEN + validação de prazo
  prazos/                   #   agenda da semana + prazos judiciais
  tarefas/                  #   kanban de fluxos
  minutas/                  #   geração de minuta com versões
  globals.css               #   tokens de cor da marca (paleta do protótipo)
components/                 # peças reutilizáveis (Selo, SeloIA, CartaoKpi…)
lib/                        # tipos do domínio e dados do protótipo
public/prototipo.html       # o protótipo original, intocado (especificação viva)
docs/                       # guias e diário de construção
```

## Publicação

O repositório está conectado à Vercel (deploy contínuo):

- **Produção** (branch `main`): <https://juridico-alexpiraginet-7738s-projects.vercel.app>
- Cada branch/PR ganha automaticamente um endereço de pré-visualização.
- O build é configurado por [`vercel.json`](vercel.json) (`framework: nextjs`).

## Documentação

- **[docs/SETUP-MAC.md](docs/SETUP-MAC.md)** — preparar um Mac do zero, clonar e rodar o projeto.
- **[docs/PASSO-A-PASSO.md](docs/PASSO-A-PASSO.md)** — como o projeto foi construído, passo a passo. Cada passo corresponde a um commit do git.

## Roteiro de fases

1. ✅ **Fase 1 — fundação**: estrutura Next.js, navegação e telas base.
2. ✅ **Fase 1.5 — unificação**: o protótipo LexFlow vira o produto (identidade, 8 telas e fluxos de demonstração).
3. ⬜ **Fase 2 — banco de dados**: SQLite + Prisma, cadastro real (criar/editar/excluir).
4. ⬜ **Fase 3 — autenticação e equipe**: login, perfis por função, auditoria.
5. ⬜ **Fase 4 — integrações reais**: WhatsApp Business API e DJEN/Comunica API.
6. ⬜ **Fase 5 — IA de verdade**: relato fático, análise de intimações e minutas geradas pela API do Claude, sempre com validação humana.
