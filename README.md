# Focinho Amigo

Site institucional, informativo e dinâmico desenvolvido para a OSCIP de Proteção Animal Focinho Amigo.
Aplicação web organizada em frontend React/Vite e backend Node.js/Express com TypeScript.

## Sobre o projeto

O projeto tem como objetivo ampliar a visibilidade da Focinho Amigo, facilitar o acesso às informações da organização e aproximar pessoas interessadas em adoção, apadrinhamento, voluntariado e outras formas de apoio.

O sistema também contará com uma área administrativa para atualização dos animais disponíveis, publicações e acompanhamento dos cadastros realizados pelo site.

## Tecnologias

Node.js {24.22.1} + Express, React + Vite (TypeScript), MySQL {versão} + Sequelize

## Estrutura

- `frontend/`: interface pública e área administrativa em React.
- `backend/`: API REST, autenticação, banco MySQL e integrações com Supabase.
- `docs/`: documentação original, requisitos, arquitetura e apresentação.

## Pré-requisitos

- Node.js 24.22.1 (recomendado)
- Git
- npm 

A versão configurada neste repositório é `24.22.1`; o arquivo `.nvmrc` pode ser utilizado pelo gerenciador de versões.

## Como executar

## Clonar o repositório

Clone o repositório para sua máquina:
````
git clone https://github.com/nanda-marques/fic2026-fatec-sebrae-hackeridos.git
````

Acesse a pasta do projeto:
````
cd fic2026-fatec-sebrae-hackeridos
````

## Instalação

```bash
nvm use
npm install
```

No Windows sem `nvm`, instale o Node.js 24.22.1 antes de continuar.

## Configuração

1. Copie `backend/.env.example` para `backend/.env` e informe as credenciais do banco, Supabase e JWT.
2. Copie `frontend/.env.example` para `frontend/.env` e ajuste `VITE_API_URL` quando necessário.

## Execução

Em dois terminais:

```bash
npm run dev:backend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Também é possível executar cada módulo diretamente com `npm run dev` dentro das respectivas pastas.

## Build

```bash
npm run build
npm run lint:frontend
```

## Perfis e usuários de teste (ambiente local)

| Perfil | E-mail | Senha | O que acessa |
|---|---|---|---|
| Administrador Focinho Amigo | focinhoamigoadmin@gmail.com | Focinho@19 | Acesso a todas as funções administrativas (gerenciar publicações, animais e usuários) |


## Observações de segurança

Nunca envie arquivos `.env` ou credenciais reais para o repositório. Use apenas as chaves necessárias em ambiente local ou de implantação.

## Equipe

| Integrante | GitHub                                   |
| ---------- | ---------------------------------------- |
| Fernanda   | [nanda-marques](https://github.com/nanda-marques) |
| Manuella   | [Manuellasantos](http://github.com/Manuellasantos) |
| Matheus    | [MatheusBonfim265](https://github.com/MatheusBonfim265) |
| Mayra      | [Cosmic-Bubble](https://github.com/Cosmic-Bubble) |