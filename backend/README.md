# Backend

API REST do Focinho Amigo, desenvolvida com Node.js, Express 5, TypeScript e Sequelize. O projeto utiliza MySQL para persistência dos dados e Supabase Storage para armazenamento de imagens.

## Tecnologias

- Node.js 24.22.1
- Express 5
- TypeScript 5.6
- Sequelize 6
- MySQL
- JWT para autenticação
- bcryptjs para hash de senhas
- Multer para upload de imagens
- CORS para controle de acesso entre origens
- dotenv para gerenciamento de variáveis de ambiente
- Supabase Storage para armazenamento de arquivos
- Resend para envio de e-mails de recuperação de senha

## Tecnologias utilizadas

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="55" alt="Node.js" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="55" alt="Express" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="55" alt="TypeScript" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-original.svg" width="55" alt="Sequelize" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" width="55" alt="MySQL" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" width="55" alt="Supabase" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="55" alt="npm" />
</p>

<p align="center">
  Node.js • Express • TypeScript • Sequelize • MySQL • Supabase • npm
</p>

## Estrutura do projeto

```text
backend/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts
    ├── models/
    ├── config/
    ├── controllers/
    ├── routes/
    ├── middlewares/
    ├── services/
    ├── types/
    └── seed/
```

- `server.ts`: inicializa o servidor, registra as rotas e estabelece a conexão com o banco.
- `models/`: define os modelos e as associações do banco de dados.
- `config/`: reúne as configurações do MySQL e do Supabase.
- `controllers/`: trata as requisições e as respostas da API.
- `routes/`: define os endpoints disponíveis.
- `middlewares/`: contém autenticação, controle de permissões, upload e tratamento de erros.
- `services/`: concentra regras de negócio e integrações externas.
- `types/`: reúne as definições de tipos utilizadas na aplicação.
- `seed/`: contém os dados iniciais dos cargos do sistema.

## Banco de dados

O banco de dados utiliza MySQL com Sequelize e conexão SSL.

Principais modelos:

- `Cargo`: define os cargos e suas permissões para gerenciar animais, conteúdo, newsletter e administradores.
- `Administrador`: armazena nome, e-mail, senha, cargo e status da conta.
- `Animal`: reúne os dados dos animais disponíveis para adoção.
- `Publicacao`: armazena notícias, eventos, campanhas e outras publicações.
- `ImagemPerfil`: mantém as referências às fotos de perfil armazenadas no Supabase.
- `HistoricoSolicitacaoAdmin`: registra aprovações e rejeições de cadastros.
- `TokenRecuperacao`: armazena os hashes dos tokens utilizados na recuperação de senha, além da validade e do status de uso.

Os modelos utilizam `underscored: true`, mantendo os nomes das colunas no padrão `snake_case`.

Na inicialização, o servidor executa `sequelize.sync()`. A função `adicionarCamposComplementares()` verifica e adiciona algumas colunas do modelo `Animal`, quando necessário.

## Endpoints

### Recuperação de senha — `/api/recuperacao`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/solicitar` | Solicita a recuperação de senha e envia o link por e-mail. |
| POST | `/redefinir` | Redefine a senha utilizando um token válido. |

O endpoint `/solicitar` recebe o e-mail do administrador. Quando o endereço está cadastrado, o sistema gera um token aleatório com `crypto.randomBytes`, armazena seu hash com `bcryptjs` e envia o link de recuperação pelo Resend.

O token tem validade de uma hora e só pode ser utilizado uma vez. A resposta da solicitação não informa se o e-mail está cadastrado.

O endpoint `/redefinir` recebe o token e a nova senha. Após validar o token, o sistema atualiza a senha do administrador e marca o token como utilizado.

### Autenticação — `/api/auth`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/cadastro` | Cadastra um administrador. |
| POST | `/login` | Autentica um administrador. |
| GET | `/me` | Retorna os dados do usuário autenticado. |

O cadastro aceita `multipart/form-data`, com nome, sobrenome, e-mail, cargo, senha e foto opcional. As novas contas são criadas com status pendente.

No login, são verificadas a senha e a situação da conta. Administradores autorizados recebem um JWT com validade de duas horas.

### Administradores — `/api/admin`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/me` | Consulta o perfil do administrador. |
| PUT | `/me` | Atualiza nome e e-mail. |
| PUT | `/senha` | Altera a senha. |
| GET | `/pendentes` | Lista cadastros pendentes. |
| PATCH | `/:id/aprovar` | Aprova um cadastro. |
| PATCH | `/:id/rejeitar` | Rejeita um cadastro. |
| GET | `/historico-solicitacoes` | Lista as últimas solicitações. |

Todas as rotas exigem autenticação. A consulta de pendências, as decisões sobre cadastros e o acesso ao histórico também exigem permissão para gerenciar administradores.

