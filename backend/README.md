# Backend

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Sequelize
- MySQL
- Supabase
- Resend
- Vitest

## Requisitos

Antes de iniciar, tenha instalado:

- Node.js na versão `24.22.1`
- npm na versão `11` ou superior
- Acesso ao banco de dados MySQL
- Credenciais do Supabase para os recursos que utilizam armazenamento

## Instalação

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Acesse a pasta do backend:

```bash
cd fic2026-fatec-sebrae-hackeridos/backend
```

Instale as dependências:

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` e configure as variáveis necessárias:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

# Banco de dados MySQL
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=
DB_HOST=
DB_PORT=

# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# Buckets do Supabase
SUPABASE_BUCKET_posts=container-posts
SUPABASE_BUCKET_ANIMALS=container-animais
SUPABASE_BUCKET_perfil=container-perfis

# Resend
RESEND_API_KEY=
EMAIL_FROM=

# Autenticação
JWT_SECRET=
```

Preencha os valores de acordo com as credenciais do ambiente utilizado.

**Importante:** não compartilhe o arquivo `.env` nem envie credenciais para o repositório. Ele deve permanecer no `.gitignore`.

## Executando o projeto

Para iniciar o servidor em ambiente de desenvolvimento:

```bash
npm run dev
```

Para compilar o projeto:

```bash
npm run build
```

Para iniciar a aplicação compilada:

```bash
npm start
```

## Testes automatizados

O projeto utiliza **Vitest** para executar os testes automatizados do backend.

Executar todos os testes:

```bash
npm test
```

Executar os testes em modo de observação:

```bash
npm run test:watch
```

### Cobertura dos testes

Os testes estão organizados em `src/tests/` e contemplam os seguintes módulos:

| Arquivo | Funcionalidade testada |
|---|---|
| `animais.service.test.ts` | Serviços relacionados aos animais |
| `auth.routes.test.ts` | Rotas de autenticação |
| `auth.service.test.ts` | Regras de autenticação |
| `config.setup.test.ts` | Configurações iniciais |
| `importarCsv.service.test.ts` | Importação de dados CSV |
| `newsletter.service.test.ts` | Serviços da newsletter |
| `publicacoes.service.test.ts` | Serviços de publicações |
| `recuperacao.service.test.ts` | Recuperação de senha |
| `upload.controller.test.ts` | Controle de uploads |

Os testes utilizam mocks para isolar os serviços e evitar operações desnecessárias em serviços externos durante a execução.

**Última execução:** 51 testes aprovados em 9 arquivos de teste.

### Observação sobre o envio de e-mails

O cliente do Resend está mockado no ambiente atual de testes. Dessa forma, as chamadas de envio retornam uma resposta simulada, sem realizar o disparo de e-mails reais.

Para validar o envio efetivo, será necessário configurar uma chave válida do Resend e utilizar a integração real do serviço.

## Estrutura do backend

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── server.ts
├── .env
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Funcionalidades

### Autenticação
- Autenticação de administradores.
- Validação de acesso às rotas protegidas.
- Recuperação de senha.

### Animais
- Cadastro e gerenciamento de animais.
- Consulta de animais disponíveis.
- Importação de dados por CSV.
- Upload de imagens.

### Publicações
- Cadastro e gerenciamento de publicações.
- Consulta de publicações.
- Gerenciamento de informações e imagens.

### Newsletter
- Gerenciamento de inscritos.
- Organização de conteúdos destinados à newsletter.
- Integração com o serviço de envio de e-mails.

### Uploads
- Integração com o armazenamento do Supabase.
- Upload de imagens para os buckets configurados.

## Desenvolvimento

O backend é responsável por disponibilizar os dados e as funcionalidades utilizados pelo frontend do Focinho Amigo, centralizando as regras de negócio, a comunicação com o banco de dados e as integrações externas.

---
**Equipe:** Hackeridos  
**Instituição:** FATEC / Sebrae