import { Router } from "express";
import type { Request, Response } from "express";

import { asyncHandler } from "../middlewares/error.middleware.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { exigirPermissaoConteudo } from "../middlewares/conteudo.middleware.js";
import Publicacao from "../models/Publicacao.js";
import type {
  CategoriaConteudo,
  PublicacaoInput,
  StatusPublicacao,
} from "../types/publicacao.js";

const router = Router();

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

function validar(
  dados: Partial<PublicacaoInput> | undefined,
  parcial = false
): string | null {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return "Dados do conteúdo inválidos.";
  }
  if (!parcial && !dados.titulo) return "O título é obrigatório.";
  if (!parcial && !dados.categoria) return "A categoria é obrigatória.";
  if (
    dados.titulo !== undefined &&
    (typeof dados.titulo !== "string" ||
      !dados.titulo.trim() ||
      dados.titulo.length > 255)
  ) {
    return "O título deve ter entre 1 e 255 caracteres.";
  }
  if (
    dados.categoria !== undefined &&
    (typeof dados.categoria !== "string" || dados.categoria.length > 50)
  ) {
    return "Categoria inválida.";
  }
  if (
    dados.status !== undefined &&
    !STATUS_VALIDOS.includes(dados.status)
  ) {
    return "Status inválido.";
  }
  if (
    dados.descricaoConteudo !== undefined &&
    typeof dados.descricaoConteudo !== "string"
  ) {
    return "O conteúdo deve ser um texto.";
  }
  if (
    dados.dataEventoCampanha != null &&
    (typeof dados.dataEventoCampanha !== "string" ||
      Number.isNaN(new Date(dados.dataEventoCampanha).getTime()))
  ) {
    return "Data do evento/campanha inválida.";
  }
  if (
    dados.destaque !== undefined &&
    typeof dados.destaque !== "boolean"
  ) {
    return "O campo de destaque deve ser verdadeiro ou falso.";
  }
  if (
    dados.urgente !== undefined &&
    typeof dados.urgente !== "boolean"
  ) {
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
  if (
    dados.autor != null &&
    (typeof dados.autor !== "string" || dados.autor.length > 255)
  ) {
    return "A autoria deve ter no máximo 255 caracteres.";
  }
  if (
    dados.resumo != null &&
    (typeof dados.resumo !== "string" || dados.resumo.length > 500)
  ) {
    return "O resumo deve ter no máximo 500 caracteres.";
  }
  if (
    dados.titulo !== undefined &&
    typeof dados.titulo === "string" &&
    !dados.titulo.trim()
  ) {
    return "O título é obrigatório.";
  }
  if (
    dados.categoria !== undefined &&
    !CATEGORIAS_VALIDAS.includes(dados.categoria)
  ) {
    return "Categoria inválida.";
  }
  if (
    dados.dataEventoCampanha &&
    Number.isNaN(new Date(dados.dataEventoCampanha).getTime())
  ) {
    return "Data do evento/campanha inválida.";
  }
  for (const [campo, url] of [
    ["arrecadação", dados.urlArrecadacao],
    ["vídeo", dados.urlVideo],
  ] as const) {
    if (
      url != null &&
      (typeof url !== "string" ||
        (url !== "" &&
          (url.length > 500 || !/^https?:\/\/\S+$/i.test(url))))
    ) {
      return `URL de ${campo} inválida.`;
    }
  }
  if (
    dados.localEventoCampanha !== undefined &&
    dados.localEventoCampanha !== null &&
    (typeof dados.localEventoCampanha !== "string" ||
      dados.localEventoCampanha.length > 255)
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

function obterId(req: Request, res: Response): string | null {
  const id = req.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    res.status(400).json({ erro: "ID do conteúdo inválido." });
    return null;
  }
  return id;
}

// Conteúdos públicos
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const conteudos = await Publicacao.findAll({
      where: { status: "publicado" },
      order: [["criadoEm", "DESC"]],
    });
    res.json(conteudos);
  })
);

// Listagem administrativa
router.get(
  "/admin",
  autenticar,
  exigirPermissaoConteudo,
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const conteudos = await Publicacao.findAll({
      order: [["atualizadoEm", "DESC"]],
    });
    res.json(conteudos);
  })
);

// Buscar conteúdo por ID
router.get(
  "/admin/:id",
  autenticar,
  exigirPermissaoConteudo,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = obterId(req, res);
    if (!id) return;
    const conteudo = await Publicacao.findByPk(id);
    if (!conteudo) {
      res.status(404).json({ erro: "Conteúdo não encontrado." });
      return;
    }
    res.json(conteudo);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = obterId(req, res);
    if (!id) return;
    const conteudo = await Publicacao.findByPk(id);
    if (!conteudo || conteudo.status !== "publicado") {
      res.status(404).json({ erro: "Conteúdo não encontrado." });
      return;
    }
    res.json(conteudo);
  })
);

// Criar conteúdo
router.post(
  "/",
  autenticar,
  exigirPermissaoConteudo,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dados = req.body as Partial<PublicacaoInput>;
    const erro = validar(dados);
    if (erro) {
      res.status(400).json({ erro });
      return;
    }
    if (!req.usuario) {
      res.status(401).json({ erro: "Não autenticado." });
      return;
    }

    const conteudo = await Publicacao.create({
      titulo: dados.titulo!.trim(),
      categoria: dados.categoria!,
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
      criadoPor: req.usuario.id,
    });

    res.status(201).json(conteudo);
  })
);

// Atualizar conteúdo
router.put(
  "/:id",
  autenticar,
  exigirPermissaoConteudo,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = obterId(req, res);
    if (!id) return;
    const conteudo = await Publicacao.findByPk(id);
    if (!conteudo) {
      res.status(404).json({ erro: "Conteúdo não encontrado." });
      return;
    }

    const dados = req.body as Partial<PublicacaoInput>;
    const erro = validar(dados, true);
    if (erro) {
      res.status(400).json({ erro });
      return;
    }

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
      ...(dados.urlVideo !== undefined && {
        urlVideo: dados.urlVideo?.trim() || null,
      }),
      atualizadoEm: new Date(),
    });

    await conteudo.save();
    await conteudo.reload();
    res.json(conteudo);
  })
);

// Excluir conteúdo
router.delete(
  "/:id",
  autenticar,
  exigirPermissaoConteudo,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = obterId(req, res);
    if (!id) return;
    const conteudo = await Publicacao.findByPk(id);
    if (!conteudo) {
      res.status(404).json({ erro: "Conteúdo não encontrado." });
      return;
    }
    await conteudo.destroy();
    res.status(204).end();
  })
);

export default router;
