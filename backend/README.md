# Backend

API REST do Focinho Amigo, desenvolvida com Node.js, Express 5, TypeScript e Sequelize. Utiliza MySQL para persistência de dados e Supabase para armazenamento de imagens.

## Tecnologias

- Node.js 24.22.1
- Express 5
- TypeScript 5.6
- Sequelize 6
- MySQL
- JWT para autenticação
- bcryptjs para hash de senhas
- Multer para upload de imagens
- CORS para controle de origem
- dotenv para variáveis de ambiente
- Supabase Storage para arquivos

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

## Estrutura

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
    ├── types/
    └── seed/
```

- `server.ts`: configura o servidor, registra as rotas e conecta ao banco.
- `models/`: define os modelos e as associações do banco.
- `config/`: configura o MySQL e o Supabase.
- `controllers/`: implementa a lógica das requisições.
- `routes/`: define os endpoints da API.
- `middlewares/`: contém autenticação, permissões, upload e tratamento de erros.
- `types/`: define os tipos utilizados pela aplicação.
- `seed/`: contém os cargos iniciais do sistema.

## Banco de dados

O banco utiliza MySQL com Sequelize e conexão SSL.

Principais modelos:

- `Cargo`: nome do cargo e permissões para gerenciar animais, conteúdo, newsletter e administradores.
- `Administrador`: nome, e-mail, senha, cargo e status da conta.
- `Animal`: dados dos animais disponíveis para adoção.
- `Publicacao`: notícias, eventos, campanhas e publicações.
- `ImagemPerfil`: referências às fotos de perfil armazenadas no Supabase.
- `HistoricoSolicitacaoAdmin`: histórico de aprovação e rejeição de cadastros.

Os modelos utilizam `underscored: true`, mantendo os nomes das colunas no formato `snake_case`.

O servidor executa `sequelize.sync()` na inicialização. A função `adicionarCamposComplementares()` verifica e adiciona algumas colunas do modelo `Animal` quando necessário.

## Endpoints

### Autenticação — `/api/auth`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/cadastro` | Cadastra um administrador |
| POST | `/login` | Autentica um administrador |
| GET | `/me` | Retorna os dados do usuário autenticado |

O cadastro aceita `multipart/form-data`, com nome, sobrenome, e-mail, cargo, senha e foto opcional. Novas contas são criadas com status pendente.

O login valida a senha e o status da conta. Quando autorizado, retorna um JWT com validade de duas horas.

### Administradores — `/api/admin`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/me` | Consulta o perfil |
| PUT | `/me` | Atualiza nome e e-mail |
| PUT | `/senha` | Altera a senha |
| GET | `/pendentes` | Lista cadastros pendentes |
| PATCH | `/:id/aprovar` | Aprova um cadastro |
| PATCH | `/:id/rejeitar` | Rejeita um cadastro |
| GET | `/historico-solicitacoes` | Lista as últimas solicitações |

Todas as rotas exigem autenticação. A consulta de pendências, as decisões sobre cadastros e o histórico exigem permissão para gerenciar administradores.

### Animais — `/api/animais`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/publicos` | Lista animais disponíveis |
| GET | `/` | Lista os animais |
| GET | `/:id` | Consulta um animal |
| POST | `/` | Cadastra um animal |
| PUT | `/:id` | Atualiza um animal |
| DELETE | `/:id` | Exclui um animal |

A rota `/publicos` não exige autenticação e retorna apenas os dados destinados à consulta pública. As demais operações administrativas exigem autenticação e as permissões correspondentes.

Os campos são validados conforme seus tipos e limites definidos nas rotas.

### Publicações — `/api/publicacoes`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Lista publicações publicadas |
| GET | `/dashboard/resumo` | Retorna os indicadores do painel |
| GET | `/admin` | Lista todas as publicações |
| GET | `/admin/:id` | Consulta uma publicação no painel |
| GET | `/:id` | Consulta uma publicação pública |
| POST | `/` | Cria uma publicação |
| PUT | `/:id` | Atualiza uma publicação |
| DELETE | `/:id` | Exclui uma publicação |

As operações administrativas exigem autenticação e permissão para gerenciar conteúdo. As consultas públicas retornam somente publicações com status `publicado`.

As publicações podem ser classificadas como `noticia`, `evento`, `campanha` ou `publicacao`. Os status disponíveis são `rascunho`, `publicado`, `agendado` e `arquivado`.

### Uploads — `/api/upload`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/perfil` | Envia uma foto de perfil |
| POST | `/publicacao` | Envia uma imagem de publicação |
| POST | `/animal` | Envia uma imagem de animal |
| GET | `/foto-privada` | Gera uma URL assinada para acessar uma imagem |

Os arquivos são enviados ao Supabase Storage. Os uploads administrativos exigem autenticação e as permissões correspondentes.

A rota `/foto-privada` retorna uma URL assinada válida por 60 segundos e verifica as permissões de acesso.

## Autenticação e permissões

A API utiliza JWT para autenticação. As requisições protegidas devem enviar o token no cabeçalho:

```http
Authorization: Bearer <token>
```

As senhas são armazenadas com hash gerado pelo bcryptjs. Contas pendentes ou inativas não podem realizar login.

As permissões são associadas ao cargo do administrador:

- `pode_gerenciar_animais`
- `pode_gerenciar_conteudo`
- `pode_gerenciar_newsletter`
- `pode_gerenciar_admins`

As rotas protegidas verificam a autenticação, o status da conta e as permissões necessárias para cada operação.

## Integrações externas

### MySQL — Aiven

Armazena os dados de administradores, cargos, animais, publicações e histórico de solicitações. A conexão utiliza SSL.

### Supabase Storage

Armazena imagens nos buckets `container-perfis`, `container-posts` e `container-animais`.

A integração utiliza `SUPABASE_URL` e `SUPABASE_KEY`, configuradas por variáveis de ambiente.

### Newsletter

Os modelos `Animal` e `Publicacao` possuem o campo `disparar_newsletter`, utilizado para indicar se um registro deve ser incluído no envio de uma newsletter.

O envio de e-mails ainda não está integrado a um serviço externo. O campo não realiza disparos por conta própria.

## Variáveis de ambiente

Configure o arquivo `backend/.env` com base no `backend/.env.example`.

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
```

Preencha as variáveis com os dados dos serviços utilizados. Não versione o arquivo `.env` nem exponha credenciais no repositório.

## Pré-requisitos

- Node.js 24.22.1
- npm 11 ou superior
- MySQL
- Projeto Supabase para armazenamento de imagens

## Execução local

Na raiz do repositório:

```bash
npm install
npm run dev:backend
```

Ou dentro de `backend/`:

```bash
npm install
npm run dev
```

O servidor fica disponível em `http://localhost:3000`, salvo configuração diferente na variável `PORT`.

Para verificar a API, acesse `GET /api/publicacoes/` ou `GET /api/animais/publicos`.

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

Na raiz do repositório, também estão disponíveis `npm run dev:backend` e `npm run build:backend`.

## Observações

- O banco é sincronizado durante a inicialização por meio de `sequelize.sync()`.
- A API não possui rota raiz em `/` ou `/api/`.
- A recuperação de senha ainda não possui endpoint no backend.
- Não há scripts de testes automatizados configurados no backend.
- As listagens não possuem paginação ou filtros de busca implementados.
