import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do modelo Animal para evitar acesso ao banco real
vi.mock("../models/Animal.js", async () => {
  const mockAnimal = vi.fn();
  const MockAnimalClass = vi.fn().mockImplementation((data: any) => ({ ...data, id: Math.floor(Math.random() * 1000) })) as any;
  MockAnimalClass.findOne = vi.fn().mockResolvedValue(null);
  MockAnimalClass.create = vi.fn().mockImplementation((data: any) => Promise.resolve({ ...data, id: Math.floor(Math.random() * 1000) }));
  return { default: MockAnimalClass };
});

describe("importarCsv.service — importação CSV", () => {
  let importarCSVAnimais: (...args: any[]) => Promise<any>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../services/importarCsv.service.js");
    importarCSVAnimais = mod.importarCSVAnimais;
  });

  it("deve rejeitar arquivo vazio", async () => {
    const resultado = await importarCSVAnimais(Buffer.from(""), 1);
    expect(resultado.importados).toBe(0);
    expect(resultado.erros.length).toBeGreaterThan(0);
    expect(resultado.erros[0].motivo).toContain("vazio");
  });

  it("deve rejeitar arquivo com cabeçalhos incompletos (faltando 'especie')", async () => {
    const csv = "nome,status,porte\nLuna,Disponível,Médio\n";
    const resultado = await importarCSVAnimais(Buffer.from(csv), 1);
    expect(resultado.importados).toBe(0);
    expect(resultado.erros.some((e: any) => e.motivo.includes("Coluna obrigatória"))).toBe(true);
  });

  it("deve importar registro válido com todos os campos", async () => {
    const csv = "nome,especie,status,porte,idade,peso,castracao,temperamento,raca,sobre,vacinacaoemdia\nThor,Canino,Disponível,Grande,3,15.2,Castrado,Dócil,Pitbull,Calmo,true\n";
    const resultado = await importarCSVAnimais(Buffer.from(csv), 1);
    expect(resultado.importados).toBe(1);
    expect(resultado.erros.length).toBe(0);
  });

  it("deve reportar erro para idade negativa", async () => {
    const csv = "nome,especie,status,porte,idade\nThor,Canino,Disponível,Grande,-1\n";
    const resultado = await importarCSVAnimais(Buffer.from(csv), 1);
    expect(resultado.importados).toBe(0);
    expect(resultado.erros.length).toBeGreaterThan(0);
    expect(resultado.erros[0].motivo).toContain("Idade");
  });

  it("deve reportar erro para peso negativo", async () => {
    const csv = "nome,especie,status,porte,peso\nThor,Canino,Disponível,Grande,-5\n";
    const resultado = await importarCSVAnimais(Buffer.from(csv), 1);
    expect(resultado.importados).toBe(0);
    expect(resultado.erros.length).toBeGreaterThan(0);
    expect(resultado.erros[0].motivo).toContain("Peso");
  });

  it("deve ignorar linhas vazias após registro válido", async () => {
    const csv = "nome,especie,status,porte\nLuna,Canino,Disponível,Médio\n\n";
    const resultado = await importarCSVAnimais(Buffer.from(csv), 1);
    expect(resultado.importados).toBe(1);
    expect(resultado.ignorados).toBeGreaterThanOrEqual(0);
  });
});
