# Frontend

Interface pública e área administrativa do Focinho Amigo, desenvolvidas com React, Vite e TypeScript. O projeto reúne as páginas institucionais, a área de adoção e o painel administrativo, onde são gerenciados animais, publicações e administradores.

O frontend se comunica com a API REST do backend para consultar e atualizar informações, autenticar usuários e enviar imagens.

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

- **React 19:** desenvolvimento das páginas e dos componentes da interface.
- **Vite:** servidor de desenvolvimento e ferramenta de build.
- **TypeScript:** tipagem dos dados e componentes.
- **Tailwind CSS 4:** estilização da interface.
- **React Router DOM:** gerenciamento das rotas.
- **React Icons:** biblioteca de ícones.
- **Supabase:** armazenamento de imagens, integrado por meio do backend.

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

- `components/`: componentes reutilizados em diferentes páginas, como menus, rodapé, cards e modais.
- `pages/public/`: páginas institucionais, área de adoção, campanhas e notícias.
- `pages/admin/`: páginas de login, cadastro, dashboard, gerenciamento de animais e publicações, além das configurações.
- `services/`: comunicação com o backend.
- `hooks/`: hooks utilizados no carregamento de animais e fotos de perfil.
- `data/`: dados de referência utilizados pela interface.
- `types/`: definições de tipos do TypeScript.
- `assets/`: imagens, logotipos e outros arquivos visuais.

## Rotas

As rotas são configuradas em `src/App.tsx` com React Router DOM.

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
| `/campanhas-e-noticias` | Lista de campanhas e notícias. |
| `/campanhas-e-noticias/:id` | Detalhes de uma publicação. |

### Área administrativa

| Rota | Descrição |
|---|---|
| `/admin/login` | Login de administrador. |
| `/admin/cadastro` | Cadastro de administrador. |
| `/admin/recuperar-senha` | Solicitação de recuperação de senha. |
| `/admin/resetar-senha` | Redefinição de senha com token. |

O painel também conta com páginas de dashboard, gerenciamento de animais e publicações, configurações e administração de usuários.

As páginas protegidas exigem autenticação. As permissões associadas ao cargo do administrador determinam quais operações podem ser realizadas.

## Comunicação com o backend

As chamadas à API ficam organizadas nos serviços de `src/services/`:

- `authApi.ts`: login, cadastro, sessão, permissões, recuperação de senha (`solicitarRecuperacao` e `redefinirSenha`) e importação CSV (`importarCSV`).
- `animaisApi.ts`: consulta e gerenciamento de animais.
- `publicacoesApi.ts`: consulta, criação, atualização e exclusão de publicações, além dos dados do dashboard.
- `adminApi.ts`: gerenciamento de perfil, senha, histórico e solicitações de cadastro.

O endereço da API é definido pela variável `VITE_API_URL`. Nas requisições protegidas, o token JWT é enviado no cabeçalho `Authorization`.

O frontend envia as imagens ao backend, que realiza o armazenamento no Supabase Storage.

## Recuperação de senha

O processo de recuperação de senha acontece em duas etapas:

1. Na página `/admin/recuperar-senha`, o administrador informa seu e-mail. O frontend envia a solicitação ao backend pelo método `authApi.solicitarRecuperacao`.
2. Pelo link recebido por e-mail, o administrador acessa `/admin/resetar-senha` e informa a nova senha. O token presente na URL é enviado ao backend pelo método `authApi.redefinirSenha`.

A validação do token, a atualização da senha e o envio do e-mail são realizados pelo backend.

## Variáveis de ambiente

Crie o arquivo `frontend/.env` com base no `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Se o backend estiver rodando em outro endereço ou porta, atualize o valor de `VITE_API_URL`.

## Estrutura das Integrações da Newsletter

A integração com o backend para a inscrição na newsletter ocorre por meio da função auxiliar `inscreverNewsletter`:

```typescript
export async function inscreverNewsletter(nome: string, email: string) {
  const resposta = await fetch('http://localhost:3000/api/newsletter/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nome, email }),
  });

  if (!resposta.ok) {
    const erroData = await resposta.json();
    throw new Error(erroData.erro || 'Falha ao cadastrar na newsletter.');
  }

  return await resposta.json();
}
```

### Componentes de Interface Envolvidos

1. **Pop-up de Captura de E-mail (Home):**
   - Apresenta os campos `Nome` e `E-mail`.
   - Utiliza a função `inscreverNewsletter` para disparar a requisição ao servidor.
2. **Link de Descadastro (Unsubscribe):**
   - Cada e-mail recebido pelo usuário contém um link direcionando para o endpoint do backend `/api/newsletter/unsubscribe?email=...`, exibindo a tela visual de confirmação do cancelamento.

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
- `npm run lint`: verifica o código com o linter.
- `npm run preview`: permite visualizar localmente a versão gerada pela build.

Na raiz do repositório, também estão disponíveis:

```bash
npm run dev:frontend
npm run build:frontend
npm run lint:frontend
npm run build
```

## Observações

- O frontend ainda não possui testes automatizados configurados.
