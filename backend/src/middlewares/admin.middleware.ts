import type { Request, Response, NextFunction } from "express";

import Administrador from "../models/Administrador.js";
import Cargo from "../models/Cargo.js";

// exige que o admin autenticado esteja ativo e possa gerenciar admins
export async function exigirPermissaoGerenciarAdmins(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.usuario?.id;

    if (!adminId) {
      res.status(401).json({ mensagem: "Token inválido." });
      return;
    }

    const admin = await Administrador.findByPk(adminId, {
      include: [{ model: Cargo, as: "cargoRef" }],
    });

    if (!admin || admin.status !== "ativo" || !admin.ativo) {
      res.status(403).json({
        mensagem: "Apenas administradores ativos podem realizar esta ação.",
      });
      return;
    }

    const cargoRef = admin.get("cargoRef") as Cargo | undefined;

    if (!cargoRef?.podeGerenciarAdmins) {
      res.status(403).json({
        mensagem: "Você não tem permissão para gerenciar administradores.",
      });
      return;
    }

    next();
  } catch (erro: unknown) {
    console.error("Erro ao verificar permissão:", erro);
    res.status(500).json({ mensagem: "Erro ao verificar permissões." });
  }
}