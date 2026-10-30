import { describe, it, expect } from "vitest";
import { validarAnimal } from "../services/animais.service.js";

describe("animais.service — validarAnimal (cenários completos)", () => {
  it("deve aceitar dados mínimos válidos", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", porte: "Grande" })).toBeNull();
  });

  it("deve rejeitar objeto vazio", () => {
    expect(validarAnimal({})).not.toBeNull();
  });

  it("deve rejeitar nome vazio", () => {
    expect(validarAnimal({ nome: "", especie: "Canino", status: "Disponível" })).not.toBeNull();
  });

  it("deve rejeitar espécie vazia", () => {
    expect(validarAnimal({ nome: "Thor", especie: "", status: "Disponível" })).not.toBeNull();
  });

  it("deve rejeitar idade negativa", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", idade: -1 })).not.toBeNull();
  });

  it("deve rejeitar idade decimal", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", idade: 2.5 })).not.toBeNull();
  });

  it("deve rejeitar idade não numérica", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", idade: "velho" } as any)).not.toBeNull();
  });

  it("deve rejeitar peso negativo", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", peso: -1 })).not.toBeNull();
  });

  it("deve rejeitar peso não numérico", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", peso: "pesado" } as any)).not.toBeNull();
  });

  it("deve rejeitar sexo inválido", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", sexo: "Outro" })).not.toBeNull();
  });

  it("deve aceitar sexo válido 'Macho'", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", sexo: "Macho" })).toBeNull();
  });

  it("deve aceitar sexo válido 'Fêmea'", () => {
    expect(validarAnimal({ nome: "Luna", especie: "Canino", status: "Disponível", sexo: "Fêmea" })).toBeNull();
  });

  it("deve rejeitar URL de imagem inválida", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", imagem: "imagem.jpg" })).not.toBeNull();
  });

  it("deve aceitar URL válida", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", imagem: "https://exemplo.com/foto.jpg" })).toBeNull();
  });

  it("deve rejeitar campo de newsletter não booleano", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", dispararNewsletter: "sim" } as any)).not.toBeNull();
  });

  it("deve aceitar newsletter como booleano verdadeiro", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", dispararNewsletter: true })).toBeNull();
  });

  it("deve rejeitar situação de saúde com mais de 500 caracteres", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", situacaoSaude: "a".repeat(501) })).not.toBeNull();
  });

  it("deve aceitar situação de saúde válida", () => {
    expect(validarAnimal({ nome: "Thor", especie: "Canino", status: "Disponível", situacaoSaude: "Saudável." })).toBeNull();
  });

  it("deve aceitar atualização parcial sem alterar nome", () => {
    expect(validarAnimal({ idade: 4 }, true)).toBeNull();
  });

  it("deve rejeitar atualização parcial com idade inválida", () => {
    expect(validarAnimal({ idade: -3 }, true)).not.toBeNull();
  });
});
