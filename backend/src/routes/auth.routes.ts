import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";

import { asyncHandler } from "../middlewares/error.middleware.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";  
import { loginRateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/cadastro", upload.single("foto"), asyncHandler(authController.cadastrar));
router.get("/me", autenticar, asyncHandler(authController.me));
router.post("/login", loginRateLimit, asyncHandler(authController.login));

export default router;