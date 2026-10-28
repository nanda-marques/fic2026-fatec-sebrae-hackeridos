import { Op } from "sequelize";

import Administrador from "../models/Administrador.js";
import Publicacao from "../models/Publicacao.js";

import type {
  CategoriaConteudo,
  PublicacaoInput,
  StatusPublicacao,
} from "../types/publicacao.js";

export class PublicacaoServiceError extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
  }
}

const CATEGORIAS_VALIDAS: CategoriaConteudo[] = [
  "noticia",
  "evento",
  "campanha",
  "publicacao",
];

const STATUS_VALIDOS: StatusPublicacao[] = [
  "rascunho",
  "publicado",
  "agendado",
  "arquivado",
];

const CATEGORIAS_DASHBOARD: CategoriaConteudo[] = [
  "campanha",
  "noticia",
  "evento",
  "publicacao",
];

function validar(dados: Partial<PublicacaoInput> | undefined, parcial = false): string | null {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return "Dados do conteúdo inválidos.";
  }

  if (!parcial && !dados.titulo) return "O título é obrigatório.";
  if (!parcial && !dados.categoria) return "A categoria é obrigatória.";

  if (
    dados.titulo !== undefined &&
    (typeof dados.titulo !== "string" || !dados.titulo.trim() || dados.titulo.length > 255)
  ) {
    return "O título deve ter entre 1 e 255 caracteres.";
  }

  if (
    dados.categoria !== undefined &&
    (typeof dados.categoria !== "string" || dados.categoria.length > 50)
  ) {
    return "Categoria inválida.";
  }

  if (dados.status !== undefined && !STATUS_VALIDOS.includes(dados.status)) {
    return "Status inválido.";
  }

  if (dados.descricaoConteudo !== undefined && typeof dados.descricaoConteudo !== "string") {
    return "O conteúdo deve ser um texto.";
  }

  if (
    dados.dataEventoCampanha != null &&
    (typeof dados.dataEventoCampanha !== "string" ||
      Number.isNaN(new Date(dados.dataEventoCampanha).getTime()))
  ) {
    return "Data do evento/campanha inválida.";
  }

  if (dados.destaque !== undefined && typeof dados.destaque !== "boolean") {
    return "O campo de destaque deve ser verdadeiro ou falso.";
  }

  if (dados.urgente !== undefined && typeof dados.urgente !== "boolean") {
    return "O campo de urgência deve ser verdadeiro ou falso.";
  }

  if (
    dados.imagem != null &&
    (typeof dados.imagem !== "string" ||
      dados.imagem.length > 500 ||
      !/^https?:\/\/\S+$/i.test(dados.imagem))
  ) {
    return "URL da imagem inválida.";
  }

  if (dados.autor != null && (typeof dados.autor !== "string" || dados.autor.length > 255)) {
    return "A autoria deve ter no máximo 255 caracteres.";
  }

  if (dados.resumo != null && (typeof dados.resumo !== "string" || dados.resumo.length > 500)) {
    return "O resumo deve ter no máximo 500 caracteres.";
  }

  if (dados.titulo !== undefined && typeof dados.titulo === "string" && !dados.titulo.trim()) {
    return "O título é obrigatório.";
  }

  if (dados.categoria !== undefined && !CATEGORIAS_VALIDAS.includes(dados.categoria)) {
    return "Categoria inválida.";
  }

  for (const [campo, url] of [
    ["arrecadação", dados.urlArrecadacao],
    ["vídeo", dados.urlVideo],
  ] as const) {
    if (
      url != null &&
      (typeof url !== "string" ||
        (url !== "" && (url.length > 500 || !/^https?:\/\/\S+$/i.test(url))))
    ) {
      return `URL de ${campo} inválida.`;
    }
  }

  if (
    dados.localEventoCampanha !== undefined &&
    dados.localEventoCampanha !== null &&
    (typeof dados.localEventoCampanha !== "string" || dados.localEventoCampanha.length > 255)
  ) {
    return "O local deve ter no máximo 255 caracteres.";
  }

  return null;
}

function parseData(valor: string | null | undefined): Date | null | undefined {
  if (valor === undefined) return undefined;
  if (valor === null || valor === "") return null;
  return new Date(valor);
}

