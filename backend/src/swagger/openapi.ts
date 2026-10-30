export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Focinho Amigo API",
    description:
      "API REST do projeto Focinho Amigo — sistema de adoção de animais, publicações, newsletter e administração de usuários.",
    version: "1.0.0",
    contact: {
      name: "Equipe Hackeridos",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Autenticação", description: "Cadastro e login de administradores" },
    { name: "Administradores", description: "Perfil, senha e gestão de admin" },
    { name: "Recuperação", description: "Recuperação e redefinição de senha" },
    { name: "Animais", description: "Cadastro, atualização, exclusão e listagem" },
    { name: "Importação CSV", description: "Importação de animais por arquivo" },
    { name: "Publicações", description: "Notícias, eventos e campanhas" },
    { name: "Newsletter", description: "Inscrição e cancelamento" },
    { name: "Upload", description: "Envio de imagens" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT obtido no endpoint POST /api/auth/login",
      },
    },
    schemas: {
      AdministradorCadastro: {
        type: "object",
        required: ["nome", "sobrenome", "email", "cargo", "senha"],
        properties: {
          nome: { type: "string", example: "Maria" },
          sobrenome: { type: "string", example: "Silva" },
          email: { type: "string", format: "email", example: "maria@exemplo.com" },
          cargo: { type: "string", example: "Coordenador de Adoções" },
          senha: { type: "string", format: "password", example: "senhaForte123" },
          foto: { type: "string", format: "binary", description: "Arquivo de imagem do perfil (opcional)" },
        },
      },
      AdministradorLogin: {
        type: "object",
        required: ["email", "senha"],
        properties: {
          email: { type: "string", format: "email" },
          senha: { type: "string", format: "password" },
        },
      },
      AnimalInputPartial: {
        type: "object",
        properties: {
          nome: { type: "string" },
          especie: { type: "string" },
          status: { type: "string", nullable: true },
          porte: { type: "string", nullable: true },
          idade: { type: "integer", nullable: true },
          peso: { type: "number", nullable: true },
          raca: { type: "string", nullable: true },
          castracao: { type: "string", nullable: true },
          temperamento: { type: "string", nullable: true },
          sobre: { type: "string", nullable: true },
          sexo: { type: "string", nullable: true },
          vacinacaoEmDia: { type: "boolean", nullable: true },
          imagem: { type: "string", nullable: true },
          situacaoSaude: { type: "string", nullable: true },
          dispararNewsletter: { type: "boolean", nullable: true },
          prioridadeApadrinhamento: { type: "boolean", nullable: true },
        },
      },
      AnimalInput: {
        type: "object",
        required: ["nome", "especie"],
        properties: {
          nome: { type: "string" },
          especie: { type: "string" },
          status: { type: "string", nullable: true },
          porte: { type: "string", nullable: true },
          idade: { type: "integer", nullable: true },
          peso: { type: "number", nullable: true },
          raca: { type: "string", nullable: true },
          castracao: { type: "string", nullable: true },
          temperamento: { type: "string", nullable: true },
          sobre: { type: "string", nullable: true },
          sexo: { type: "string", nullable: true },
          vacinacaoEmDia: { type: "boolean", nullable: true },
          imagem: { type: "string", nullable: true },
          situacaoSaude: { type: "string", nullable: true },
          dispararNewsletter: { type: "boolean", nullable: true },
          prioridadeApadrinhamento: { type: "boolean", nullable: true },
        },
      },
      AtualizarPerfilAdmin: {
        type: "object",
        properties: {
          nomeCompleto: { type: "string", nullable: true },
          email: { type: "string", format: "email", nullable: true },
        },
      },
      AlterarSenhaAdmin: {
        type: "object",
        required: ["senhaAtual", "novaSenha"],
        properties: {
          senhaAtual: { type: "string", format: "password" },
          novaSenha: { type: "string", format: "password", minLength: 8 },
        },
      },
      PublicacaoInputPartial: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          categoria: { type: "string", enum: ["noticia", "evento", "campanha", "publicacao"] },
          status: { type: "string", enum: ["rascunho", "publicado", "agendado", "arquivado"], nullable: true },
          descricaoConteudo: { type: "string" },
          autor: { type: "string", nullable: true },
          resumo: { type: "string", nullable: true },
          destaque: { type: "boolean" },
          urgente: { type: "boolean" },
          imagem: { type: "string", nullable: true },
          dataEventoCampanha: { type: "string", format: "date-time", nullable: true },
          localEventoCampanha: { type: "string", nullable: true },
          urlArrecadacao: { type: "string", format: "uri", nullable: true },
          urlVideo: { type: "string", format: "uri", nullable: true },
          dispararNewsletter: { type: "boolean" },
        },
      },
      PublicacaoInput: {
        type: "object",
        required: [
          "titulo",
          "categoria",
          "descricaoConteudo",
          "dataEventoCampanha",
          "localEventoCampanha",
          "urlArrecadacao",
          "urlVideo",
          "imagem",
          "autor",
          "resumo",
          "destaque",
          "urgente",
          "dispararNewsletter",
        ],
        properties: {
          titulo: { type: "string" },
          categoria: { type: "string", enum: ["noticia", "evento", "campanha", "publicacao"] },
          status: { type: "string", enum: ["rascunho", "publicado", "agendado", "arquivado"], nullable: true },
          descricaoConteudo: { type: "string" },
          autor: { type: "string", nullable: true },
          resumo: { type: "string", nullable: true },
          destaque: { type: "boolean" },
          urgente: { type: "boolean" },
          imagem: { type: "string", nullable: true },
          dataEventoCampanha: { type: "string", format: "date-time", nullable: true },
          localEventoCampanha: { type: "string", nullable: true },
          urlArrecadacao: { type: "string", format: "uri", nullable: true },
          urlVideo: { type: "string", format: "uri", nullable: true },
          dispararNewsletter: { type: "boolean" },
        },
      },
      RecuperacaoSolicitar: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      RecuperacaoRedefinir: {
        type: "object",
        required: ["token", "novaSenha"],
        properties: {
          token: { type: "string" },
          novaSenha: { type: "string", format: "password", minLength: 8 },
        },
      },
      NewsletterSubscribe: {
        type: "object",
        required: ["email"],
        properties: {
          nome: { type: "string", nullable: true },
          email: { type: "string", format: "email" },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Token JWT não fornecido ou inválido",
        content: {
          "application/json": {
            schema: { type: "object", properties: { mensagem: { type: "string" } } },
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/cadastro": {
      post: {
        tags: ["Autenticação"],
        summary: "Cadastrar administrador",
        description: "Cria uma conta com status pendente, aguardando aprovação. O arquivo 'foto' é opcional (multipart/form-data).",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AdministradorCadastro" },
            },
          },
        },
        responses: {
          201: { description: "Cadastro criado com sucesso" },
          400: { description: "Dados obrigatórios faltando ou inválidos" },
          409: { description: "E-mail já cadastrado" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autenticar administrador",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdministradorLogin" },
            },
          },
        },
        responses: {
          200: { description: "Login realizado — retorna token JWT" },
          401: { description: "Credenciais incorretas" },
          403: { description: "Conta pendente, inativa ou rejeitada" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Autenticação"],
        summary: "Perfil do usuário autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dados do usuário autenticado" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
        },
      },
    },
    "/api/admin/me": {
      get: {
        tags: ["Administradores"],
        summary: "Perfil do administrador",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Perfil" }, 401: { description: "Não autenticado" } },
      },
      put: {
        tags: ["Administradores"],
        summary: "Atualizar perfil",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AtualizarPerfilAdmin" },
            },
          },
        },
        responses: { 200: { description: "Atualizado" }, 401: { description: "Não autenticado" }, 404: { description: "Não encontrado" }, 409: { description: "E-mail já cadastrado" } },
      },
    },
    "/api/admin/senha": {
      put: {
        tags: ["Administradores"],
        summary: "Alterar senha",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AlterarSenhaAdmin" },
            },
          },
        },
        responses: { 200: { description: "Senha alterada" }, 400: { description: "Dados inválidos ou senha muito curta" }, 401: { description: "Não autenticado ou senha atual incorreta" }, 404: { description: "Não encontrado" } },
      },
    },
    "/api/admin/pendentes": {
      get: {
        tags: ["Administradores"],
        summary: "Listar cadastros pendentes",
        security: [{ bearerAuth: [] }],
        description: "Requer permissão para gerenciar administradores.",
        responses: { 200: { description: "Lista de pendentes" }, 401: { description: "Não autenticado" }, 403: { description: "Sem permissão" } },
      },
    },
    "/api/admin/{id}/aprovar": {
      patch: {
        tags: ["Administradores"],
        summary: "Aprovar cadastro",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Aprovado" }, 400: { description: "ID inválido" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" }, 404: { description: "Não encontrado" }, 409: { description: "Não está pendente" } },
      },
    },
    "/api/admin/{id}/rejeitar": {
      patch: {
        tags: ["Administradores"],
        summary: "Rejeitar cadastro",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Rejeitado" }, 400: { description: "ID inválido" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" }, 404: { description: "Não encontrado" }, 409: { description: "Não está pendente" } },
      },
    },
    "/api/admin/historico-solicitacoes": {
      get: {
        tags: ["Administradores"],
        summary: "Histórico de solicitações",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Últimas solicitações" } },
      },
    },
    "/api/recuperacao/solicitar": {
      post: {
        tags: ["Recuperação"],
        summary: "Solicitar recuperação de senha",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RecuperacaoSolicitar" } },
          },
        },
        responses: { 200: { description: "Se o e-mail estiver cadastrado, o link será enviado" } },
      },
    },
    "/api/recuperacao/redefinir": {
      post: {
        tags: ["Recuperação"],
        summary: "Redefinir senha",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RecuperacaoRedefinir" } },
          },
        },
        responses: { 200: { description: "Senha redefinida" }, 400: { description: "Token inválido, expirado ou usado" } },
      },
    },
    "/api/animais/publicos": {
      get: {
        tags: ["Animais"],
        summary: "Listar animais disponíveis (público)",
        responses: { 200: { description: "Lista pública de animais" } },
      },
    },
    "/api/animais/resumo": {
      get: {
        tags: ["Animais"],
        summary: "Resumo de indicadores",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Indicadores resumidos" } },
      },
    },
    "/api/animais": {
      get: {
        tags: ["Animais"],
        summary: "Listar todos os animais",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Lista completa" }, 401: { $ref: "#/components/responses/UnauthorizedError" } },
      },
      post: {
        tags: ["Animais"],
        summary: "Cadastrar animal",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AnimalInput" } },
          },
        },
        responses: { 201: { description: "Criado" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" } },
      },
    },
    "/api/animais/{id}": {
      get: {
        tags: ["Animais"],
        summary: "Consultar animal",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Dados do animal" }, 404: { description: "Não encontrado" } },
      },
      put: {
        tags: ["Animais"],
        summary: "Atualizar animal (parcial)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/AnimalInputPartial" } } } },
        responses: { 200: { description: "Atualizado" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" }, 404: { description: "Não encontrado" } },
      },
      delete: {
        tags: ["Animais"],
        summary: "Excluir animal",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 204: { description: "Excluído" }, 404: { description: "Não encontrado" } },
      },
    },
    "/api/animais/importar-csv": {
      post: {
        tags: ["Importação CSV"],
        summary: "Importar animais por CSV",
        security: [{ bearerAuth: [] }],
        description: "O arquivo deve ser enviado como multipart/form-data com o campo 'file'.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary", description: "Arquivo CSV com cabeçalhos" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Importação concluída" }, 400: { description: "Arquivo vazio, cabeçalhos incompletos ou registros inválidos" } },
      },
    },
    "/api/publicacoes": {
      get: {
        tags: ["Publicações"],
        summary: "Listar publicações (público)",
        description: "Retorna apenas publicações com status 'publicado'.",
        responses: { 200: { description: "Lista pública" } },
      },
      post: {
        tags: ["Publicações"],
        summary: "Criar publicação",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PublicacaoInput" } },
          },
        },
        responses: { 201: { description: "Criado" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" } },
      },
    },
    "/api/publicacoes/admin": {
      get: {
        tags: ["Publicações"],
        summary: "Listar publicações no painel administrativo",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Lista administrativa" } },
      },
    },
    "/api/publicacoes/admin/{id}": {
      get: {
        tags: ["Publicações"],
        summary: "Consultar publicação no painel administrativo",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Publicação" }, 404: { description: "Não encontrado" } },
      },
    },
    "/api/publicacoes/dashboard/resumo": {
      get: {
        tags: ["Publicações"],
        summary: "Resumo do dashboard",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Indicadores do painel" }, 403: { description: "Apenas administradores ativos" } },
      },
    },
    "/api/publicacoes/{id}": {
      get: {
        tags: ["Publicações"],
        summary: "Consultar publicação pública",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Publicação publicada" }, 404: { description: "Não encontrado" } },
      },
      put: {
        tags: ["Publicações"],
        summary: "Atualizar publicação (parcial)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/PublicacaoInputPartial" } } } },
        responses: { 200: { description: "Atualizado" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" }, 404: { description: "Não encontrado" } },
      },
      delete: {
        tags: ["Publicações"],
        summary: "Excluir publicação",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Excluído" }, 404: { description: "Não encontrado" } },
      },
    },
    "/api/newsletter/subscribe": {
      post: {
        tags: ["Newsletter"],
        summary: "Inscrever-se na newsletter",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/NewsletterSubscribe" } },
          },
        },
        responses: { 200: { description: "Inscrição registrada" }, 400: { description: "Dados inválidos" } },
      },
    },
    "/api/newsletter/unsubscribe": {
      get: {
        tags: ["Newsletter"],
        summary: "Cancelar inscrição",
        parameters: [{ name: "email", in: "query", required: true, schema: { type: "string", format: "email" } }],
        responses: {
          200: { description: "Inscrição cancelada", content: { "text/html": { schema: { type: "string" } } } },
          400: { description: "Dados inválidos", content: { "text/html": { schema: { type: "string" } } } },
          404: { description: "E-mail não encontrado", content: { "text/html": { schema: { type: "string" } } } },
        },
      },
    },
    "/api/upload/perfil": {
      post: {
        tags: ["Upload"],
        summary: "Enviar foto de perfil",
        security: [{ bearerAuth: [] }],
        description: "Envio via multipart/form-data com campo 'foto'.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["foto"],
                properties: {
                  foto: { type: "string", format: "binary", description: "Arquivo de imagem (JPG, PNG, WebP). Tamanho máx: 5MB." },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Arquivo enviado" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 400: { description: "Arquivo ausente, inválido ou formato não permitido" }, 500: { description: "Falha no armazenamento" }, 502: { description: "Erro no armazenamento externo" } },
      },
    },
    "/api/upload/publicacao": {
      post: {
        tags: ["Upload"],
        summary: "Enviar imagem de publicação",
        security: [{ bearerAuth: [] }],
        description: "Requer permissão para gerenciar conteúdo.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["imagem"],
                properties: {
                  imagem: { type: "string", format: "binary", description: "Arquivo de imagem (JPG, PNG, WebP). Tamanho máx: 5MB." },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Enviado" }, 400: { description: "Arquivo ausente, inválido ou formato não permitido" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" }, 502: { description: "Erro no armazenamento externo" } },
      },
    },
    "/api/upload/animal": {
      post: {
        tags: ["Upload"],
        summary: "Enviar imagem de animal",
        security: [{ bearerAuth: [] }],
        description: "Requer permissão para gerenciar animais.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["imagem"],
                properties: {
                  imagem: { type: "string", format: "binary", description: "Arquivo de imagem (JPG, PNG, WebP). Tamanho máx: 5MB." },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Enviado" }, 400: { description: "Arquivo ausente, inválido ou formato não permitido" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Sem permissão" }, 502: { description: "Erro no armazenamento externo" } },
      },
    },
    "/api/upload/foto-privada": {
      get: {
        tags: ["Upload"],
        summary: "Gerar URL assinada para acesso privado",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "path", in: "query", required: true, schema: { type: "string" }, description: "Caminho do arquivo privado" },
          { name: "bucket", in: "query", required: false, schema: { type: "string", enum: ["container-perfis", "container-animais", "container-posts"], default: "container-perfis" } },
        ],
        responses: { 200: { description: "URL assinada gerada" }, 401: { $ref: "#/components/responses/UnauthorizedError" }, 403: { description: "Acesso negado" }, 400: { description: "Path ausente ou inválido" } },
      },
    },
  },
};
