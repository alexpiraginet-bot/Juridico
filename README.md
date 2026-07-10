# Juridico

Sistema de gestão para escritórios de advocacia: **processos, clientes e prazos** em um só lugar.

> Status: em construção — Fase 1 concluída (fundação e telas com dados de exemplo).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router) + React 19 |
| Linguagem | TypeScript |
| Estilos | Tailwind CSS 4 |

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
app/                  # cada pasta aqui vira uma página (App Router)
  layout.tsx          #   moldura comum a todas as páginas
  page.tsx            #   painel (rota /)
  processos/page.tsx  #   rota /processos
  clientes/page.tsx   #   rota /clientes
  prazos/page.tsx     #   rota /prazos
  globals.css         #   Tailwind + tokens de cor do projeto
components/           # peças visuais reutilizáveis
lib/                  # tipos do domínio, dados de exemplo e formatação
docs/                 # guias e diário de construção
```

## Documentação

- **[docs/SETUP-MAC.md](docs/SETUP-MAC.md)** — preparar um Mac do zero, clonar e rodar o projeto.
- **[docs/PASSO-A-PASSO.md](docs/PASSO-A-PASSO.md)** — como o projeto foi construído, passo a passo e arquivo por arquivo. Cada passo corresponde a um commit do git.

## Roteiro de fases

1. ✅ **Fase 1 — fundação**: estrutura do projeto, navegação e telas lendo dados de exemplo.
2. ⬜ **Fase 2 — banco de dados**: SQLite + Prisma, cadastro real (criar/editar/excluir).
3. ⬜ **Fase 3 — autenticação**: login e usuários do escritório.
4. ⬜ **Fase 4 — prazos inteligentes**: alertas de vencimento e agenda.
5. ⬜ **Fase 5 — documentos**: anexos e modelos de petição.
