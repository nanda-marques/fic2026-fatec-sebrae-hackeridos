# Backend

API do Focinho Amigo, desenvolvida com Node.js, Express 5, TypeScript e Sequelize. Utiliza MySQL para armazenar os dados e Supabase Storage para guardar as imagens, além do Resend para envio de e-mails transacionais e newsletters.

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
- dotenv para variáveis de ambiente
- Supabase Storage para armazenamento de arquivos
- Resend para envio de e-mails transacionais (recuperação de senha e inscrições/disparos de newsletter)

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

- `server.ts`: inicia o servidor, registra as rotas e conecta ao banco de dados.
- `models/`: contém os modelos e as associações do banco.
- `config/`: configura as conexões com MySQL e Supabase.
- `controllers/`: recebe as requisições e retorna as respostas da API.
- `routes/`: define os endpoints da aplicação.
- `middlewares/`: contém autenticação, permissões, upload e tratamento de erros.
- `services/`: implementa as regras de negócio e as integrações externas.
- `types/`: contém as definições de tipos utilizadas no projeto.
- `seed/`: contém os dados iniciais dos cargos do sistema.

## Banco de dados

O projeto utiliza MySQL com Sequelize e conexão SSL.

Os principais modelos são:

- `Cargo`: define os cargos dos administradores e suas permissões.
- `Administrador`: armazena os dados de acesso, cargo e situação da conta.
- `Animal`: contém as informações dos animais cadastrados para adoção.
- `Publicacao`: armazena notícias, eventos, campanhas e outros conteúdos.
- `ImagemPerfil`: guarda as referências às fotos de perfil armazenadas no Supabase.
- `HistoricoSolicitacaoAdmin`: registra as aprovações e rejeições de cadastros.
- `TokenRecuperacao`: armazena os hashes dos tokens de recuperação de senha, junto com a validade e a situação de uso.

Os modelos utilizam `underscored: true`, que mantém os nomes das colunas no padrão `snake_case`.

Na inicialização, o servidor executa `sequelize.sync()`. A função `adicionarCamposComplementares()` verifica se algumas colunas do modelo `Animal` precisam ser adicionadas.

## Regras de Negócio e Serviço da Newsletter

O `newsletterService` e o helper `verificarEDispararNewsletter()` gerenciam o fluxo automático da newsletter:

1. **Fila de Conteúdo:** Cada novo animal ou publicação relevante pode ser adicionado à tabela `ConteudoNewsletter` com status `pendente`.
2. **Gatilho de Disparo Automático (`verificarEDispararNewsletter`):** O sistema verifica a quantidade de itens pendentes na fila. Assim que atinge **4 ou mais itens**, o disparo é ativado.
3. **Layout em Grade:** Os itens são organizados em pares (linhas de 2 colunas) e o HTML individualizado é montado dinamicamente via `gerarHtmlNewsletter`.
4. **Envio via Resend API:** O e-mail é disparado para todos os inscritos com status `ativo = true`.
5. **Atualização de Status:** Após o envio, os registros em `ConteudoNewsletter` passam para o status `enviado` com a data/hora registrada.
6. **Descadastro (`descadastrarInscrito`):** Altera a flag `ativo` do usuário para `false`.

## Endpoints

### Newsletter  — `/api/newsletter`
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/subscribe` | Cadastra ou reativa a inscrição de um e-mail na newsletter da ONG. |
| GET | `/unsubscribe` | Cancela a inscrição de um e-mail via parâmetro de query (?email=...) e retorna confirmação visual em HTML. |

### Recuperação de senha — `/api/recuperacao`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/solicitar` | Solicita a recuperação de senha e envia o link por e-mail. |
| POST | `/redefinir` | Altera a senha usando um token válido. |

O endpoint `/solicitar` recebe o e-mail do administrador. Quando o endereço está cadastrado, a API gera um token aleatório com `crypto.randomBytes`, armazena seu hash com `bcryptjs` e envia o link pelo Resend.

O token é válido por uma hora e só pode ser usado uma vez. A resposta não informa se o e-mail está cadastrado.

Em `/redefinir`, o administrador envia o token e a nova senha. Depois da validação, a senha é atualizada e o token é marcado como utilizado.

### Autenticação — `/api/auth`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/cadastro` | Cadastra um administrador. |
| POST | `/login` | Autentica um administrador. |
| GET | `/me` | Retorna os dados do usuário autenticado. |

O cadastro recebe os dados em `multipart/form-data`: nome, sobrenome, e-mail, cargo, senha e, opcionalmente, uma foto. As novas contas ficam com status pendente até serem aprovadas.

No login, a API verifica a senha e a situação da conta. Administradores autorizados recebem um JWT com validade de duas horas.

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

Todas as rotas exigem autenticação. Para consultar pendências, aprovar ou rejeitar cadastros e acessar o histórico, o administrador também precisa ter permissão para gerenciar administradores.

### Animais — `/api/animais`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/publicos` | Lista os animais disponíveis para consulta pública. |
| GET | `/` | Lista os animais. |
| GET | `/:id` | Consulta um animal pelo ID. |
| POST | `/` | Cadastra um animal. |
| PUT | `/:id` | Atualiza os dados de um animal. |
| DELETE | `/:id` | Exclui um animal. |
| POST | `/importar-csv` | Importa animais por arquivo CSV. |

A rota `/publicos` não exige login e retorna apenas os dados destinados à consulta pública. As demais operações exigem autenticação e as permissões correspondentes.

Os dados enviados são validados de acordo com os tipos e limites definidos na aplicação.

