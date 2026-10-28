import { Router } from "express";

import { autenticar } from "../middlewares/auth.middleware.js";
import { exigirPermissaoGerenciarAdmins } from "../middlewares/admin.middleware.js";
import { adminController } from "../controllers/admin.controller.js";

const router = Router();

// perfil
router.get("/me", autenticar, adminController.buscarPerfil);
router.put("/me", autenticar, adminController.atualizarPerfil);
router.put("/senha", autenticar, adminController.alterarSenha);

// gestão
router.get(
  "/pendentes",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  adminController.listarPendentes
);
router.patch(
  "/:id/aprovar",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  adminController.aprovar
);
router.patch(
  "/:id/rejeitar",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  adminController.rejeitar
);

// histórico
router.get(
  "/historico-solicitacoes",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  adminController.listarHistorico
);

export default router;