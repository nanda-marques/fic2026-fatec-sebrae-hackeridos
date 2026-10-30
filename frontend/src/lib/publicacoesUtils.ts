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

const publicacoes: Publicacao[] = [];

// Altere para ordenar estritamente pela data de criação (ou atualização)
const dataMaisRecente = (publicacao: Publicacao): string =>
  publicacao.criadoEm ?? "";

const maisRecentePrimeiro = (a: Publicacao, b: Publicacao): number =>
  dataMaisRecente(b).localeCompare(dataMaisRecente(a));

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

  return (documento.body?.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export const campanhasUrgentes: Publicacao[] = publicacoes
  .filter((p) => p.urgente)
  .sort(maisRecentePrimeiro);

export const campanhasEmDestaque: Publicacao[] = [
  ...campanhasUrgentes,
  ...publicacoes.filter((p) => !p.urgente && p.destaque).sort(maisRecentePrimeiro),
];

export function buscarPublicacao(id: string | undefined): Publicacao | undefined {
  return publicacoes.find((p) => String(p.id) === id);
}

function dataValida(valor: string | null): Date | null {
  if (!valor) return null;
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