A importação por CSV aceita arquivos com cabeçalhos correspondentes aos campos reconhecidos pelo serviço. Os campos obrigatórios são `nome`, `especie`, `status` e `porte`. Cada registro é processado individualmente: os válidos são cadastrados e os que apresentam problemas retornam o número da linha e o motivo do erro.

As imagens não são importadas pelo CSV. Elas podem ser adicionadas posteriormente pelo painel administrativo.

### Importação CSV

O arquivo deve utilizar os nomes de campos aceitos pelo importador. Os cabeçalhos abaixo podem ser usados:

`nome`, `especie`, `raca`, `idade`, `porte`, `peso`, `castracao`, `temperamento`, `sobre`, `status`.

Valores utilizados no cadastro:

- `especie`: `Canino` ou `Felino`
- `porte`: `Pequeno`, `Médio` ou `Grande`
- `status`: `Disponível`, `Adotado` ou `Em Processo`
- `castracao`: `Não informado`, `Castrado(a)`, `Pendente` ou `Agendada`
- `idade`: número inteiro (ex.: `2`)
- `peso`: número com ponto decimal (ex.: `12.5`), sem a unidade `kg`

Exemplo de arquivo:

```csv
nome,especie,raca,idade,porte,peso,castracao,temperamento,sobre,status
Luna,Canino,Caramelo,2,Médio,12.5,Não informado,Brincalhona,Dócil e sociável,Disponível
```

**Cuidados ao montar o arquivo:**

- Salvar em UTF-8 sem BOM.
- Utilizar vírgulas como separadores.
- Não incluir a coluna `cor`, pois ela não é reconhecida pelo importador.
- Os campos opcionais podem ficar vazios.
- Os campos `nome`, `especie`, `status` e `porte` precisam estar preenchidos.

### Publicações — `/api/publicacoes`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Lista as publicações publicadas. |
| GET | `/dashboard/resumo` | Retorna os indicadores do painel. |
| GET | `/admin` | Lista as publicações no painel administrativo. |
| GET | `/admin/:id` | Consulta uma publicação no painel administrativo. |
| GET | `/:id` | Consulta uma publicação pública. |
| POST | `/` | Cria uma publicação. |
| PUT | `/:id` | Atualiza uma publicação. |
| DELETE | `/:id` | Exclui uma publicação. |

As operações administrativas exigem autenticação e permissão para gerenciar conteúdo. Nas consultas públicas, são retornadas apenas publicações com status `publicado`.

As publicações podem ter as categorias `noticia`, `evento`, `campanha` ou `publicacao`. Os status disponíveis são `rascunho`, `publicado`, `agendado` e `arquivado`.

### Uploads — `/api/upload`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/perfil` | Envia uma foto de perfil. |
| POST | `/publicacao` | Envia uma imagem de publicação. |
| POST | `/animal` | Envia uma imagem de animal. |
| GET | `/foto-privada` | Gera uma URL assinada para acessar uma imagem. |

As imagens são armazenadas no Supabase Storage. Os uploads feitos pelo painel administrativo exigem autenticação e as permissões correspondentes.

A rota `/foto-privada` gera uma URL assinada com validade de 60 segundos e verifica se o usuário tem permissão para acessar o arquivo.

## Autenticação e permissões

A API utiliza JWT para autenticar os usuários. Nas rotas protegidas, o token deve ser enviado no cabeçalho:

```http
Authorization: Bearer <token>
```

As senhas são armazenadas como hashes gerados pelo bcryptjs. Contas pendentes ou inativas não conseguem fazer login.

As permissões são definidas pelo cargo do administrador:

- `pode_gerenciar_animais`
- `pode_gerenciar_conteudo`
- `pode_gerenciar_newsletter`
- `pode_gerenciar_admins`

Cada rota protegida verifica a autenticação, a situação da conta e a permissão necessária para a operação.

## Integrações externas

### MySQL — Aiven

Armazena os dados de administradores, cargos, animais, publicações e histórico de solicitações. A conexão com o banco utiliza SSL.

### Supabase Storage

As imagens são armazenadas nos seguintes buckets:

- `container-perfis`
- `container-posts`
- `container-animais`

A conexão utiliza as variáveis `SUPABASE_URL` e `SUPABASE_KEY`.

### Resend

Utilizado para enviar os e-mails de recuperação de senha. A configuração é feita pelas variáveis `RESEND_API_KEY` e `EMAIL_FROM`.

### Newsletter

Os modelos `Animal` e `Publicacao` possuem o campo `disparar_newsletter`, que indica se o registro deve ser incluído em um envio de newsletter.

Por enquanto, esse campo é utilizado como uma indicação no cadastro. O envio dos e-mails da newsletter ainda não está integrado a um serviço externo.

## Variáveis de ambiente

Crie o arquivo `backend/.env` com base no `backend/.env.example`.

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

Preencha as variáveis com os dados dos serviços configurados. O arquivo `.env` não deve ser enviado ao repositório nem compartilhado, pois contém credenciais de acesso.

## Pré-requisitos

- Node.js 24.22.1
- npm 11 ou superior
- MySQL
- Projeto Supabase configurado para armazenar imagens
- Conta no Resend para envio de e-mails de recuperação de senha

## Execução local

Na raiz do repositório:

```bash
npm install
npm run dev:backend
```

Ou, dentro do diretório `backend/`:

```bash
npm install
npm run dev
```

Por padrão, o servidor fica disponível em `http://localhost:3000`. A porta pode ser alterada pela variável `PORT`.

Para testar a API, é possível acessar:

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
- `npm start`: inicia a versão compilada.

Na raiz do repositório, também podem ser utilizados:

```bash
npm run dev:backend
npm run build:backend
```

## Observações

- O backend ainda não possui testes automatizados configurados.
- As listagens ainda não contam com paginação ou filtros de busca.
