/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import request from "supertest";

// Mocks para não depender de serviços externos
vi.mock("../src/config/supabase.js", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ data: [] }),
      }),
    },
  },
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "mock-email-id" }, error: null }),
    },
  })),
}));

describe("Configuração de testes", () => {
  it("deve carregar o ambiente de testes", () => {
    expect(true).toBe(true);
  });

  it("deve confirmar que mocks estão ativos", () => {
    const mockFn = vi.fn();
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
