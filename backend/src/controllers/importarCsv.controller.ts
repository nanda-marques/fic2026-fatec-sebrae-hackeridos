import type { Request, Response } from "express";
import { importarCSVAnimais } from "../services/importarCsv.service.js";

export const importarCsvController = {
  async importar(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ erro: "Arquivo CSV não enviado." });
      return;
    }
    const resultado = await importarCSVAnimais(req.file.buffer, req.usuario?.id ?? 0);
    res.json({
      mensagem: `Importação concluída: ${resultado.importados} importados.` +
               (resultado.erros.length ? ` Erros: ${resultado.erros.length}.` : "") +
               (resultado.ignorados ? ` Ignorados: ${resultado.ignorados}.` : ""),
      importados: resultado.importados,
      ignorados: resultado.ignorados,
      erros: resultado.erros,
    });
  },
};