export const publicacoesService = {
  listarPublicas() {
    return Publicacao.findAll({
      where: { status: "publicado" },
      order: [["criadoEm", "DESC"]],
    });
  },

  listarAdmin() {
    return Publicacao.findAll({ order: [["atualizadoEm", "DESC"]] });
  },

  async buscar(id: string, apenasPublicada = false) {
    const conteudo = await Publicacao.findByPk(id);

    if (!conteudo || (apenasPublicada && conteudo.status !== "publicado")) {
      throw new PublicacaoServiceError(404, "Conteúdo não encontrado.");
    }

    return conteudo;
  },

  async dashboard(usuarioId?: number) {
    const administrador = usuarioId ? await Administrador.findByPk(usuarioId) : null;

    if (!administrador || !administrador.ativo || administrador.status !== "ativo") {
      throw new PublicacaoServiceError(
        403,
        "Apenas administradores ativos podem acessar o dashboard."
      );
    }

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setUTCDate(amanha.getUTCDate() + 1);

    const em31Dias = new Date(hoje);
    em31Dias.setUTCDate(em31Dias.getUTCDate() + 31);

    const ha7Dias = new Date(hoje);
    ha7Dias.setUTCDate(ha7Dias.getUTCDate() - 7);

    const [
      totalPublicacoes,
      campanhasAtivas,
      eventosProximos,
      noticiasRecentes,
      ...contagens
    ] = await Promise.all([
      Publicacao.count(),
      Publicacao.count({ where: { categoria: "campanha", status: "publicado" } }),
      Publicacao.count({
        where: { categoria: "evento", dataEventoCampanha: { [Op.gte]: hoje, [Op.lt]: em31Dias } },
      }),
      Publicacao.count({
        where: { categoria: "noticia", criadoEm: { [Op.gte]: ha7Dias, [Op.lt]: amanha } },
      }),
      ...CATEGORIAS_DASHBOARD.map((categoria) => Publicacao.count({ where: { categoria } })),
    ]);

    return {
      totalPublicacoes,
      campanhasAtivas,
      eventosProximos,
      noticiasRecentes,
      publicacoesPorCategoria: Object.fromEntries(
        CATEGORIAS_DASHBOARD.map((categoria, indice) => [categoria, contagens[indice]])
      ),
    };
  },

  async criar(dados: Partial<PublicacaoInput> | undefined, criadoPor: number) {
    const erro = validar(dados);
    if (erro) throw new PublicacaoServiceError(400, erro);

    if (!dados?.titulo || !dados.categoria) {
      throw new PublicacaoServiceError(400, "Dados do conteúdo inválidos.");
    }

    return Publicacao.create({
      titulo: dados.titulo.trim(),
      categoria: dados.categoria,
      status: dados.status ?? "rascunho",
      descricaoConteudo: dados.descricaoConteudo ?? "",
      imagem: dados.imagem ?? null,
      autor: dados.autor?.trim() || null,
      resumo: dados.resumo?.trim() || null,
      destaque: dados.destaque ?? false,
      urgente: dados.urgente ?? false,
      dataEventoCampanha: parseData(dados.dataEventoCampanha) ?? null,
      localEventoCampanha: dados.localEventoCampanha?.trim() || null,
      urlArrecadacao: dados.urlArrecadacao?.trim() || null,
      urlVideo: dados.urlVideo?.trim() || null,
      criadoPor,
    });
  },

  async atualizar(id: string, dados: Partial<PublicacaoInput>) {
    const conteudo = await this.buscar(id);

    const erro = validar(dados, true);
    if (erro) throw new PublicacaoServiceError(400, erro);

    conteudo.set({
      ...(dados.titulo !== undefined && { titulo: dados.titulo.trim() }),
      ...(dados.categoria !== undefined && { categoria: dados.categoria }),
      ...(dados.status !== undefined && { status: dados.status }),
      ...(dados.descricaoConteudo !== undefined && {
        descricaoConteudo: dados.descricaoConteudo,
      }),
      ...(dados.imagem !== undefined && { imagem: dados.imagem }),
      ...(dados.autor !== undefined && { autor: dados.autor?.trim() || null }),
      ...(dados.resumo !== undefined && { resumo: dados.resumo?.trim() || null }),
      ...(dados.destaque !== undefined && { destaque: dados.destaque }),
      ...(dados.urgente !== undefined && { urgente: dados.urgente }),
      ...(dados.dataEventoCampanha !== undefined && {
        dataEventoCampanha: parseData(dados.dataEventoCampanha) ?? null,
      }),
      ...(dados.localEventoCampanha !== undefined && {
        localEventoCampanha: dados.localEventoCampanha?.trim() || null,
      }),
      ...(dados.urlArrecadacao !== undefined && {
        urlArrecadacao: dados.urlArrecadacao?.trim() || null,
      }),
      ...(dados.urlVideo !== undefined && { urlVideo: dados.urlVideo?.trim() || null }),
      atualizadoEm: new Date(),
    });

    await conteudo.save();
    await conteudo.reload();

    return conteudo;
  },

  async excluir(id: string) {
    const conteudo = await this.buscar(id);
    await conteudo.destroy();
  },
};