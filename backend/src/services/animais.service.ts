import Animal from "../models/Animal.js";
import { ConteudoNewsletter } from "../models/ConteudoNewsletter.js";
import { verificarEDispararNewsletter } from "./newsletter.service.js";

import type { AnimalInput } from "../types/animal.js";

export class AnimalServiceError extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
  }
}

const CAMPOS_PUBLICOS = [
  "id",
  "especie",
  "status",
  "nome",
  "idade",
  "porte",
  "raca",
  "peso",
  "castracao",
  "vacinacaoEmDia",
  "imagem",
  "temperamento",
  "sobre",
  "criadoEm",
] as const;

/** Valores aceitos para `sexo`. Ajuste se o domínio mudar. */
const SEXOS_VALIDOS = ["Macho", "Fêmea"] as const;
type Sexo = (typeof SEXOS_VALIDOS)[number];

export function validarAnimal(
  dados: Partial<AnimalInput> | undefined,
  parcial = false
): string | null {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return "Dados do animal inválidos.";
  }

  if (!parcial && (typeof dados.nome !== "string" || !dados.nome.trim())) {
    return "O nome do animal é obrigatório.";
  }

  if (!parcial && (typeof dados.especie !== "string" || !dados.especie.trim())) {
    return "A espécie é obrigatória.";
  }

  for (const [campo, valor, limite] of [
    ["nome", dados.nome, 255],
    ["espécie", dados.especie, 50],
    ["status", dados.status, 50],
    ["porte", dados.porte, 50],
    ["raça", dados.raca, 255],
    ["castração", dados.castracao, 50],
    ["temperamento", dados.temperamento, 255],
    ["sexo", dados.sexo, 20],
  ] as const) {
    if (valor === undefined) continue;

    if (
      (campo === "nome" || campo === "espécie" || campo === "status") &&
      (typeof valor !== "string" || !valor.trim())
    ) {
      return `O campo ${campo} é obrigatório.`;
    }

    if (valor !== null && (typeof valor !== "string" || valor.length > limite)) {
      return `O campo ${campo} é inválido.`;
    }
  }

  if (
    dados.idade !== undefined &&
    dados.idade !== null &&
    (!Number.isInteger(dados.idade) || dados.idade < 0)
  ) {
    return "A idade deve ser um número inteiro igual ou maior que zero.";
  }

  if (dados.dispararNewsletter !== undefined && typeof dados.dispararNewsletter !== "boolean") {
    return "O campo de newsletter deve ser verdadeiro ou falso.";
  }

  if (dados.vacinacaoEmDia !== undefined && typeof dados.vacinacaoEmDia !== "boolean") {
    return "O campo de vacinação em dia deve ser verdadeiro ou falso.";
  }

  if (
    dados.prioridadeApadrinhamento !== undefined &&
    typeof dados.prioridadeApadrinhamento !== "boolean"
  ) {
    return "O campo de prioridade para apadrinhamento deve ser verdadeiro ou falso.";
  }

  if (dados.sexo !== undefined && dados.sexo !== null) {
    if (typeof dados.sexo !== "string") {
      return "O campo sexo é inválido.";
    }
    if (!SEXOS_VALIDOS.includes(dados.sexo as Sexo)) {
      return `O sexo deve ser ${SEXOS_VALIDOS.map((s) => `"${s}"`).join(" ou ")}.`;
    }
  }

  if (
    dados.situacaoSaude !== undefined &&
    dados.situacaoSaude !== null &&
    (typeof dados.situacaoSaude !== "string" || dados.situacaoSaude.length > 500)
  ) {
    return "O campo de situação de saúde deve ser um texto de até 500 caracteres.";
  }

  if (
    dados.imagem !== undefined &&
    dados.imagem !== null &&
    (typeof dados.imagem !== "string" ||
      dados.imagem.length > 500 ||
      !/^https?:\/\/\S+$/i.test(dados.imagem))
  ) {
    return "URL da imagem inválida.";
  }

  if (
    dados.peso !== undefined &&
    dados.peso !== null &&
    (typeof dados.peso !== "number" ||
      !Number.isFinite(dados.peso) ||
      dados.peso < 0 ||
      dados.peso > 9999.99)
  ) {
    return "O peso deve ser um número entre 0 e 9999,99 kg.";
  }

  if (dados.sobre !== undefined && dados.sobre !== null && typeof dados.sobre !== "string") {
    return "O campo sobre deve ser um texto.";
  }

  return null;
}

