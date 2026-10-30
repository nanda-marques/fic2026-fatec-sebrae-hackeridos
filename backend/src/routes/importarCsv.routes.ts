import { Router } from "express";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { exigirPermissaoAnimais } from "../middlewares/conteudo.middleware.js";
import { importarCsvController } from "../controllers/importarCsv.controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.post("/importar-csv", autenticar, exigirPermissaoAnimais, upload.single("file"), asyncHandler(importarCsvController.importar));

export default router;
