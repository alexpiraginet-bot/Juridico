# Configurar o WhatsApp Business no LexFlow (Meta Cloud API)

Guia passo a passo para ligar os atendimentos do LexFlow ao WhatsApp de
verdade, usando a **API oficial da Meta (WhatsApp Cloud API)**. Sem nenhum
intermediário (BSP).

> A interface da Meta muda de tempos em tempos. Os nomes dos menus podem
> variar um pouco; os **links oficiais** ao lado de cada etapa continuam
> valendo. Documentação-mãe:
> <https://developers.facebook.com/docs/whatsapp/cloud-api/get-started>

---

## De quem é o quê (arquitetura)

Três peças, donos diferentes:

- **O App na Meta** → **nosso** (LexFlow). Um só, para a plataforma inteira.
  Nós somos o *Tech Provider*.
- **A conta WhatsApp Business (WABA) + o número** → **do cliente** (cada
  escritório). O número é a marca dele.
- **A cobrança por conversa** → **do cliente** (meio de pagamento na WABA
  dele).

O cliente **conecta o número dele ao nosso app**; as mensagens de todos os
escritórios chegam no **nosso único webhook**; o LexFlow **roteia pelo
`phone_number_id`** para o Team certo.

**Dois momentos:**

1. **MVP / teste** — um número só, no nosso app (a Meta dá um número de teste
   grátis). É o que este guia cobre nas Partes A–E.
2. **Multi-inquilino** — cada escritório conecta o próprio número via
   *Embedded Signup* (Parte F). Exige verificação do negócio + revisão do app.

---

## Pré-requisitos

- Uma conta no Facebook.
- Um **Meta Business** (Gerenciador de Negócios): <https://business.facebook.com>
  — crie um se não tiver (Configurações do Negócio → criar).
- O LexFlow publicado (já está): a URL do webhook será
  `https://juridico-liard.vercel.app/api/whatsapp/webhook`.

---

## Parte A — Criar o app e pegar o número de teste

1. Acesse <https://developers.facebook.com/apps/> e clique em **Criar app**
   (*Create App*).
2. Em "caso de uso" (*use case*), escolha **Outro** (*Other*) → tipo de app
   **Negócios** (*Business*) → vincule ao seu Meta Business.
3. No painel do app, em "Adicionar produtos", encontre **WhatsApp** e clique
   em **Configurar** (*Set up*).
   - Isso cria uma **WABA de teste** e um **número de teste grátis**.
4. Vá em **WhatsApp → Configuração da API** (*API Setup* / *Getting Started*).
   Anote os três valores que aparecem ali:
   - **Token de acesso temporário** (vale 24 h) → servirá de `WHATSAPP_TOKEN`
     só para o primeiro teste (na Parte C trocamos por um permanente).
   - **Identificação do número de telefone** (*Phone number ID*) →
     `WHATSAPP_PHONE_NUMBER_ID`.
   - **Identificação da conta do WhatsApp Business** (*WhatsApp Business
     Account ID* / WABA ID) → guarde, é usado no roteamento e nos webhooks.
5. Ainda nessa tela, no bloco "Para" (*To*), **adicione seu próprio celular**
   como número de destino de teste (até 5). A Meta manda um código de
   verificação por WhatsApp — confirme.
6. Clique em **Enviar mensagem** (*Send message*) — chega um "hello world" no
   seu celular. ✅ Envio funcionando.

Docs: <https://developers.facebook.com/docs/whatsapp/cloud-api/get-started>

---

## Parte B — Configurar o webhook (receber mensagens)

1. Vá em **WhatsApp → Configuração** (*Configuration*).
2. No bloco **Webhook**, clique em **Editar** e preencha:
   - **URL de callback**: `https://juridico-liard.vercel.app/api/whatsapp/webhook`
   - **Token de verificação**: **um segredo que você inventa** (ex.: uma
     senha longa aleatória). Esse mesmo valor vai em `WHATSAPP_VERIFY_TOKEN`
     na Vercel (Parte E) — os dois têm de ser **idênticos**.
3. Clique em **Verificar e salvar** (*Verify and save*). A Meta chama a nossa
   rota `GET /api/whatsapp/webhook` com um desafio; a rota devolve o desafio
   se o token bate. Se der erro aqui, confira que a variável já está na Vercel
   e que os valores são iguais.
4. Ainda em Configuração, em **Campos do webhook** (*Webhook fields*), clique
   em **Gerenciar** e **assine** (*Subscribe*) o campo **messages**. Sem isso,
   as mensagens recebidas **não** chegam.

Docs: <https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks>

> Já dá para testar: mande uma mensagem do seu celular para o número de teste.
> Ela chega no nosso webhook e é gravada. (A tela de Atendimentos passa a
> mostrá-la quando o Passo 31/32 estiver no ar.)

---

## Parte C — Token permanente (usuário do sistema)

