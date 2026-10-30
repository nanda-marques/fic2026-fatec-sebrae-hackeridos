import { Router } from "express";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { exigirPermissaoAnimais } from "../middlewares/conteudo.middleware.js";
import { animaisController } from "../controllers/animais.controller.js";
import { importarCsvController } from "../controllers/importarCsv.controller.js";
import multer from "multer";

const uploadCsv = multer({ storage: multer.memoryStorage() });

const router = Router();
router.get("/publicos", asyncHandler(animaisController.listarPublicos));
router.get("/", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.listar));
router.get("/:id", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.buscar));
router.post("/", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.criar));
router.put("/:id", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.atualizar));
router.get("/resumo", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.resumo));
router.delete("/:id", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.excluir));
router.post("/importar-csv", autenticar, exigirPermissaoAnimais, uploadCsv.single("file"), asyncHandler(importarCsvController.importar));
export default router;