### Animais — `/api/animais`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/publicos` | Lista os animais disponíveis para consulta pública. |
| GET | `/` | Lista os animais. |
| GET | `/:id` | Consulta um animal pelo ID. |
| POST | `/` | Cadastra um animal. |
| PUT | `/:id` | Atualiza os dados de um animal. |
| DELETE | `/:id` | Exclui um animal. |

A rota `/publicos` não exige autenticação e retorna somente os dados destinados à consulta pública. As demais operações exigem autenticação e as permissões correspondentes.

Os campos são validados conforme os tipos e limites definidos na aplicação.

### Publicações — `/api/publicacoes`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Lista publicações publicadas. |
| GET | `/dashboard/resumo` | Retorna os indicadores do painel. |
| GET | `/admin` | Lista todas as publicações no painel administrativo. |
| GET | `/admin/:id` | Consulta uma publicação no painel administrativo. |
| GET | `/:id` | Consulta uma publicação pública. |
| POST | `/` | Cria uma publicação. |
| PUT | `/:id` | Atualiza uma publicação. |
| DELETE | `/:id` | Exclui uma publicação. |

As operações administrativas exigem autenticação e permissão para gerenciar conteúdo. As consultas públicas retornam somente publicações com status `publicado`.

As publicações podem ser classificadas como `noticia`, `evento`, `campanha` ou `publicacao`. Os status disponíveis são `rascunho`, `publicado`, `agendado` e `arquivado`.

### Uploads — `/api/upload`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/perfil` | Envia uma foto de perfil. |
| POST | `/publicacao` | Envia uma imagem de publicação. |
| POST | `/animal` | Envia uma imagem de animal. |
| GET | `/foto-privada` | Gera uma URL assinada para acessar uma imagem. |

Os arquivos são armazenados no Supabase Storage. Os uploads administrativos exigem autenticação e as permissões correspondentes.

A rota `/foto-privada` gera uma URL assinada com validade de 60 segundos e verifica as permissões de acesso.

## Autenticação e permissões

A API utiliza JWT para autenticação. As requisições protegidas devem enviar o token no cabeçalho:

```http
Authorization: Bearer <token>
```

As senhas são armazenadas em formato de hash, gerado pelo bcryptjs. Contas pendentes ou inativas não podem realizar login.

As permissões são associadas ao cargo do administrador:

- `pode_gerenciar_animais`
- `pode_gerenciar_conteudo`
- `pode_gerenciar_newsletter`
- `pode_gerenciar_admins`

Nas rotas protegidas, são verificadas a autenticação, a situação da conta e as permissões necessárias para cada operação.

## Integrações externas

### MySQL — Aiven

Armazena os dados de administradores, cargos, animais, publicações e histórico de solicitações. A conexão utiliza SSL.

### Supabase Storage

Armazena imagens nos seguintes buckets:

- `container-perfis`
- `container-posts`
- `container-animais`

A integração utiliza as variáveis `SUPABASE_URL` e `SUPABASE_KEY`.

### Resend

Utilizado no envio dos e-mails de recuperação de senha. A integração é configurada pelas variáveis `RESEND_API_KEY` e `EMAIL_FROM`.

### Newsletter

Os modelos `Animal` e `Publicacao` possuem o campo `disparar_newsletter`, que indica se o registro deve ser incluído em um envio de newsletter.

Atualmente, o campo funciona como uma indicação no cadastro. O envio de e-mails da newsletter ainda não está integrado a um serviço externo.

## Variáveis de ambiente

Configure o arquivo `backend/.env` utilizando o `backend/.env.example` como referência.

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=
DB_HOST=
DB_PORT=

SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_BUCKET_posts=container-posts
SUPABASE_BUCKET_ANIMALS=container-animais
SUPABASE_BUCKET_perfil=container-perfis

JWT_SECRET=

RESEND_API_KEY=
EMAIL_FROM=
```

Preencha as variáveis com os dados dos serviços utilizados. Não versione o arquivo `.env` nem compartilhe suas credenciais.

## Pré-requisitos

- Node.js 24.22.1
- npm 11 ou superior
- MySQL
- Projeto Supabase configurado para armazenamento de imagens
- Conta no Resend para envio de e-mails de recuperação de senha

## Execução local

Na raiz do repositório:

```bash
npm install
npm run dev:backend
```

Ou dentro do diretório `backend/`:

```bash
npm install
npm run dev
```

O servidor fica disponível em `http://localhost:3000`, salvo configuração diferente na variável `PORT`.

Para verificar a API, acesse:

- `GET /api/publicacoes/`
- `GET /api/animais/publicos`

## Comandos

No diretório `backend/`:

```bash
npm run dev
npm run build
npm start
```

- `npm run dev`: inicia o servidor em modo de desenvolvimento.
- `npm run build`: compila o TypeScript.
- `npm start`: executa a versão compilada.

Na raiz do repositório, também estão disponíveis:

```bash
npm run dev:backend
npm run build:backend
```

## Observações

- O backend não possui testes automatizados configurados.
- As listagens ainda não possuem paginação nem filtros de busca implementados.