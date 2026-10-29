import type { Request, Response } from "express";

import { HttpError } from "../middlewares/error.middleware.js";
import { publicacoesService } from "../services/publicacoes.service.js";

import type { PublicacaoInput } from "../types/publicacao.js";

function obterId(req: Request): string {
  const id = req.params.id;

  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    throw new HttpError(400, "ID do conteúdo inválido.");
  }

  return id;
}

export const publicacoesController = {
  async listarPublicas(_req: Request, res: Response) {
    res.json(await publicacoesService.listarPublicas());
  },

  async dashboard(req: Request, res: Response) {
    res.json(await publicacoesService.dashboard(req.usuario?.id));
  },

  async listarAdmin(_req: Request, res: Response) {
    res.json(await publicacoesService.listarAdmin());
  },

  async buscarAdmin(req: Request, res: Response) {
    const id = obterId(req);
    res.json(await publicacoesService.buscar(id));
  },

  async buscarPublica(req: Request, res: Response) {
    const id = obterId(req);
    res.json(await publicacoesService.buscar(id, true));
  },

  async criar(req: Request, res: Response) {
    if (!req.usuario) throw new HttpError(401, "Não autenticado.");
    const publicacao = await publicacoesService.criar(
      req.body as Partial<PublicacaoInput>,
      req.usuario.id
    );
    res.status(201).json(publicacao);
  },

  async atualizar(req: Request, res: Response) {
    const id = obterId(req);
    const publicacao = await publicacoesService.atualizar(
      id,
      req.body as Partial<PublicacaoInput>
    );
    res.json(publicacao);
  },

  async excluir(req: Request, res: Response) {
    const id = obterId(req);
    await publicacoesService.excluir(id);
    res.status(204).end();
  },
};