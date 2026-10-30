import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";

const SECRET = "test-secret-for-tests-only";

describe("auth — JWT e validação de tokens", () => {
  it("deve criar e verificar um token JWT", () => {
    const payload = { id: 1, email: "teste@exemplo.com", cargo: "Admin" };
    const token = jwt.sign(payload, SECRET, { expiresIn: "2h" });
    const decoded = jwt.verify(token, SECRET) as typeof payload;
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe("teste@exemplo.com");
  });

  it("deve rejeitar token com assinatura incorreta", () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: "2h" });
    expect(() => jwt.verify(token, "secret-errado")).toThrow();
  });

  it("deve rejeitar token expirado", () => {
    const expiredToken = jwt.sign({ id: 1 }, SECRET, { expiresIn: "-1s" });
    expect(() => jwt.verify(expiredToken, SECRET)).toThrow();
  });
});
