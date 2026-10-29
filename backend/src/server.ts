import "dotenv/config";
import express from "express";
import cors from "cors";

import "./models/index.js";
import { adicionarCamposComplementares } from "./models/Animal.js";
import sequelize from "./config/database.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import publicacoesRoutes from "./routes/publicacoes.routes.js";
import animaisRoutes from "./routes/animais.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";

import { tratarErros } from "./middlewares/error.middleware.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ??
  (process.env.NODE_ENV === "production" ? null : "http://localhost:5173");

if (!FRONTEND_URL) {
  console.error("\nFRONTEND_URL não definida em produção.\n");
  console.error("Adicione no .env do backend:");
  process.exit(1);
}

const frontendUrlNormalizada = FRONTEND_URL.replace(/\/$/, "");

app.use(
  cors({
    origin: frontendUrlNormalizada,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/publicacoes", publicacoesRoutes);
app.use("/api/animais", animaisRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.use(tratarErros);

sequelize
  .authenticate()
  .then(() => adicionarCamposComplementares())
  .then(() => sequelize.sync())
  .then(() => app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`)))
  .catch((err) => {
    console.error("Erro ao conectar ao banco (Aiven):", err);
    process.exit(1);
  });