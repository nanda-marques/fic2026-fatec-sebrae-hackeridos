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
  "sexo",
  "situacaoSaude",
  "prioridadeApadrinhamento",
] as const;

/** Valores aceitos para `sexo`. Ajuste se o domínio mudar. */
const SEXOS_VALIDOS = ["Macho", "Fêmea"] as const;
type Sexo = (typeof SEXOS_VALIDOS)[number];

function lerCSV(texto: string): { cabecalho: string[]; linhas: string[][] } {
  const conteudo = texto.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const primeiraLinha = conteudo.split("\n", 1)[0] ?? "";
  const contadores = { ";": 0, ",": 0, "\t": 0 };
  let aspas = false;

  for (const caractere of primeiraLinha) {
    if (caractere === '"') aspas = !aspas;
    else if (!aspas && caractere in contadores) contadores[caractere as keyof typeof contadores]++;
  }

  const delimitador = contadores[";"] >= contadores[","] && contadores[";"] >= contadores["\t"]
    ? ";"
    : contadores[","] >= contadores["\t"] ? "," : "\t";

  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  aspas = false;

  for (let i = 0; i < conteudo.length; i++) {
    const caractere = conteudo[i];
    if (caractere === '"') {
      if (aspas && conteudo[i + 1] === '"') {
        campo += '"';
        i++;
      } else {
        aspas = !aspas;
      }
    } else if (caractere === delimitador && !aspas) {
      linha.push(campo);
      campo = "";
    } else if (caractere === "\n" && !aspas) {
      linha.push(campo);
      if (linha.some((valor) => valor.trim())) linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += caractere;
    }
  }

  linha.push(campo);
  if (linha.some((valor) => valor.trim())) linhas.push(linha);
  if (linhas.length === 0) return { cabecalho: [], linhas: [] };

  return { cabecalho: linhas[0].map((valor) => valor.trim()), linhas: linhas.slice(1) };
}

function normalizarCabecalho(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]/g, "");
}

function valorBooleano(valor: string | undefined): boolean {
  const texto = valor?.trim().toLocaleLowerCase("pt-BR") ?? "";
  return ["1", "true", "sim", "s", "yes", "x"].includes(texto);
}

function valorOpcional(valor: string | undefined): string | null {
  const texto = valor?.trim() ?? "";
  return texto || null;
}

function valorInteiro(valor: string | undefined): number | null {
  const texto = valor?.trim();
  if (!texto) return null;
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);
  return Number.isInteger(numero) ? numero : Number.NaN;
}

