# Frontend

Interface pública e área administrativa da Focinho Amigo, desenvolvida com React, Vite e TypeScript. O frontend reúne as páginas institucionais, a área de adoção e o painel administrativo de animais, publicações e administradores.

A aplicação consome a API REST do backend, responsável pelo acesso aos dados e pelo armazenamento de imagens.

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

- **React 19:** construção das interfaces e componentes.
- **Vite:** servidor de desenvolvimento e geração da build.
- **TypeScript:** tipagem e organização do código.
- **Tailwind CSS 4:** estilização das páginas.
- **React Router DOM:** gerenciamento de rotas públicas e administrativas.
- **React Icons:** ícones da interface.
- **Supabase:** armazenamento de imagens acessado por meio do backend.

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
```

### Principais diretórios

- `components/`: componentes reutilizáveis, menus, rodapé, cards e modais.
- `pages/public/`: páginas institucionais, adoção, campanhas e notícias.
- `pages/admin/`: login, cadastro, dashboard, animais, publicações e configurações.
- `services/`: comunicação com a API do backend.
- `hooks/`: hooks para carregamento de animais e fotos de perfil.
- `data/`: dados de referência utilizados pela interface.
- `types/`: definições de tipos do TypeScript.
- `assets/`: imagens, logotipos e demais recursos visuais.

## Rotas

As rotas são definidas em `src/App.tsx` com React Router DOM.

**Páginas públicas**
- `/` — página inicial.
- `/sobre-nos` — apresentação da organização.
- `/adocao` — animais disponíveis para adoção.
- `/apadrinhamento` — apadrinhamento.
- `/voluntariado` — voluntariado.
- `/como-ajudar` — formas de ajudar.
- `/contato` — contato.
- `/campanhas-e-noticias` — listagem de campanhas e notícias.
- `/campanhas-e-noticias/:id` — detalhes de uma publicação.

**Área administrativa**
- `/admin/login` — login.
- `/admin/cadastro` — cadastro de administrador.
- `/admin/recuperar-senha` — interface de recuperação de senha.
- Demais páginas administrativas — dashboard, animais, publicações, configurações e gerenciamento de administradores.

As páginas administrativas protegidas exigem autenticação. As permissões de acesso são verificadas conforme o cargo do administrador.

## Comunicação com o backend

As requisições são realizadas por meio dos serviços localizados em `src/services/`.

- `authApi.ts`: autenticação, cadastro, sessão e permissões.
- `animaisApi.ts`: listagem e gerenciamento de animais.
- `publicacoesApi.ts`: publicações, dashboard e operações administrativas.
- `adminApi.ts`: perfil, senha, histórico e solicitações de cadastro.

A URL da API é definida pela variável `VITE_API_URL`. O token de autenticação é enviado no cabeçalho `Authorization` quando necessário.

Os uploads de imagens são encaminhados ao backend, que realiza a integração com o Supabase Storage.

## Variáveis de ambiente

Crie o arquivo `frontend/.env` a partir do `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Altere a URL caso o backend esteja sendo executado em outro endereço ou porta.

## Pré-requisitos

- Node.js 24.22.1, conforme `.nvmrc` na raiz.
- npm 11 ou superior.
- Git.

## Como executar

Na raiz do repositório:

```bash
npm install
npm run dev:frontend
```

Ou diretamente na pasta `frontend/`:

```bash
npm install
npm run dev
```

O Vite disponibiliza a aplicação, por padrão, em `http://localhost:5173`.

Para utilizar as funcionalidades integradas, mantenha o backend em execução e configure corretamente `VITE_API_URL`.

## Comandos disponíveis

Dentro de `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Pela raiz do repositório, também podem ser utilizados os comandos de workspace:

```bash
npm run dev:frontend
npm run build:frontend
npm run lint:frontend
npm run build
```

## Observações

A aplicação utiliza React Strict Mode durante o desenvolvimento.

A recuperação de senha possui interface, mas depende da implementação do endpoint correspondente no backend.

A inscrição na newsletter possui interface, mas a integração com um serviço de envio ainda precisa ser implementada.

O frontend não acessa diretamente o banco de dados; as operações são realizadas pela API.

Testes automatizados ainda não estão configurados no frontend.

Testes automatizados ainda não estão configurados no frontend.
