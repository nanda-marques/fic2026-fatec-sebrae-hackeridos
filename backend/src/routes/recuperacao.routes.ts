import { Router } from "express";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { recuperacaoController } from "../controllers/recuperacao.controller.js";
import { recuperacaoRateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/solicitar", recuperacaoRateLimit, asyncHandler(recuperacaoController.solicitar));
router.post("/redefinir", asyncHandler(recuperacaoController.redefinir));

export default router;
