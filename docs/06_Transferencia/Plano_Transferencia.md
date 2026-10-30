# Plano de Transferência: Focinho Amigo

## 1. Visão geral

Este documento orienta o processo de transferência técnica e operacional da plataforma web **Focinho Amigo** da equipe de desenvolvimento (**Hackeridos - Fatec Sebrae**) para a ONG parceira **Focinho Amigo**.

A arquitetura da aplicação foi desenhada para ser totalmente portável e modular. Por questões de segurança, isolamento de dados e governança, a transferência será realizada através da **criação de novas contas institucionais em nome da ONG** nos provedores de infraestrutura (Aiven, Supabase, Resend, Render e Vercel) e do provisionamento automático da estrutura do banco de dados relacional via **Migrations e Seeders do Sequelize**.

A solução é composta por:

* **Frontend:** Aplicação web em React 19 (Vite / TypeScript) hospedada na **Vercel**.
* **Backend:** API RESTful em Node.js (Express 5 / TypeScript) hospedada no **Render**.
* **Banco de Dados:** **Aiven MySQL** (instância gerenciada com conexão segura via SSL).
* **Armazenamento de Mídias:** Buckets no **Supabase Storage** (`container-posts`, `container-animais`, `container-perfis`).
* **Serviço de E-mail / Newsletter:** **Resend API**.

## 2. Inventário de serviços e contas a serem criadas pela ONG

A ONG criará suas próprias contas gratuitas nos serviços listados abaixo. Nenhum cartão de crédito dos integrantes da equipe de desenvolvimento ficará atrelado à infraestrutura da ONG.

| Item / Serviço | Provedor / Plataforma | Finalidade no Projeto | Custo Estimado | 
| ----- | ----- | ----- | ----- | 
| **Repositório do Código** | GitHub | Hospedagem do código-fonte (Frontend e Backend) | Gratuito | 
| **Frontend Web** | Vercel | Publicação da aplicação React (Vite) | Gratuito (Plano Hobby) | 
| **Backend API** | Render | Hospedagem do Web Service da API Node.js | Gratuito (Plano Free) | 
| **Banco de Dados** | Aiven | Instância de banco de dados relacional MySQL 8.0 com SSL | Gratuito (Free Tier) | 
| **Mídias e Imagens** | Supabase Storage | Armazenamento de fotos de pets, postagens e perfis | Gratuito (Free Plan) | 
| **Envio de E-mails e Newsletter** | Resend API | Transacional de senha e envio em lote da newsletter | Gratuito (Até 3.000 e-mails/mês)\* | 

> **Alerta Crítico — Validação de Domínio na Resend API:**
> No modo de teste/onboarding padrão (`onboarding@resend.dev`), a Resend API **envia e-mails exclusivamente para o e-mail proprietário cadastrado na conta**. Para que a ONG consiga disparar newsletters e e-mails de recuperação de senha para **adotantes, voluntários e o público externo**, a ONG precisará **obrigatoriamente registrar um domínio próprio** (exemplo: `focinhoamigo.com.br` ou `focinhoamigo.org.br`) e validar os registros DNS no painel da Resend. Consulte os detalhes e custos na **Seção 8**.

## 3. Variáveis de ambiente de produção (Nomes e explicações)

Para que a nova infraestrutura funcione, a ONG deverá cadastrar os nomes das variáveis e seus respectivos valores gerados nos novos painéis.

### Backend (Configurado nas variáveis do Render)

* `PORT` — Porta de execução da API no contêiner (padrão: `3000`).
* `NODE_ENV` — Ambiente de execução (definir como `production`).
* `FRONTEND_URL` — URL pública do frontend hospedado na Vercel (para permissão no CORS).
* `DB_NAME` — Nome do banco de dados criado na Aiven (ex: `defaultdb`).
* `DB_USER` — Usuário do banco MySQL fornecido pela Aiven (ex: `avnadmin`).
* `DB_PASSWORD` — Senha do banco de dados fornecida no painel da Aiven.
* `DB_HOST` — Endereço do host fornecido no painel da Aiven.
* `DB_PORT` — Porta de conexão do MySQL na Aiven (padrão: `28833` ou similar).
* `SUPABASE_URL` — URL do projeto criado no Supabase.
* `SUPABASE_KEY` — Chave de API pública/service do projeto Supabase.
* `SUPABASE_BUCKET_POSTS` — Nome do bucket para imagens de postagens (`container-posts`).
* `SUPABASE_BUCKET_ANIMALS` — Nome do bucket para fotos dos pets (`container-animais`).
* `SUPABASE_BUCKET_PERFIL` — Nome do bucket para avatares (`container-perfis`).
* `JWT_SECRET` — Chave secreta aleatória gerada pela ONG para assinar tokens JWT.
* `RESEND_API_KEY` — Chave de API de envio gerada no painel da Resend.
* `EMAIL_FROM` — Endereço de remetente validado no Resend (ex: `Focinho Amigo <contato@focinhoamigo.com.br>`).

