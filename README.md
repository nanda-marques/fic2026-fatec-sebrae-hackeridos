# Focinho Amigo

Site institucional, informativo e dinâmico desenvolvido para a **OSCIP de Proteção Animal Focinho Amigo**, como projeto da **Fatec Sebrae**.

A aplicação possui frontend em React + Vite e backend em Node.js + Express + TypeScript, utilizando banco de dados MySQL.

## Deploy

A versão publicada do frontend está disponível em:

https://fic2026-fatec-sebrae-hackeridos.vercel.app/

A API é executada separadamente no ambiente de backend.

## Problema

A Focinho Amigo necessita ampliar sua visibilidade e facilitar o acesso às informações sobre suas ações e formas de apoio.

A dependência de canais externos pode dificultar a localização de informações sobre animais disponíveis para adoção, campanhas, voluntariado, apadrinhamento e outras formas de contribuição.

Além disso, é necessário centralizar a organização e atualização das informações publicadas no site.

## Solução

O projeto propõe um site institucional responsivo que organiza as principais informações da Focinho Amigo, facilitando o acesso do público a:

- Animais disponíveis para adoção;
- Informações sobre apadrinhamento;
- Oportunidades de voluntariado;
- Formas de ajudar;
- Campanhas, eventos e notícias;
- Informações de contato.

O sistema também possui uma área administrativa para gerenciamento de animais e publicações, centralizando a atualização do conteúdo apresentado ao público.

## Tecnologias

### Frontend

- React
- Vite
- TypeScript
- React Router
- React Icons

### Backend

- Node.js 24.22.1
- Express
- TypeScript
- Sequelize
- Prisma
- JWT
- Resend

### Banco de dados

- MySQL

### Testes

- Vitest
- Supertest

### Infraestrutura

- Vercel — frontend
- Render — backend
- Aiven — banco de dados

> **Observação:** O Sequelize é utilizado como ORM da aplicação, enquanto o Prisma é utilizado para migrations e gerenciamento da estrutura do banco de dados.

## Estrutura do projeto

```text
focinho-amigo/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   ├── .env.example
│   └── package.json
│
├── prisma/
│   └── ...
│
├── docs/
│   ├── 01_Requisitos/
│   ├── 02_Arquitetura/
│   ├── 03_Prototipos/
│   ├── 04_Gerencia_de_Mudancas/
│   └── originais/
│
├── .env.example
├── .nvmrc
├── package.json
└── README.md
```

### Principais diretórios

- `frontend/`: aplicação React, interface pública e área administrativa.
- `backend/`: API REST, autenticação, regras de negócio, integração com banco de dados e serviços externos.
- `prisma/`: migrations e gerenciamento da estrutura do banco de dados.
- `docs/`: documentação técnica e materiais do projeto.
- `docs/originais/`: documentos originais utilizados como referência durante o desenvolvimento.

## Pré-requisitos

Para executar o projeto localmente, é necessário ter:

- Node.js 24.22.1
- npm 11 ou superior
- Git

A versão do Node.js utilizada no projeto está definida no arquivo `.nvmrc`.

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/nanda-marques/fic2026-fatec-sebrae-hackeridos.git
cd fic2026-fatec-sebrae-hackeridos
```

### 2. Instalar as dependências

Na raiz do projeto:

```bash
npm install
```

O projeto utiliza **npm workspaces** para organizar as dependências do frontend e backend.

### 3. Configurar as variáveis de ambiente

Para o backend, copie:

```text
backend/.env.example
```

para:

```text
backend/.env
```

Para o frontend, copie:

```text
frontend/.env.example
```

para:

```text
frontend/.env
```

Os arquivos `.env.example` devem utilizar valores de exemplo para execução local. Credenciais, tokens e chaves reais não devem ser adicionados ao repositório.

### 4. Configuração local

No frontend:

```env
VITE_API_URL=http://localhost:3000
```

No backend, configure as variáveis necessárias para conexão com o banco de dados, autenticação e serviços externos conforme o arquivo `backend/.env.example`.

### 5. Executar o projeto

Para iniciar o backend:

```bash
npm run dev:backend
```

Em outro terminal, inicie o frontend:

```bash
npm run dev:frontend
```

Por padrão:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Banco de dados

O projeto utiliza MySQL.

As variáveis de conexão devem ser configuradas no arquivo:

```text
backend/.env
```

O Prisma está localizado na raiz do projeto e possui scripts para geração do Client, migrations e gerenciamento da estrutura do banco.

### Gerar o Prisma Client

```bash
npm run db:generate
```

### Criar e executar uma migration

```bash
npm run db:migrate
```

### Aplicar migrations existentes

```bash
npm run db:deploy
```

### Verificar o status das migrations

```bash
npm run db:status
```

### Abrir o Prisma Studio

```bash
npm run db:studio
```

### Atualizar o schema a partir do banco

```bash
npm run db:pull
```

Em um banco novo, também é necessário garantir a inicialização dos dados obrigatórios, incluindo os cargos utilizados pela área administrativa.

## Swagger / Documentação da API

A documentação da API é disponibilizada em uma rota dedicada:

```text
http://localhost:3000/api-docs
```

No ambiente de produção, a mesma rota deve ser acessada utilizando a URL do backend publicado.

## Testes

O projeto utiliza **Vitest** e **Supertest** para testes automatizados do backend.

Para executar os testes:

```bash
npm test
```

A suíte possui testes automatizados para diferentes serviços e rotas do backend, incluindo autenticação, publicações, newsletter, recuperação de senha e outros componentes da aplicação.

O objetivo mínimo de validação inclui os fluxos de:

- Login;
- Listagem de animais.

## Build

Para gerar a versão de produção do frontend e backend:

```bash
npm run build
```

Também é possível gerar o build individualmente:

```bash
npm run build:frontend
```

```bash
npm run build:backend
```

Para executar o lint do frontend:

```bash
npm run lint:frontend
```

## Newsletter

O sistema possui integração com o serviço de envio de e-mails **Resend**.

As URLs utilizadas pela newsletter devem ser configuradas por variáveis de ambiente, evitando endereços `localhost` fixos no código.

Em ambiente local, as URLs devem apontar para os serviços executados localmente.

Em produção, devem utilizar as URLs correspondentes ao ambiente publicado.

## Segurança

- Não versionar arquivos `.env`.
- Não adicionar senhas ou tokens reais ao README.
- Não compartilhar credenciais de produção no repositório.
- Utilizar os arquivos `.env.example` apenas como referência das variáveis necessárias.
- As credenciais utilizadas para avaliação devem ser fornecidas separadamente à banca.

## Documentação

A documentação técnica do projeto está organizada em:

```text
docs/
├── 01_Requisitos/
│   └── Documento_Requisitos_v2.pdf
│
├── 02_Arquitetura/
│   ├── Diagrama_Arquitetura_v2.md
│   └── Diagrama_Arquitetura_v2.png
│
├── 03_Prototipos/
│   └── Prototipos_Interface_v2.pdf
│
├── 04_Gerencia_de_Mudancas/
│   └── Changelog.pdf
│
└── originais/
```

Os documentos apresentam os requisitos, a arquitetura, os protótipos e o histórico de alterações do projeto.

## Equipe

| Integrante | GitHub |
|---|---|
| Fernanda | [nanda-marques](https://github.com/nanda-marques) |
| Manuella | [Manuellasantos](https://github.com/Manuellasantos) |
| Matheus | [MatheusBonfim265](https://github.com/MatheusBonfim265) |
| Mayra | [Cosmic-Bubble](https://github.com/Cosmic-Bubble) |