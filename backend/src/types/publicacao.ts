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
  titulo: string;
  categoria: CategoriaConteudo;
  status: StatusPublicacao;
  descricaoConteudo: string;
  imagem: string | null;
  autor: string | null;
  resumo: string | null;
  destaque: boolean;
  urgente: boolean;
  dataEventoCampanha: string | null;
  localEventoCampanha: string | null;
  urlArrecadacao: string | null;
  urlVideo: string | null;
  // TODO: incluir o campo na API quando a integração de newsletter for implementada.
  criadoPor: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export type PublicacaoInput = Pick<
  Publicacao,
  | "titulo"
  | "categoria"
  | "descricaoConteudo"
  | "dataEventoCampanha"
  | "localEventoCampanha"
  | "urlArrecadacao"
  | "urlVideo"
  | "imagem"
  | "autor"
  | "resumo"
  | "destaque"
  | "urgente"
> & {
  status?: StatusPublicacao;
};