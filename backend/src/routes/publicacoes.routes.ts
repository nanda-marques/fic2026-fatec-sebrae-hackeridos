import { Router } from "express";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { exigirPermissaoConteudo } from "../middlewares/conteudo.middleware.js";
import { publicacoesController } from "../controllers/publicacoes.controller.js";

const router = Router();
router.get("/", asyncHandler(publicacoesController.listarPublicas));
router.get("/dashboard/resumo", autenticar, asyncHandler(publicacoesController.dashboard));
router.get("/admin", autenticar, exigirPermissaoConteudo, asyncHandler(publicacoesController.listarAdmin));
router.get("/admin/:id", autenticar, exigirPermissaoConteudo, asyncHandler(publicacoesController.buscarAdmin));
router.get("/:id", asyncHandler(publicacoesController.buscarPublica));
router.post("/", autenticar, exigirPermissaoConteudo, asyncHandler(publicacoesController.criar));
router.put("/:id", autenticar, exigirPermissaoConteudo, asyncHandler(publicacoesController.atualizar));
router.delete("/:id", autenticar, exigirPermissaoConteudo, asyncHandler(publicacoesController.excluir));
export default router;
