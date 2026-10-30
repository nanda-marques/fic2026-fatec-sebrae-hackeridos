import { describe, it, expect } from "vitest";

const CATEGORIAS_VALIDAS = ["noticia", "evento", "campanha", "publicacao"];
const STATUS_VALIDOS = ["rascunho", "publicado", "agendado", "arquivado"];

function validar(dados: any, parcial = false): string | null {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return "Dados inválidos.";
  if (!parcial && (!dados.titulo || typeof dados.titulo !== "string" || !dados.titulo.trim())) return "Título obrigatório.";
  if (!parcial && (!dados.categoria || typeof dados.categoria !== "string")) return "Categoria obrigatória.";
  if (dados.categoria !== undefined && !CATEGORIAS_VALIDAS.includes(dados.categoria)) return "Categoria inválida.";
  if (dados.titulo !== undefined && (typeof dados.titulo !== "string" || dados.titulo.length > 255 || !dados.titulo.trim())) return "Título deve ter entre 1 e 255 caracteres.";
  if (dados.status !== undefined && !STATUS_VALIDOS.includes(dados.status)) return "Status inválido.";
  return null;
}

describe("publicacoes.service — validação de dados", () => {
  it("deve rejeitar título vazio em cadastro completo", () => {
    expect(validar({ categoria: "noticia" }, false)).not.toBeNull();
  });

  it("deve rejeitar categoria inexistente", () => {
    expect(validar({ titulo: "Teste", categoria: "invalida" }, false)).not.toBeNull();
  });

  it("deve aceitar dados mínimos válidos", () => {
    expect(validar({ titulo: "Evento de adoção", categoria: "evento" }, false)).toBeNull();
  });

  it("deve aceitar atualização parcial com status", () => {
    expect(validar({ status: "publicado" }, true)).toBeNull();
  });

  it("deve rejeitar status inválido", () => {
    expect(validar({ status: "apagado" }, true)).not.toBeNull();
  });

  it("deve rejeitar título com mais de 255 caracteres", () => {
    const longo = "a".repeat(256);
    expect(validar({ titulo: longo, categoria: "campanha" }, false)).not.toBeNull();
  });
});
