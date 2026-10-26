import { Router } from "express";
import type { Request, Response } from "express";

import { autenticar } from "../middlewares/auth.middleware.js";
import {
  asyncHandler,
} from "../middlewares/error.middleware.js";
import { exigirPermissaoAnimais } from "../middlewares/conteudo.middleware.js";
import Animal from "../models/Animal.js";
import type { AnimalInput } from "../types/animal.js";

const router = Router();

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

function validar(
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
  ] as const) {
    if (valor === undefined) continue;
    if (
      (campo === "nome" || campo === "espécie" || campo === "status") &&
      (typeof valor !== "string" || !valor.trim())
    ) {
      return `O campo ${campo} é obrigatório.`;
    }
    if (
      valor !== null &&
      (typeof valor !== "string" || valor.length > limite)
    ) {
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

  if (
    dados.dispararNewsletter !== undefined &&
    typeof dados.dispararNewsletter !== "boolean"
  ) {
    return "O campo de newsletter deve ser verdadeiro ou falso.";
  }

  if (
    dados.vacinacaoEmDia !== undefined &&
    typeof dados.vacinacaoEmDia !== "boolean"
  ) {
    return "O campo de vacinação em dia deve ser verdadeiro ou falso.";
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

  if (
    dados.sobre !== undefined &&
    dados.sobre !== null &&
    typeof dados.sobre !== "string"
  ) {
    return "O campo sobre deve ser um texto.";
  }

  return null;
}

function obterId(req: Request, res: Response): number | null {
  const id = req.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    res.status(400).json({ erro: "ID do animal inválido." });
    return null;
  }
  return Number(id);
}

router.get(
  "/publicos",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const animais = await Animal.findAll({
      where: { status: "Disponível" },
      attributes: [...CAMPOS_PUBLICOS],
      order: [["criadoEm", "DESC"]],
    });
    res.json(animais);
  })
);

router.get(
  "/",
  autenticar,
  exigirPermissaoAnimais,
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const animais = await Animal.findAll({ order: [["criadoEm", "DESC"]] });
    res.json(animais);
  })
);

router.get(
  "/:id",
  autenticar,
  exigirPermissaoAnimais,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = obterId(req, res);
    if (id === null) return;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      res.status(404).json({ erro: "Animal não encontrado." });
      return;
    }
    res.json(animal);
  })
);

router.post(
  "/",
  autenticar,
  exigirPermissaoAnimais,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dados = req.body as AnimalInput | undefined;
    const erro = validar(dados);
    if (erro) {
      res.status(400).json({ erro });
      return;
    }

    const animal = await Animal.create({
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
      criadoPor: req.usuario!.id,
    });
    res.status(201).json(animal);
  })
);

router.put(
  "/:id",
  autenticar,
  exigirPermissaoAnimais,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = obterId(req, res);
    if (id === null) return;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      res.status(404).json({ erro: "Animal não encontrado." });
      return;
    }

    const dados = req.body as Partial<AnimalInput> | undefined;
    const erro = validar(dados, true);
    if (erro) {
      res.status(400).json({ erro });
      return;
    }

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
    ] as const) {
      if (dados && Object.hasOwn(dados, campo)) {
        const valor = dados[campo];
        if (typeof valor === "string") {
          Object.assign(atualizacao, { [campo]: valor.trim() || null });
        } else {
          Object.assign(atualizacao, { [campo]: valor });
        }
      }
    }

    await animal.update(atualizacao);
    res.json(animal);
  })
);

router.delete(
  "/:id",
  autenticar,
  exigirPermissaoAnimais,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = obterId(req, res);
    if (id === null) return;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      res.status(404).json({ erro: "Animal não encontrado." });
      return;
    }

    await animal.destroy();
    res.status(204).end();
  })
);

export default router;
