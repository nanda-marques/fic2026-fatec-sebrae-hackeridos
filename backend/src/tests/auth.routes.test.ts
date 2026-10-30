import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../controllers/auth.controller.js", () => ({
  authController: {
    cadastrar: (_req: any, res: any) => res.status(201).json({ ok: true }),
    login: (_req: any, res: any) => res.status(200).json({ token: "mock-jwt" }),
    me: (_req: any, res: any) => res.status(200).json({ usuario: { id: 1, email: "test@test.com" } }),
  },
}));

vi.mock("../middlewares/auth.middleware.js", () => ({
  autenticar: (req: any, res: any, next: any) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ mensagem: "Token não fornecido." });
    }
    req.usuario = { id: 1, email: "test@test.com", cargo: "Admin" };
    next();
  },
  obterJwtSecret: () => "test-secret",
}));

vi.mock("../middlewares/upload.middleware.js", () => ({
  upload: { single: () => (_req: any, _res: any, next: any) => next() },
}));

vi.mock("../middlewares/rateLimit.middleware.js", () => ({
  cadastroRateLimit: (_req: any, _res: any, next: any) => next(),
  loginRateLimit: (_req: any, _res: any, next: any) => next(),
}));

describe("auth.routes — autenticação e rotas protegidas", () => {
  const app = express();
  app.use(express.json());

  // Importa rotas após mock
  beforeAll(async () => {
    const authRoutes = (await import("../routes/auth.routes.js")).default;
    app.use("/api/auth", authRoutes);
  });

  it("POST /api/auth/login retorna token", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com", senha: "12345678" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBe("mock-jwt");
  });

  it("GET /api/auth/me retorna usuário quando autenticado", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer token");
    expect(res.status).toBe(200);
    expect(res.body.usuario.id).toBe(1);
  });

  it("GET /api/auth/me rejeita sem token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/cadastro retorna 201", async () => {
    const res = await request(app).post("/api/auth/cadastro").send({ nome: "João", sobrenome: "Silva", email: "joao@teste.com", cargo: "Comunicação e Marketing", senha: "12345678" });
    expect(res.status).toBe(201);
  });
});
