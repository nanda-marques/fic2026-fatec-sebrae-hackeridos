import type { Request, Response } from "express";
import { AnimalServiceError, animaisService } from "../services/animais.service.js";
import type { AnimalInput } from "../types/animal.js";

function responderErro(error: unknown, res: Response): boolean {
  if (error instanceof AnimalServiceError) { res.status(error.status).json({ erro: error.message }); return true; }
  return false;
}
function obterId(req: Request, res: Response): number | null {
  const id = req.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id)) { res.status(400).json({ erro: "ID do animal inválido." }); return null; }
  return Number(id);
}

export const animaisController = {
  async listarPublicos(_req: Request, res: Response) { res.json(await animaisService.listarPublicos()); },
  async listar(_req: Request, res: Response) { res.json(await animaisService.listar()); },
  async buscar(req: Request, res: Response) { const id = obterId(req, res); if (id === null) return; try { res.json(await animaisService.buscar(id)); } catch (error) { if (!responderErro(error, res)) throw error; } },
  async criar(req: Request, res: Response) { try { if (!req.usuario) { res.status(401).json({ erro: "Não autenticado." }); return; } res.status(201).json(await animaisService.criar(req.body as AnimalInput | undefined, req.usuario.id)); } catch (error) { if (!responderErro(error, res)) throw error; } },
  async atualizar(req: Request, res: Response) { const id = obterId(req, res); if (id === null) return; try { res.json(await animaisService.atualizar(id, req.body as Partial<AnimalInput> | undefined)); } catch (error) { if (!responderErro(error, res)) throw error; } },
  async excluir(req: Request, res: Response) { const id = obterId(req, res); if (id === null) return; try { await animaisService.excluir(id); res.status(204).end(); } catch (error) { if (!responderErro(error, res)) throw error; } },
};