function valorDecimal(valor: string | undefined): number | null {
  const texto = valor?.trim();
  if (!texto) return null;
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : Number.NaN;
}

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
  async listarPublicos() {
    const animais = await Animal.findAll({
      where: { status: "Disponível" },
      attributes: [...CAMPOS_PUBLICOS],
      order: [["criadoEm", "DESC"]],
    });

    return animais.map((animal) => {
      const dados = animal.toJSON();

      return {
        id: dados.id,
        especie: dados.especie,
        status: dados.status,
        nome: dados.nome,
        idade: dados.idade,
        porte: dados.porte,
        raca: dados.raca,
        peso: dados.peso,
        castracao: dados.castracao,
        vacinacaoEmDia: dados.vacinacaoEmDia,
        imagem: dados.imagem,
        temperamento: dados.temperamento,
        sobre: dados.sobre,
        criadoEm: dados.criadoEm,
        sexo: dados.sexo?.trim() || null,
        situacaoSaude: dados.situacaoSaude?.trim() || null,
        prioridadeApadrinhamento: dados.prioridadeApadrinhamento ?? false,
      };
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

  async importarCSV(buffer: Buffer, criadoPor: number) {
    const { cabecalho, linhas } = lerCSV(buffer.toString("utf8"));
    if (cabecalho.length === 0 || linhas.length === 0) {
      throw new AnimalServiceError(400, "O arquivo CSV está vazio ou não possui dados.");
    }

    const colunas = new Map<string, number>();
    cabecalho.forEach((titulo, indice) => {
      colunas.set(normalizarCabecalho(titulo), indice);
    });

    const obter = (linha: string[], ...nomes: string[]): string | undefined => {
      for (const nome of nomes) {
        const indice = colunas.get(normalizarCabecalho(nome));
        if (indice !== undefined) return linha[indice]?.trim();
      }
      return undefined;
    };

    let importados = 0;
    let ignorados = 0;
    const erros: string[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      const nome = obter(linha, "nome");
      const especie = obter(linha, "especie", "espécie", "tipo");
      if (!nome || !especie) {
        ignorados++;
        erros.push(`Linha ${i + 2}: nome e espécie são obrigatórios.`);
        continue;
      }

      const idade = valorInteiro(obter(linha, "idade", "anos"));
      const peso = valorDecimal(obter(linha, "peso"));
      if (Number.isNaN(idade) || Number.isNaN(peso)) {
        ignorados++;
        erros.push(`Linha ${i + 2}: idade ou peso inválido.`);
        continue;
      }

      const sexoInformado = valorOpcional(obter(linha, "sexo"));
      let sexo: string | null = sexoInformado;
      if (sexoInformado) {
        const sexoNormalizado = sexoInformado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
        sexo = sexoNormalizado === "m" || sexoNormalizado === "macho"
          ? "Macho"
          : sexoNormalizado === "f" || sexoNormalizado === "femea"
            ? "Fêmea"
            : sexoInformado;
      }

      const dados: AnimalInput = {
        nome,
        especie,
        status: valorOpcional(obter(linha, "status")) ?? "Disponível",
        idade,
        porte: valorOpcional(obter(linha, "porte")),
        raca: valorOpcional(obter(linha, "raca", "raça")),
        peso,
        castracao: valorOpcional(obter(linha, "castracao", "castração")),
        vacinacaoEmDia: valorBooleano(obter(linha, "vacinacaoEmDia", "vacinacao_em_dia", "vacinação em dia", "vacinado")),
        imagem: valorOpcional(obter(linha, "imagem", "foto")),
        temperamento: valorOpcional(obter(linha, "temperamento")),
        sobre: valorOpcional(obter(linha, "sobre", "descricao", "descrição")),
        dispararNewsletter: valorBooleano(obter(linha, "dispararNewsletter", "disparar_newsletter")),
        sexo,
        situacaoSaude: valorOpcional(obter(linha, "situacaoSaude", "situacao_saude", "situação de saúde", "situacaoSaude")),
        prioridadeApadrinhamento: valorBooleano(obter(linha, "prioridadeApadrinhamento", "prioridade_apadrinhamento", "prioridade para apadrinhamento")),
      };

      try {
        await this.criar(dados, criadoPor);
        importados++;
      } catch (erro) {
        ignorados++;
        erros.push(
          `Linha ${i + 2}: ${erro instanceof Error ? erro.message : "dados inválidos."}`
        );
      }
    }

    return { importados, ignorados, erros };
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

  async resumo() {
    const total = await Animal.count();
    const disponiveis = await Animal.count({ where: { status: "Disponível" } });
    const adotados = await Animal.count({ where: { status: "Adotado" } });
    const vacinacaoDia = await Animal.count({ where: { vacinacaoEmDia: true } });
    const vacinacaoNaoDia = await Animal.count({ where: { vacinacaoEmDia: false } });
    const castrado = await Animal.count({ where: { castracao: "Castrado" } });
    const castradoA = await Animal.count({ where: { castracao: "Castrado(a)" } });
    const totalCastrados = castrado + castradoA;
    const pendente = await Animal.count({ where: { castracao: "Pendente" } });
    const agendada = await Animal.count({ where: { castracao: "Agendada" } });
    const naoInformado = await Animal.count({ where: { castracao: "Não informado" } });
    return {
      total,
      disponiveis,
      adotados,
      vacinacao: { dia: vacinacaoDia, naoDia: vacinacaoNaoDia },
      castracao: {
        castrado: totalCastrados,
        pendente,
        agendada,
        naoInformado,
      },
    };
  },
};