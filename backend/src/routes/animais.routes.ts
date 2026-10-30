import { Router } from "express";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { exigirPermissaoAnimais } from "../middlewares/conteudo.middleware.js";
import { animaisController } from "../controllers/animais.controller.js";
import { uploadCSV } from "../middlewares/upload.js";

const router = Router();
router.get("/publicos", asyncHandler(animaisController.listarPublicos));
router.post("/importar-csv", autenticar, exigirPermissaoAnimais, uploadCSV.single("file"), asyncHandler(animaisController.importarCSV));
router.get("/", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.listar));
router.get("/:id", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.buscar));
router.post("/", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.criar));
router.put("/:id", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.atualizar));
router.get("/resumo", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.resumo));
router.delete("/:id", autenticar, exigirPermissaoAnimais, asyncHandler(animaisController.excluir));
export default router;
