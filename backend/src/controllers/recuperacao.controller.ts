import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import { recuperacaoService } from "../services/recuperacao.service.js";

export const recuperacaoController = {
  async solicitar(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      throw new HttpError(400, "E-mail é obrigatório.");
    }

    await recuperacaoService.solicitarRecuperacao(email.trim());

    res.json({
      mensagem: "Se o e-mail estiver cadastrado, você receberá o link em instantes.",
    });
  },

  async redefinir(req: Request, res: Response): Promise<void> {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) {
      throw new HttpError(400, "Token e nova senha são obrigatórios.");
    }

    if (novaSenha.length < 8) {
      throw new HttpError(400, "A senha deve ter pelo menos 8 caracteres.");
    }

    const ok = await recuperacaoService.redefinirSenha(token, novaSenha);
    if (!ok) {
      throw new HttpError(400, "Token inválido, expirado ou já utilizado.");
    }

    res.json({ mensagem: "Senha redefinida com sucesso." });
  },
};
