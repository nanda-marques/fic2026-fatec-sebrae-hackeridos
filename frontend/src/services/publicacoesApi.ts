import { api } from "./api";

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
  dispararNewsletter: boolean;
}

export interface ResumoDashboard {
  totalPublicacoes: number;
  campanhasAtivas: number;
  eventosProximos: number;
  noticiasRecentes: number;
  publicacoesPorCategoria: Record<CategoriaConteudo, number>;
  animais?: {
    total: number;
    disponiveis: number;
    adotados: number;
    vacinacao: { dia: number; naoDia: number };
    castracao: { castrado: number; pendente: number; agendada: number; naoInformado: number };
  };
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
  | "dispararNewsletter"
>;

export const publicacoesApi = {
  resumoDashboard: (): Promise<ResumoDashboard> =>
    api
      .get<ResumoDashboard>("/api/publicacoes/dashboard/resumo")
      .then((r) => r.data),

  listarAdmin: (): Promise<Publicacao[]> =>
    api.get<Publicacao[]>("/api/publicacoes/admin").then((r) => r.data),

  listarPublicadas: (): Promise<Publicacao[]> =>
    api.get<Publicacao[]>("/api/publicacoes").then((r) => r.data),

  buscar: (id: number | string): Promise<Publicacao> => {
    if (id === undefined || id === null || id === "") {
      return Promise.reject(new Error("ID do conteúdo não informado."));
    }
    return api.get<Publicacao>(`/api/publicacoes/${id}`).then((r) => r.data);
  },

  buscarAdmin: (id: number | string): Promise<Publicacao> => {
    if (id === undefined || id === null || id === "") {
      return Promise.reject(new Error("ID do conteúdo não informado."));
    }
    return api
      .get<Publicacao>(`/api/publicacoes/admin/${id}`)
      .then((r) => r.data);
  },

  salvar: (
    dados: PublicacaoPayload,
    id?: number | string
  ): Promise<Publicacao> => {
    if (id != null) {
      return api
        .put<Publicacao>(`/api/publicacoes/${id}`, dados)
        .then((r) => r.data);
    }
    return api.post<Publicacao>("/api/publicacoes", dados).then((r) => r.data);
  },

  enviarImagem: (arquivo: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("imagem", arquivo);
    return api
      .post<{ url: string }>("/api/upload/publicacao", form)
      .then((r) => r.data);
  },

  excluir: (id: number | string): Promise<void> =>
    api.delete(`/api/publicacoes/${id}`).then(() => undefined),
};