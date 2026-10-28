import type { Request, Response } from "express";

import { PublicacaoServiceError, publicacoesService } from "../services/publicacoes.service.js";

import type { PublicacaoInput } from "../types/publicacao.js";

function obterId(req: Request, res: Response): string | null {
  const id = req.params.id;

  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    res.status(400).json({ erro: "ID do conteúdo inválido." });
    return null;
  }

  return id;
}

function responderErro(error: unknown, res: Response): boolean {
  if (error instanceof PublicacaoServiceError) {
    res.status(error.status).json({ erro: error.message });
    return true;
  }

  return false;
}

export const publicacoesController = {
  async listarPublicas(_req: Request, res: Response) {
    res.json(await publicacoesService.listarPublicas());
  },

  async dashboard(req: Request, res: Response) {
    try {
      res.json(await publicacoesService.dashboard(req.usuario?.id));
    } catch (error) {
      if (!responderErro(error, res)) throw error;
    }
  },

  async listarAdmin(_req: Request, res: Response) {
    res.json(await publicacoesService.listarAdmin());
  },

  async buscarAdmin(req: Request, res: Response) {
    const id = obterId(req, res);
    if (!id) return;

    try {
      res.json(await publicacoesService.buscar(id));
    } catch (error) {
      if (!responderErro(error, res)) throw error;
    }
  },

  async buscarPublica(req: Request, res: Response) {
    const id = obterId(req, res);
    if (!id) return;

    try {
      res.json(await publicacoesService.buscar(id, true));
    } catch (error) {
      if (!responderErro(error, res)) throw error;
    }
  },

  async criar(req: Request, res: Response) {
    try {
      if (!req.usuario) {
        res.status(401).json({ erro: "Não autenticado." });
        return;
      }

      res.status(201).json(
        await publicacoesService.criar(req.body as Partial<PublicacaoInput>, req.usuario.id)
      );
    } catch (error) {
      if (!responderErro(error, res)) throw error;
    }
  },

  async atualizar(req: Request, res: Response) {
    const id = obterId(req, res);
    if (!id) return;

    try {
      res.json(await publicacoesService.atualizar(id, req.body as Partial<PublicacaoInput>));
    } catch (error) {
      if (!responderErro(error, res)) throw error;
    }
  },

  async excluir(req: Request, res: Response) {
    const id = obterId(req, res);
    if (!id) return;

    try {
      await publicacoesService.excluir(id);
      res.status(204).end();
    } catch (error) {
      if (!responderErro(error, res)) throw error;
    }
  },
};