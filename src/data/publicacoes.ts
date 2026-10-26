import type {
  CategoriaConteudo,
  Publicacao,
} from "../services/publicacoesApi";

export type { Publicacao } from "../services/publicacoesApi";
export type Categoria = CategoriaConteudo;

export const nomeCategoria: Record<CategoriaConteudo, string> = {
  noticia: "Notícia",
  evento: "Evento",
  campanha: "Campanha",
  publicacao: "Publicação",
};

export function resumoConteudo(publicacao: Publicacao): string {
  return (publicacao.resumo || publicacao.descricaoConteudo || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dataValida(valor: string): Date | null {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function formatarDataCurta(valor: string | null): string {
  if (!valor) return "";
  const data = dataValida(valor);
  return data
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(data).replace(".", "")
    : valor;
}

export function formatarDataExtenso(valor: string | null): string {
  if (!valor) return "";
  const data = dataValida(valor);
  return data
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(data)
    : valor;
}
