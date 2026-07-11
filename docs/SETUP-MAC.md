# Rodando o Juridico no seu Mac

Guia completo para sair de um Mac "zerado" até o projeto rodando no navegador.
Se algo já estiver instalado, é só pular a etapa.

Todos os comandos abaixo são digitados no **Terminal** (aperte `⌘ + espaço`,
digite "Terminal" e dê Enter).

## 1. Ferramentas de linha de comando da Apple

Instala o `git` e os compiladores básicos:

```bash
xcode-select --install
```

Uma janela vai abrir pedindo confirmação — aceite e aguarde terminar.

## 2. Homebrew (o "instalador de programas" do Mac)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Ao final, o instalador mostra 2 comandos começando com `echo` e `eval` para
ativar o `brew` no seu terminal — copie e execute os que ele indicar.
Confira com:

```bash
brew --version
```

## 3. Node.js

O projeto precisa do Node 20 ou mais novo (foi construído com o Node 22):

```bash
brew install node
node -v   # deve mostrar v22.x ou parecido
```

> Alternativa: se um dia você precisar de várias versões do Node ao mesmo
> tempo, procure pelo `nvm` (Node Version Manager). Para começar, o `brew`
> resolve.

## 4. Configurar o git com a sua identidade

```bash
git config --global user.name "Seu Nome"
git config --global user.email "alexpiraginet@outlook.com"
```

## 5. Conectar o Mac ao GitHub

O jeito mais simples é usar a CLI oficial do GitHub:

```bash
brew install gh
gh auth login
```

Responda: **GitHub.com** → **HTTPS** → **Login with a web browser** e siga o
código que aparecer. Isso deixa o `git` autorizado a baixar e enviar código.

## 6. Clonar o projeto

```bash
cd ~  # ou a pasta onde você guarda seus projetos
git clone https://github.com/alexpiraginet-bot/Juridico.git
cd Juridico
```

Enquanto a Fase 1 ainda não foi aprovada (PR aberto), o código está no branch
de trabalho — mude para ele:

```bash
git checkout claude/new-project-mac-setup-kf8bsx
```

Depois que o PR for aceito no branch `main`, bastará `git checkout main` e
`git pull origin main` para pegar as novidades.

## 7. Instalar as dependências e rodar

```bash
npm install
npm run dev
```

Abra <http://localhost:3000> — você deve ver o dashboard do LexFlow
("Bom dia, Dr. Gustavo"). O protótipo original também fica disponível em
<http://localhost:3000/prototipo.html>. Para parar o servidor, volte ao
Terminal e aperte `Ctrl + C`.

## 8. Editor de código (recomendado)

```bash
brew install --cask visual-studio-code
```

Abra a pasta do projeto com `code .` (dentro de `~/Juridico`). Extensão que
vale instalar: **Tailwind CSS IntelliSense** (autocompleta as classes de
estilo).

## Comandos do dia a dia

| Comando | O que faz |
| --- | --- |
| `npm run dev` | roda o projeto em modo desenvolvimento (recarrega sozinho) |
| `git pull origin <branch>` | traz o que mudou no GitHub para o seu Mac |
| `git log --oneline --reverse` | mostra o histórico na ordem em que foi construído |
| `git show <hash>` | mostra exatamente o que um commit (passo) mudou |
| `npm run typecheck` | confere se os tipos do TypeScript estão corretos |

## Problemas comuns

- **`command not found: brew`** — o Homebrew não foi ativado no terminal;
  repita os comandos `echo`/`eval` que o instalador mostrou (ou feche e abra
  o Terminal).
- **Porta 3000 ocupada** — algum outro programa está usando a porta. Rode
  `lsof -i :3000` para descobrir qual, ou suba em outra porta:
  `npm run dev -- -p 3001`.
- **Erro estranho no `npm install`** — confira a versão do Node (`node -v`,
  precisa ser 20+). Em último caso, apague e reinstale as dependências:
  `rm -rf node_modules package-lock.json && npm install`.
