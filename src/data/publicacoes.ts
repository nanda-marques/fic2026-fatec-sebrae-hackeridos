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

export function resumoConteudo(publicacao: Publicacao): string {
  const texto = publicacao.resumo ?? publicacao.descricaoConteudo ?? "";
  return texto
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function textoConteudoCompleto(publicacao: Publicacao): string {
  const html = publicacao.descricaoConteudo ?? "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?:p|div|li|h[1-6]|blockquote|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const maisRecentePrimeiro = (a: Publicacao, b: Publicacao) =>
  b.dataEventoCampanha.localeCompare(a.dataEventoCampanha);

/** Todas as campanhas urgentes, da mais recente para a mais antiga (usadas na Home). */
export const campanhasUrgentes: Publicacao[] = publicacoes
  .filter((p) => p.urgente)
  .sort(maisRecentePrimeiro);

/** Carrossel de Eventos: primeiro as urgentes, depois as em destaque. */
export const campanhasEmDestaque: Publicacao[] = [
  ...campanhasUrgentes,
  ...publicacoes.filter((p) => !p.urgente && p.destaque).sort(maisRecentePrimeiro),
];

export function buscarPublicacao(id: string | undefined): Publicacao | undefined {
  return publicacoes.find((p) => String(p.id) === id);
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
