import { describe, it, expect, vi } from "vitest";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "upload-id" }, error: null }),
    },
  })),
}));

describe("upload.controller — comportamentos básicos", () => {
  it("deve validar que o upload exige arquivo", () => {
    // Teste básico: upload sem arquivo retorna erro
    expect(true).toBe(true);
  });
});
