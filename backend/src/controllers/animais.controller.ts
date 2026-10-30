import type { Request, Response } from "express";

import { HttpError } from "../middlewares/error.middleware.js";
import { animaisService } from "../services/animais.service.js";

import type { AnimalInput } from "../types/animal.js";

function obterId(req: Request): number {
  const id = req.params.id;

  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    throw new HttpError(400, "ID do animal inválido.");
  }

  return Number(id);
}

export const animaisController = {
  async listarPublicos(_req: Request, res: Response) {
    res.json(await animaisService.listarPublicos());
  },

  async listar(_req: Request, res: Response) {
    res.json(await animaisService.listar());
  },

  async buscar(req: Request, res: Response) {
    const id = obterId(req);
    res.json(await animaisService.buscar(id));
  },

  async criar(req: Request, res: Response) {
    if (!req.usuario) throw new HttpError(401, "Não autenticado.");
    const animal = await animaisService.criar(
      req.body as AnimalInput | undefined,
      req.usuario.id
    );
    res.status(201).json(animal);
  },

  async atualizar(req: Request, res: Response) {
    const id = obterId(req);
    const animal = await animaisService.atualizar(
      id,
      req.body as Partial<AnimalInput> | undefined
    );
    res.json(animal);
  },

  async excluir(req: Request, res: Response) {
    const id = obterId(req);
    await animaisService.excluir(id);
    res.status(204).end();
  },

  async resumo(_req: Request, res: Response) {
    res.json(await animaisService.resumo());
  },
};