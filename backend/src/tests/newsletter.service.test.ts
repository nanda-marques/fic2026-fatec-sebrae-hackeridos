import { describe, it, expect, vi } from "vitest";

vi.mock("../models/ConteudoNewsletter.js", () => ({
  ConteudoNewsletter: {
    findAll: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    update: vi.fn().mockResolvedValue([0]),
  },
}));

vi.mock("../models/Animal.js", () => ({
  default: {
    findAll: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../models/Publicacao.js", () => ({
  default: {
    findAll: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../models/InscritoNewsletter.js", () => ({
  InscritoNewsletter: {
    findAll: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "news-id" }, error: null }),
    },
  })),
}));

describe("newsletter.service — comportamentos principais", () => {
  it("deve retornar 0 enviados quando não há inscritos ativos", async () => {
    const { InscritoNewsletter } = await import("../models/InscritoNewsletter.js");
    (InscritoNewsletter.findAll as any).mockResolvedValueOnce([]);
    const { newsletterService } = await import("../services/newsletter.service.js");
    const result = await newsletterService.dispararNewsletterSemanal();
    expect(result.enviados).toBe(0);
  });

  it("deve cancelar inscrição de e-mail existente", async () => {
    const { InscritoNewsletter } = await import("../models/InscritoNewsletter.js");
    const mockInscrito = { ativo: true, save: vi.fn().mockResolvedValue(true) };
    (InscritoNewsletter.findOne as any).mockResolvedValueOnce(mockInscrito);
    const { newsletterService } = await import("../services/newsletter.service.js");
    const result = await newsletterService.descadastrarInscrito("teste@test.com");
    expect(mockInscrito.ativo).toBe(false);
    expect(result.mensagem).toContain("cancelada");
  });

  it("deve rejeitar cancelamento de e-mail inexistente", async () => {
    const { InscritoNewsletter } = await import("../models/InscritoNewsletter.js");
    (InscritoNewsletter.findOne as any).mockResolvedValueOnce(null);
    const { newsletterService } = await import("../services/newsletter.service.js");
    await expect(newsletterService.descadastrarInscrito("inexistente@test.com")).rejects.toThrow("não encontrado");
  });
});