O token da Parte A expira em 24 h. Para produção, gere um **permanente**:

1. Vá em <https://business.facebook.com/settings/system-users> (Configurações
   do Negócio → **Usuários do sistema**).
2. Clique em **Adicionar**, dê um nome (ex.: `lexflow-whatsapp`) e papel
   **Administrador**.
3. Clique no usuário do sistema criado → **Adicionar ativos** (*Assign
   assets*) → aba **Apps** → selecione o app do LexFlow → dê **controle
   total**. Faça o mesmo pela aba **Contas do WhatsApp** com a sua WABA.
4. Clique em **Gerar novo token** (*Generate new token*):
   - Selecione o app do LexFlow.
   - Validade: **Nunca expira** (ou 60 dias).
   - Marque as permissões **`whatsapp_business_messaging`** e
     **`whatsapp_business_management`**.
   - Copie o token — ele **só aparece uma vez**. Esse é o `WHATSAPP_TOKEN` de
     produção.

Docs: <https://developers.facebook.com/docs/whatsapp/business-management-api/get-started>

---

## Parte D — App Secret (validar a assinatura)

O webhook confere que cada entrega veio mesmo da Meta, com a assinatura HMAC.

1. No painel do app: **Configurações do app → Básico** (*App Settings →
   Basic*).
2. No campo **Chave secreta do app** (*App Secret*), clique em **Mostrar** e
   copie. Esse é o `WHATSAPP_APP_SECRET`.

---

## Parte E — Variáveis de ambiente na Vercel

No projeto na Vercel → **Settings → Environment Variables**, adicione (e
depois **redeploy**):

| Variável | Valor |
|---|---|
| `WHATSAPP_TOKEN` | o token permanente (Parte C) |
| `WHATSAPP_PHONE_NUMBER_ID` | a identificação do número (Parte A) |
| `WHATSAPP_VERIFY_TOKEN` | o mesmo segredo do webhook (Parte B) |
| `WHATSAPP_APP_SECRET` | a chave secreta do app (Parte D) |
| `WHATSAPP_API_VERSION` | opcional; padrão `v21.0` |

> Ordem prática: coloque `WHATSAPP_VERIFY_TOKEN` **antes** de clicar em
> "Verificar e salvar" na Parte B (o handshake precisa dela).

No LexFlow, o **dono do escritório** informa a *identificação do número*
(`phone_number_id`) na tela de **Credenciais** — é assim que a plataforma sabe
que aquele número é daquele escritório e roteia as conversas para o Team dele.

---

## Parte F — Produção e multi-inquilino (cada escritório com o número dele)

Para sair do teste e cada escritório usar o **próprio número**:

1. **Verificação do negócio** (*Business Verification*) no Centro de
   Segurança do Meta Business — envie os documentos da empresa.
   Docs: <https://www.facebook.com/business/help/2058515294227817>
2. **Registrar um número real** na WABA (WhatsApp → Configuração da API →
   *Adicionar número*). O número **não pode** estar num WhatsApp pessoal e
   precisa receber SMS/ligação para verificar. Defina o **nome de exibição**
   (passa por aprovação).
3. **Revisão do app** (*App Review*) pedindo **acesso avançado** às permissões
   `whatsapp_business_messaging` e `whatsapp_business_management` — necessário
   para operar em nome de **outros** negócios.
4. **Embedded Signup** — o fluxo em que o cliente entra com o Facebook dele,
   escolhe/cria a WABA e o número, e autoriza o nosso app em poucos cliques.
   É o jeito escalável de conectar cada escritório.
   Docs: <https://developers.facebook.com/docs/whatsapp/embedded-signup>
5. **Limites de mensagens** sobem com uso + qualidade (1k → 10k → ilimitado).

---

## Custos (resumo)

A Meta cobra **por conversa** (janela de 24 h), com preço que varia por país e
categoria (serviço, utilidade, marketing). Há uma cota de conversas de
*serviço* gratuitas por mês. No modelo recomendado, **cada escritório paga as
próprias conversas** (meio de pagamento na WABA dele).

- Preços: <https://developers.facebook.com/docs/whatsapp/pricing>

---

## Checklist rápido

- [ ] App criado (tipo Negócios) e produto WhatsApp adicionado.
- [ ] Número de teste + celular de destino verificado; "hello world" recebido.
- [ ] `WHATSAPP_VERIFY_TOKEN` na Vercel **antes** de verificar o webhook.
- [ ] Webhook verificado e salvo; campo **messages** assinado.
- [ ] Token permanente (usuário do sistema) gerado com as duas permissões.
- [ ] App Secret copiado.
- [ ] As 4 variáveis `WHATSAPP_*` na Vercel + redeploy.
- [ ] Na tela de **Credenciais**, o dono informou a identificação do número.
- [ ] (Produção) verificação do negócio + número real + App Review + Embedded
      Signup.
