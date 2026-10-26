const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type CategoriaConteudo =
  | "noticia"
  | "evento"
  | "campanha"
  | "publicacao";

export type StatusPublicacao =
  | "rascunho"
  | "publicado"
  | "agendado"
  | "arquivado";

export interface Publicacao {
  id: number;
  categoria: CategoriaConteudo;
  status: StatusPublicacao;
  titulo: string;
  descricaoConteudo: string | null;
  imagem: string | null;
  autor: string | null;
  resumo: string | null;
  destaque: boolean;
  urgente: boolean;
  dataEventoCampanha: string | null;
  localEventoCampanha: string | null;
  urlArrecadacao: string | null;
  urlVideo: string | null;
  criadoPor: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export type PublicacaoPayload = Pick<
  Publicacao,
  | "categoria"
  | "titulo"
  | "descricaoConteudo"
  | "dataEventoCampanha"
  | "localEventoCampanha"
  | "urlArrecadacao"
  | "urlVideo"
  | "status"
  | "imagem"
  | "autor"
  | "resumo"
  | "destaque"
  | "urgente"
>;

interface ErroApi {
  erro?: string;
  mensagem?: string;
  message?: string;
}

async function requisicao<T>(
  caminho: string,
  opcoes: RequestInit = {},
  exigirAutenticacao = false
): Promise<T> {
  const token = localStorage.getItem("token");
  if (exigirAutenticacao && !token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const headers = new Headers(opcoes.headers);
  if (opcoes.body && !(opcoes.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers,
  });

  if (resposta.status === 204) {
    if (!resposta.ok) throw new Error(`Erro ${resposta.status} em ${caminho}`);
    return undefined as T;
  }

  const texto = await resposta.text();
  let dados: unknown = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }
  if (!resposta.ok) {
    const erro = dados as ErroApi | string | null;
    const mensagem =
      typeof erro === "string"
        ? erro
        : erro?.erro ?? erro?.mensagem ?? erro?.message ?? `Erro ${resposta.status}`;
    throw new Error(mensagem);
  }
  return dados as T;
}

export const publicacoesApi = {
  listarAdmin: (): Promise<Publicacao[]> =>
    requisicao<Publicacao[]>("/api/publicacoes/admin", {}, true),

  listarPublicadas: (): Promise<Publicacao[]> =>
    requisicao<Publicacao[]>("/api/publicacoes"),

  buscar: (id: number | string): Promise<Publicacao> => {
    if (id === undefined || id === null || id === "") {
      return Promise.reject(new Error("ID do conteúdo não informado."));
    }
    return requisicao<Publicacao>(`/api/publicacoes/${id}`);
  },

  buscarAdmin: (id: number | string): Promise<Publicacao> => {
    if (id === undefined || id === null || id === "") {
      return Promise.reject(new Error("ID do conteúdo não informado."));
    }
    return requisicao<Publicacao>(`/api/publicacoes/admin/${id}`, {}, true);
  },

  salvar: (
    dados: PublicacaoPayload,
    id?: number | string
  ): Promise<Publicacao> =>
    requisicao<Publicacao>(
      id != null ? `/api/publicacoes/${id}` : "/api/publicacoes",
      {
        method: id != null ? "PUT" : "POST",
        body: JSON.stringify(dados),
      },
      true
    ),

  enviarImagem: (arquivo: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("imagem", arquivo);
    return requisicao(
      "/api/upload/publicacao",
      {
        method: "POST",
        body: form,
      },
      true
    );
  },

  excluir: (id: number | string): Promise<void> =>
    requisicao<void>(`/api/publicacoes/${id}`, { method: "DELETE" }, true),
};
