import { describe, it, expect, vi, beforeEach } from "vitest";
import { recuperacaoService, configurarResend } from "../services/recuperacao.service.js";

// Mock dos modelos
vi.mock("../models/TokenRecuperacao.js", () => ({
  default: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../models/Administrador.js", () => ({
  default: {
    findOne: vi.fn(),
    update: vi.fn(),
  },
}));

describe("recuperacao.service — com mock de cliente injetado", () => {
  beforeEach(() => {
    // Injeta cliente mock diretamente no serviço
    configurarResend({
      emails: {
        send: vi.fn().mockResolvedValue({ data: { id: "email-id" }, error: null }),
      },
    } as any);
  });

  it("deve retornar enviado:false quando e-mail não existe", async () => {
    const { default: AdminMock } = await import("../models/Administrador.js");
    (AdminMock.findOne as any).mockResolvedValueOnce(null);
    const result = await recuperacaoService.solicitarRecuperacao("inexistente@test.com");
    expect(result.enviado).toBe(false);
  });

  it("deve validar token válido e não expirado", async () => {
    const { default: TokenMock } = await import("../models/TokenRecuperacao.js");
    const bcrypt = await import("bcryptjs");
    const tokenHash = await bcrypt.default.hash("token123", 10);
    (TokenMock.findAll as any).mockResolvedValueOnce([
      { adminId: 1, tokenHash, expiraEm: new Date(Date.now() + 3600000), usado: false, update: vi.fn().mockResolvedValue(true) },
    ]);
    const result = await recuperacaoService.validarToken("token123");
    expect(result.valido).toBe(true);
    expect(result.adminId).toBe(1);
  });

  it("deve rejeitar token expirado", async () => {
    const { default: TokenMock } = await import("../models/TokenRecuperacao.js");
    const bcrypt = await import("bcryptjs");
    const tokenHash = await bcrypt.default.hash("token123", 10);
    (TokenMock.findAll as any).mockResolvedValueOnce([
      { adminId: 1, tokenHash, expiraEm: new Date(Date.now() - 3600000), usado: false, update: vi.fn() },
    ]);
    const result = await recuperacaoService.validarToken("token123");
    expect(result.valido).toBe(false);
  });

  it("deve rejeitar token já utilizado", async () => {
    const { default: TokenMock } = await import("../models/TokenRecuperacao.js");
    (TokenMock.findAll as any).mockResolvedValueOnce([]);
    const result = await recuperacaoService.validarToken("usado");
    expect(result.valido).toBe(false);
  });

  it("deve redefinir senha com token válido", async () => {
    const { default: TokenMock } = await import("../models/TokenRecuperacao.js");
    const { default: AdminMock } = await import("../models/Administrador.js");
    const bcrypt = await import("bcryptjs");
    const tokenHash = await bcrypt.default.hash("token123", 10);
    (TokenMock.findAll as any).mockResolvedValueOnce([
      { adminId: 1, tokenHash, expiraEm: new Date(Date.now() + 3600000), usado: false, update: vi.fn().mockResolvedValue(true) },
    ]);
    (AdminMock.update as any).mockResolvedValueOnce([1]);
    const ok = await recuperacaoService.redefinirSenha("token123", "novaSenhaForte");
    expect(ok).toBe(true);
  });

  it("deve rejeitar redefinição com token inválido", async () => {
    const { default: TokenMock } = await import("../models/TokenRecuperacao.js");
    (TokenMock.findAll as any).mockResolvedValueOnce([]);
    const ok = await recuperacaoService.redefinirSenha("invalido", "novaSenhaForte");
    expect(ok).toBe(false);
  });
});
