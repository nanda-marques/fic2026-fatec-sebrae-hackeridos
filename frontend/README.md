# Frontend

Interface pública e área administrativa do Focinho Amigo, desenvolvidas com React, Vite e TypeScript. A aplicação reúne as páginas institucionais, a área de adoção e o painel administrativo, utilizado para gerenciar animais, publicações e administradores.

O frontend consome a API REST do backend para consultar e atualizar dados, realizar autenticação e enviar imagens.

## Tecnologias utilizadas

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="55" alt="React" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="55" alt="Vite" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="55" alt="TypeScript" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="55" alt="Tailwind CSS" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" width="55" alt="React Router" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="65" alt="npm" />
</p>

<p align="center">
  React • Vite • TypeScript • Tailwind CSS • React Router • React Icons • Supabase
</p>

- **React 19:** construção das páginas e componentes da interface.
- **Vite:** servidor de desenvolvimento e ferramenta de build.
- **TypeScript:** tipagem e organização do código.
- **Tailwind CSS 4:** estilização das páginas e componentes.
- **React Router DOM:** gerenciamento das rotas.
- **React Icons:** biblioteca de ícones.
- **Supabase:** armazenamento de imagens, acessado por meio do backend.

## Estrutura do projeto

```text
frontend/
├── index.html
├── vite.config.js
├── tsconfig.json
├── package.json
├── .env.example
└── src/
    ├── main.jsx
    ├── App.tsx
    ├── index.css
    ├── assets/
    ├── data/
    ├── types/
    ├── services/
    ├── hooks/
    ├── components/
    │   ├── layout/
    │   ├── adoption/
    │   └── newsletter/
    └── pages/
        ├── public/
        └── admin/
            ├── Login/
            ├── Register/
            ├── RecuperarSenha/
            └── Settings/
```

### Principais diretórios

- `components/`: componentes reutilizáveis, como menus, rodapé, cards e modais.
- `pages/public/`: páginas institucionais, adoção, campanhas e notícias.
- `pages/admin/`: páginas de login, cadastro, dashboard, animais, publicações e configurações.
- `services/`: serviços responsáveis pela comunicação com o backend.
- `hooks/`: hooks utilizados no carregamento de animais e fotos de perfil.
- `data/`: dados de referência utilizados pela interface.
- `types/`: definições de tipos do TypeScript.
- `assets/`: imagens, logotipos e outros recursos visuais.

## Rotas

As rotas da aplicação são definidas em `src/App.tsx`, utilizando React Router DOM.

### Páginas públicas

| Rota | Descrição |
|---|---|
| `/` | Página inicial. |
| `/sobre-nos` | Apresentação da organização. |
| `/adocao` | Animais disponíveis para adoção. |
| `/apadrinhamento` | Informações sobre apadrinhamento. |
| `/voluntariado` | Informações sobre voluntariado. |
| `/como-ajudar` | Formas de apoiar a organização. |
| `/contato` | Página de contato. |
| `/campanhas-e-noticias` | Lista campanhas e notícias. |
| `/campanhas-e-noticias/:id` | Exibe os detalhes de uma publicação. |

### Área administrativa

| Rota | Descrição |
|---|---|
| `/admin/login` | Login de administrador. |
| `/admin/cadastro` | Cadastro de administrador. |
| `/admin/recuperar-senha` | Solicitação de recuperação de senha. |
| `/admin/resetar-senha` | Redefinição de senha por meio de um token. |

O painel também possui páginas de dashboard, gerenciamento de animais e publicações, configurações e administração de usuários.

As páginas administrativas protegidas exigem autenticação. O acesso às operações é definido pelas permissões associadas ao cargo do administrador.

## Comunicação com o backend

As requisições são organizadas em serviços localizados em `src/services/`.

- `authApi.ts`: autenticação, cadastro, sessão, permissões e recuperação de senha, por meio dos métodos `solicitarRecuperacao` e `redefinirSenha`.
- `animaisApi.ts`: consulta e gerenciamento de animais.
- `publicacoesApi.ts`: consulta, criação, atualização e exclusão de publicações, além dos dados do dashboard.
- `adminApi.ts`: gerenciamento de perfil, senha, histórico e solicitações de cadastro.

A URL da API é definida pela variável de ambiente `VITE_API_URL`. Nas requisições que exigem autenticação, o token JWT é enviado no cabeçalho `Authorization`.

O envio de imagens é feito pelo frontend para o backend, que realiza o armazenamento no Supabase Storage.

## Recuperação de senha

A recuperação de senha possui duas etapas:

1. Na página `/admin/recuperar-senha`, o administrador informa seu e-mail. O frontend envia a solicitação ao backend pelo método `authApi.solicitarRecuperacao`.
2. No link recebido por e-mail, o administrador acessa `/admin/resetar-senha` e informa a nova senha. O token recebido na URL é enviado ao backend pelo método `authApi.redefinirSenha`.

A validação do token, a atualização da senha e o envio do e-mail são realizados pelo backend.

## Variáveis de ambiente

Crie o arquivo `frontend/.env` com base no `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Caso o backend esteja sendo executado em outro endereço ou porta, atualize o valor de `VITE_API_URL`.

## Pré-requisitos

- Node.js 24.22.1, conforme definido no `.nvmrc` da raiz do repositório.
- npm 11 ou superior.
- Git.

## Como executar

Na raiz do repositório:

```bash
npm install
npm run dev:frontend
```

Ou diretamente no diretório `frontend/`:

```bash
npm install
npm run dev
```

Por padrão, o Vite disponibiliza a aplicação em:

`http://localhost:5173`

Para utilizar as funcionalidades que dependem da API, mantenha o backend em execução e configure corretamente a variável `VITE_API_URL`.

## Comandos disponíveis

Dentro do diretório `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run lint`: executa a verificação estática do código.
- `npm run preview`: disponibiliza localmente a versão gerada pela build.

Na raiz do repositório, também estão disponíveis:

```bash
npm run dev:frontend
npm run build:frontend
npm run lint:frontend
npm run build
```

## Observações

- O frontend ainda não possui testes automatizados configurados.