### Frontend (Configurado nas variáveis da Vercel)

* `VITE_API_URL` — Endereço público da API REST backend hospedada no Render (ex: `https://focinho-amigo-api.onrender.com`).

## 4. Guia passo a passo de criação das contas e setup da infraestrutura

### Passo 1: Transferência do Repositório (GitHub)

1. A ONG fornece a conta institucional no GitHub.
2. A equipe transfere o repositório privado para a ONG em `Settings > Transfer ownership`.

### Passo 2: Banco de Dados (Aiven MySQL)

1. A ONG cria uma conta em [aiven.io](https://aiven.io).
2. Cria um novo serviço do tipo **Aiven for MySQL** na região `sa-east-1` (São Paulo) no plano **Free Tier**.
3. Copia os dados de acesso: `Host`, `Port`, `User` e `Password`.

### Passo 3: Armazenamento de Mídias (Supabase Storage)

1. A ONG cria uma conta em [supabase.com](https://supabase.com) e inicia um novo projeto.
2. No menu **Storage**, cria 3 buckets com acesso público:
   * `container-posts`
   * `container-animais`
   * `container-perfis`
3. Em `Project Settings > API`, copia a **Project URL** e a **anon / public key**.

### Passo 4: Serviço de E-mail e Validação de Domínio (Resend API)

1. A ONG cria uma conta em [resend.com](https://resend.com) com o e-mail institucional.
2. Em `API Keys`, clica em **Create API Key** e guarda a chave gerada.
3. **Configuração de Domínio (Obrigatório para envio público):**
   * Na aba **Domains**, clica em **Add Domain** e insere o domínio registrado da ONG (ex: `focinhoamigo.com.br`).
   * Acessa o painel de administração do domínio (Registro.br, Cloudflare, etc.) e adiciona os registros DNS informados pela Resend (TXT para SPF/DKIM, MX e CNAME).
   * Aguarda a verificação no painel da Resend.

### Passo 5: Hospedagem do Backend (Render)

1. A ONG cria uma conta em [render.com](https://render.com) e conecta a conta do GitHub.
2. Clica em **New > Web Service** e seleciona o repositório do projeto (pasta `/backend`).
3. Em **Environment Variables**, cadastra todas as variáveis listadas na **Seção 3** com os dados gerados na Aiven, Supabase e Resend.

### Passo 6: Hospedagem do Frontend (Vercel)

1. A ONG cria uma conta em [vercel.com](https://vercel.com) e conecta a conta do GitHub.
2. Clica em **Add New > Project**, escolhe o repositório e define a pasta raiz como `/frontend`.
3. Adiciona a variável de ambiente `VITE_API_URL` apontando para a URL do Web Service gerado no Render.
4. Conclui o deploy.

## 5. Primeiro dia do mantenedor — Provisionamento do Banco e Inicialização

Após a configuração das variáveis de ambiente na Vercel e no Render, o mantenedor técnico da ONG deverá provisionar o banco de dados da aplicação.

### 5.1 Executar migrations e seed

Na raiz do projeto, executar:

```text
npm install
npm run db:generate
npm run db:deploy
npm run seed
```

O processo utiliza:

- **Prisma** para gerar o cliente e executar as migrations responsáveis pela estrutura do banco de dados;
- **Sequelize** como ORM da aplicação e para a execução dos seeds, incluindo a criação dos cargos iniciais.

> **Observação:** O Prisma é utilizado para o gerenciamento das migrations e da estrutura do banco de dados, enquanto o Sequelize é utilizado como ORM da aplicação e na execução dos seeds.

### 5.2 Criar o primeiro usuário administrador

Após a inicialização do banco:

1. Acessar `/admin/cadastro`.
2. Preencher os dados do primeiro usuário administrador utilizando um e-mail institucional da ONG.
3. Concluir o cadastro conforme as regras de aprovação implementadas na aplicação.
4. Acessar `/admin/login` utilizando as credenciais cadastradas.

### 5.3 Validar o funcionamento

Após o primeiro acesso, realizar uma validação básica da aplicação:

- Login e logout do administrador;
- Acesso ao dashboard;
- Listagem e gerenciamento de animais;
- Cadastro e edição de um animal de teste;
- Criação e edição de publicações;
- Visualização das publicações no ambiente público;
- Funcionamento do envio de e-mails pelo Resend;
- Verificação dos logs da aplicação no Render;
- Verificação do deploy e funcionamento do frontend na Vercel.

## 6. Operação do dia a dia

### Publicar nova versão do código

* O deploy utiliza fluxo de integração contínua **CI/CD**.
* Qualquer alteração enviada ou mesclada para a branch principal (`main`) no GitHub dispara automaticamente uma nova compilação e publicação na Vercel e no Render.

### Consultar Logs de Execução

* **Backend (Render):** Acessar o painel do Render, selecionar o serviço da API e abrir a aba **Logs** para inspecionar erros e chamadas do banco de dados.
* **Frontend (Vercel):** Acessar o painel da Vercel no projeto e abrir **Deployments > Function Logs / Runtime Logs**.

### Realizar Backup do Banco de Dados

O mantenedor deve rodar periodicamente o comando `mysqldump` apontando para a instância MySQL da Aiven para garantir cópias de segurança externas:

```bash
# Executar Backup da estrutura e dados
mysqldump -h DB_HOST -P DB_PORT -u DB_USER -p --ssl-mode=REQUIRED DB_NAME > backup_focinho_amigo.sql

# Restaurar Backup em caso de emergência
mysql -h DB_HOST -P DB_PORT -u DB_USER -p --ssl-mode=REQUIRED DB_NAME < backup_focinho_amigo.sql
```

### Alterar Segredos ou Variáveis

1. Acesse o painel do Render ou da Vercel nas configurações de variáveis de ambiente.
2. Modifique o valor desejado (por exemplo, `JWT_SECRET` ou `DB_PASSWORD`).
3. Clique em **Manual Deploy > Deploy latest commit** para aplicar os novos segredos na aplicação.

## 7. Guia de uso para o administrador da ONG

1. **Acesso ao Painel:** Navegue até `/admin/login` e informe e-mail e senha.
2. **Gerenciamento de Publicações:**
   * No menu **Publicações**, crie e edite notícias, eventos, campanhas e chamadas urgentes.
   * O conteúdo cadastrado é enfileirado automaticamente na tabela `ConteudoNewsletter`.
3. **Gerenciamento de Animais:**
   * Cadastre e edite os animais disponíveis para adoção.
   * Utilize a opção **Importar CSV** para cadastrar múltiplos animais simultaneamente.
4. **Envio Automático da Newsletter:**
   * A newsletter é enviada automaticamente aos leitores assim que a fila acumula **4 ou mais itens pendentes**.
   * A entrega nas caixas de entrada dos usuários depende da validação do domínio na conta da Resend.

## 8. Custos estimados (consultados em 30/10/2026)

### Infraestrutura em Nuvem (Serviços Gratuitos)

| Provedor / Serviço | Plano Selecionado | Custo Mensal Estimado | Limite da Cota Gratuita | Link para Tabela de Preços | 
| ----- | ----- | ----- | ----- | ----- | 
| **Vercel** (Frontend) | Hobby | R\$ 0,00 | 100 GB Bandwidth / mês | [vercel.com/pricing](https://vercel.com/pricing) | 
| **Render** (Backend) | Free | R\$ 0,00 | 512 MB RAM / 750h por mês | [render.com/pricing](https://render.com/pricing) | 
| **Aiven** (MySQL) | Free Tier | R\$ 0,00 | 1 GB Armazenamento / 1 vCPU | [aiven.io/pricing](https://aiven.io/pricing) | 
| **Supabase** (Storage) | Free Plan | R\$ 0,00 | 500 MB de mídias / 5 GB Egress | [supabase.com/pricing](https://supabase.com/pricing) | 
| **Resend** (E-mails) | Free Plan | R\$ 0,00 | 3.000 e-mails/mês (100 por dia) | [resend.com/pricing](https://resend.com/pricing) | 

### Opções de Registradores para Domínio Próprio (Necessário para a Resend API)

| Provedor de Domínio | Sugestão de Domínio | Custo Estimado (Anual) | Endereço para Consulta | 
| ----- | ----- | ----- | ----- | 
| **Registro.br** | `focinhoamigo.org.br` / `focinhoamigo.com.br` | **R\$ 40,00 / ano** | [registro.br](https://registro.br) | 
| **Hostinger** | `focinhoamigo.com` / `focinhoamigo.org` | **R\$ 39,90 a R$ 69,90 / ano** | [hostinger.com.br](https://www.hostinger.com.br/nome-de-dominio) | 
| **Cloudflare Registrar** | `focinhoamigo.org` | **\~\$ 10,00 USD / ano** (\~R\$ 55,00/ano) | [cloudflare.com](https://www.cloudflare.com/products/registrar/) | 
| **GoDaddy** | `focinhoamigo.com.br` | **R\$ 59,90 a R$ 89,90 / ano** | [godaddy.com](https://www.godaddy.com) | 

### Resumo do Custo Mensal Estimado

* **Cenário 1 — Operação Gratuita (sem domínio próprio):** R\$ 0,00/mês (e-mails restritos ao titular do Resend).
* **Cenário 2 — Operação Comercial / Envio de Newsletter Pública:** R\$ 0,00/mês de hospedagem em nuvem + **R\$ 40,00/ano** de registro de domínio no Registro.br.

## 9. Como migrar para outra hospedagem ou servidor próprio (VPS)

Se a ONG decidir mover a solução para uma máquina virtual própria (como AWS EC2, DigitalOcean ou servidor local), a sequência de migração é:

1. **Backup:** Exportar a base do Aiven MySQL usando `mysqldump`.
2. **Novo Banco:** Instalar o MySQL 8 no novo servidor, criar a base e restaurar o arquivo `.sql`.
3. **Backend API:**
   * Instalar Node.js e Git no novo servidor.
   * Clonar o repositório, instalar as dependências (`npm install`) e configurar o arquivo `.env` com as novas credenciais do banco.
   * Executar a API em segundo plano usando um gerenciador de processos como o `pm2` (`pm2 start dist/server.js`).
4. **Frontend:**
   * Gerar os arquivos estáticos compilados executando `npm run build` na pasta `/frontend`.
   * Servir a pasta `dist` gerada utilizando um servidor web como Nginx ou Apache.
5. **DNS e CORS:** Atualizar o apontamento do domínio no DNS e reconfigurar a variável `FRONTEND_URL` no arquivo `.env` do backend.

## 10. Riscos conhecidos e contingências

1. **Restrição da Resend API sem Domínio Próprio:**
   * *Risco:* Sem a validação do domínio na conta da Resend, e-mails de newsletter e redefinição de senha não chegam às caixas de entrada dos usuários externos.
   * *Contingência:* Adquirir o domínio `.org.br` no Registro.br e realizar o apontamento DNS conforme detalhado na **Seção 4**.
2. **Suspensão por Inatividade do Render (Spin-down):**
   * *Risco:* No plano gratuito do Render, a API "adormece" após 15 minutos sem requisições, fazendo com que o primeiro acesso demore até 50 segundos para responder.
   * *Contingência:* Cadastrar a URL da API em um monitor de uptime gratuito (ex: UptimeRobot) configurado para enviar requisições de ping a cada 10 minutos.
3. **Cota Máxima de Armazenamento no Supabase (500 MB):**
   * *Risco:* Atingir o limite de armazenamento com fotos em alta resolução.
   * *Contingência:* Utilizar ferramentas de compressão e manter o envio de imagens otimizadas em formato WebP/JPEG no painel.

## 11. Contatos da equipe para suporte no repasse

* **E-mail Oficial da Equipe Hackeridos:** `equipehackeridos@gmail.com`
* **Integrantes Responsáveis:**
  * **Fernanda Marques** (Backend e Frontend)
  * **Manuella Santos Cruz** (Agilista, Frontend e UI/UX)
  * **Matheus Bonfim Batista** (Frontend e UI/UX)
  * **Mayra Lima Passos** (Banco de Dados, DevOps, QA)
* **Instituição:** Fatec Sebrae — Projeto FIC Venturus 2026