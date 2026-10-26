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

export function textoConteudoCompleto(publicacao: Publicacao): string {
  const html = publicacao.descricaoConteudo ?? "";
  const comQuebras = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote)>/gi, "\n");
  const documento = new DOMParser().parseFromString(comQuebras, "text/html");
  documento.querySelectorAll("script, style").forEach((elemento) => elemento.remove());

  return (documento.body.textContent ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
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
