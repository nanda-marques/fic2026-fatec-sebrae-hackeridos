import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { autenticar } from "../middlewares/auth.middleware.js";   
import { asyncHandler } from "../middlewares/error.middleware.js";
import { uploadController } from "../controllers/upload.controller.js";
import {
  exigirPermissaoAnimais,
  exigirPermissaoConteudo,
} from "../middlewares/conteudo.middleware.js";

const router = Router();

router.post(
  "/perfil",
  autenticar,                      
  upload.single("foto"),
  asyncHandler(uploadController.uploadPerfil)
);

router.post(
  "/publicacao",
  autenticar,
  exigirPermissaoConteudo,
  upload.single("imagem"),
  asyncHandler(uploadController.uploadImagemPublicacao)
);

router.post(
  "/animal",
  autenticar,
  exigirPermissaoAnimais,
  upload.single("imagem"),
  asyncHandler(uploadController.uploadImagemAnimal)
);

router.get(
  "/foto-privada",
  autenticar,
  asyncHandler(uploadController.signedUrl)
);
export default router;