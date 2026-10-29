import type { Request, Response, NextFunction } from "express";
import {
  ConnectionError as SequelizeConnectionError,
  UniqueConstraintError as SequelizeUniqueConstraintError,
  ValidationError as SequelizeValidationError,
} from "sequelize";

export class HttpError extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
    this.name = "HttpError";
  }
}

export function tratarErros(
  erro: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) return;

  // 1. HttpError (auth/admin/animais/publicacoes)
  if (erro instanceof HttpError) {
    res.status(erro.status).json({ mensagem: erro.message });
    return;
  }

  // 2. JSON malformado (body-parser) — ANTES do bloco 3
  if (
    erro instanceof SyntaxError ||
    (typeof erro === "object" &&
      erro !== null &&
      "type" in erro &&
      (erro as { type: string }).type === "entity.parse.failed")
  ) {
    res.status(400).json({ mensagem: "JSON malformado no corpo da requisição." });
    return;
  }

  // 3. Erros dos services (têm `status` numérico)
  if (
    erro instanceof Error &&
    "status" in erro &&
    typeof (erro as { status: unknown }).status === "number"
  ) {
    const status = (erro as { status: number }).status;
    res.status(status).json({ mensagem: erro.message });
    return;
  }

  // 4. Multer
  if (typeof erro === "object" && erro && "code" in erro) {
    const codigo = (erro as { code: string }).code;
    if (codigo === "LIMIT_FILE_SIZE") {
      res.status(413).json({ mensagem: "Arquivo excede o limite de 5MB." });
      return;
    }
  }

  // 5. Sequelize: validação
  if (erro instanceof SequelizeValidationError) {
    res.status(400).json({
      mensagem: "Dados inválidos.",
      detalhes: erro.errors.map((e) => e.message),
    });
    return;
  }

  // 6. Sequelize: unicidade
  if (erro instanceof SequelizeUniqueConstraintError) {
    res.status(409).json({
      mensagem: "Registro já existe.",
      detalhes: erro.errors.map((e) => e.message),
    });
    return;
  }

  // 7. Sequelize: conexão
  if (erro instanceof SequelizeConnectionError) {
    console.error("[DB] Falha de conexão:", erro);
    res.status(503).json({ mensagem: "Serviço temporariamente indisponível." });
    return;
  }

  // 8. Erro inesperado
  console.error("[UNHANDLED]", erro);
  res.status(500).json({ mensagem: "Erro interno no servidor." });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}