export const animaisService = {
  listarPublicos() {
    return Animal.findAll({
      where: { status: "Disponível" },
      attributes: [...CAMPOS_PUBLICOS],
      order: [["criadoEm", "DESC"]],
    });
  },

  listar() {
    return Animal.findAll({ order: [["criadoEm", "DESC"]] });
  },

  async buscar(id: number) {
    const animal = await Animal.findByPk(id);

    if (!animal) throw new AnimalServiceError(404, "Animal não encontrado.");

    return animal;
  },

  async criar(dados: AnimalInput | undefined, criadoPor: number) {
    const erro = validarAnimal(dados);
    if (erro) throw new AnimalServiceError(400, erro);

    const novoAnimal = await Animal.create({
      nome: dados!.nome!.trim(),
      especie: dados!.especie!.trim(),
      status: dados!.status?.trim() || "Disponível",
      idade: dados!.idade ?? null,
      porte: dados!.porte ?? null,
      raca: dados!.raca ?? null,
      peso: dados!.peso == null ? null : Number(dados!.peso),
      castracao: dados!.castracao ?? null,
      vacinacaoEmDia: dados!.vacinacaoEmDia ?? false,
      imagem: dados!.imagem ?? null,
      temperamento: dados!.temperamento ?? null,
      sobre: dados!.sobre ?? null,
      dispararNewsletter: dados!.dispararNewsletter ?? false,
      sexo: dados!.sexo ?? undefined,
      situacaoSaude: dados!.situacaoSaude?.trim() || undefined,
      prioridadeApadrinhamento: dados!.prioridadeApadrinhamento ?? false,
      criadoPor,
    });

    if (novoAnimal.dispararNewsletter) {
      const jaExiste = await ConteudoNewsletter.findOne({
        where: { animal_id: novoAnimal.id, status: "pendente" },
      });

      if (!jaExiste) {
        await ConteudoNewsletter.create({
          animal_id: novoAnimal.id,
          status: "pendente",
          adicionado_em: new Date(),
        });
        await verificarEDispararNewsletter();
      }
    }

    return novoAnimal;
  },

  async atualizar(id: number, dados: Partial<AnimalInput> | undefined) {
    const animal = await this.buscar(id);

    const erro = validarAnimal(dados, true);
    if (erro) throw new AnimalServiceError(400, erro);

    const estavaMarcadoAntes = Boolean(animal.dispararNewsletter);

    const atualizacao: Partial<AnimalInput> = {};

    for (const campo of [
      "nome",
      "especie",
      "status",
      "idade",
      "porte",
      "raca",
      "peso",
      "castracao",
      "vacinacaoEmDia",
      "imagem",
      "temperamento",
      "sobre",
      "dispararNewsletter",
      "sexo",
      "situacaoSaude",
      "prioridadeApadrinhamento",
    ] as const) {
      if (dados && Object.hasOwn(dados, campo)) {
        const valor = dados[campo];
        Object.assign(atualizacao, {
          [campo]: typeof valor === "string" ? valor.trim() || null : valor,
        });
      }
    }

    await animal.update(
      atualizacao as unknown as Parameters<typeof animal.update>[0]
    );
    await animal.reload();

    const estaMarcadoAgora = Boolean(animal.dispararNewsletter);

    if (!estaMarcadoAgora && estavaMarcadoAntes) {
      await ConteudoNewsletter.destroy({
        where: {
          animal_id: animal.id,
          status: "pendente",
        },
      });
    }

    if (estaMarcadoAgora && !estavaMarcadoAntes) {
      const jaExiste = await ConteudoNewsletter.findOne({
        where: { animal_id: animal.id, status: "pendente" },
      });

      if (!jaExiste) {
        await ConteudoNewsletter.create({
          animal_id: animal.id,
          status: "pendente",
          adicionado_em: new Date(),
        });
        await verificarEDispararNewsletter();
      }
    }

    return animal;
  },

  async excluir(id: number) {
    const animal = await this.buscar(id);
    await animal.destroy();
  },
};