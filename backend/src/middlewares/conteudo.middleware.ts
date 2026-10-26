import type { Request, Response } from "express";

import { asyncHandler } from "./error.middleware.js";
import Administrador from "../models/Administrador.js";
import Cargo from "../models/Cargo.js";

export const exigirPermissaoConteudo = asyncHandler(
  async (req: Request, res: Response, next): Promise<void> => {
    const usuario = req.usuario;
    if (!usuario) {
      res.status(401).json({ erro: "Não autenticado." });
      return;
    }

    const administrador = await Administrador.findByPk(usuario.id, {
      include: [{ model: Cargo, as: "cargoRef" }],
    });

    if (!administrador) {
      res.status(401).json({ erro: "Administrador não encontrado." });
      return;
    }

    if (!administrador.ativo || administrador.status !== "ativo") {
      res.status(403).json({ erro: "Conta inativa ou bloqueada." });
      return;
    }

    const cargo = administrador.get("cargoRef") as Cargo | undefined;
    if (!cargo?.podeGerenciarConteudo) {
      res.status(403).json({
        erro: "Você não tem permissão para gerenciar conteúdos.",
      });
      return;
    }

    next();
  }
);
