import Animal from "../models/Animal.js";
import { validarAnimal } from "./animais.service.js";

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function headerToKey(header: string): string | null {
  const map: Record<string, string> = {
    nome: "nome",
    "nome do animal": "nome",
    especie: "especie",
    "espécie": "especie",
    status: "status",
    porte: "porte",
    idade: "idade",
    peso: "peso",
    castracao: "castracao",
    "castração": "castracao",
    temperamento: "temperamento",
    raca: "raca",
    "raça": "raca",
    sobre: "sobre",
    vacinacaoemdia: "vacinacaoEmDia",
    "vacinação em dia": "vacinacaoEmDia",
  };
  return map[header.toLowerCase()] ?? null;
}

export interface ResultadoImportacao {
  importados: number;
  ignorados: number;
  erros: Array<{ linha: number; motivo: string }>;
}

export async function importarCSVAnimais(
  buffer: Buffer,
  criadoPor: number
): Promise<ResultadoImportacao> {
  const texto = buffer.toString("utf-8");
  const linhas = parseCSV(texto);
  if (linhas.length < 1) {
    return { importados: 0, ignorados: 0, erros: [{ linha: 1, motivo: "Arquivo vazio ou sem cabeçalhos." }] };
  }

  const cabecalhos = linhas[0];
  const colunas: Record<string, number> = {};
  cabecalhos.forEach((h, idx) => {
    const chave = headerToKey(h);
    if (chave) colunas[chave] = idx;
  });

  const obrigatorios = ["nome", "especie", "status", "porte"];
  for (const o of obrigatorios) {
    if (!(o in colunas)) {
      return { importados: 0, ignorados: 0, erros: [{ linha: 1, motivo: `Coluna obrigatória ausente: ${o}` }] };
    }
  }

  const erros: Array<{ linha: number; motivo: string }> = [];
  let importados = 0;
  let ignorados = 0;

  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha.every((c) => c.trim() === "")) {
      ignorados++;
      continue;
    }

    const obter = (chave: string) => {
      const idx = colunas[chave];
      return idx !== undefined ? (linha[idx] ?? "").trim() : undefined;
    };

    const nome = obter("nome");
    const especie = obter("especie");
    const status = obter("status");
    const porte = obter("porte");

    if (!nome || !especie || !status || !porte) {
      erros.push({ linha: i + 1, motivo: "Campos obrigatórios ausentes (nome, especie, status, porte)." });
      continue;
    }

    const idadeStr = obter("idade");
    let idadeVal: number | null = null;
    if (idadeStr !== "" && idadeStr !== undefined) {
      idadeVal = Number(idadeStr);
    }
    if (idadeStr !== undefined && idadeStr !== "" && (isNaN(idadeVal as number) || idadeVal === null || idadeVal < 0 || !Number.isInteger(idadeVal))) {
      erros.push({ linha: i + 1, motivo: "Idade deve ser um número inteiro >= 0." });
      continue;
    }

    const pesoStr = obter("peso");
    let pesoVal: number | null = null;
    if (pesoStr !== "" && pesoStr !== undefined) {
      pesoVal = Number(pesoStr.replace(",", "."));
    }
    if (pesoStr !== undefined && pesoStr !== "" && (isNaN(pesoVal as number) || pesoVal === null || pesoVal < 0)) {
      erros.push({ linha: i + 1, motivo: "Peso deve ser um número >= 0." });
      continue;
    }

    const castracao = obter("castracao") || null;
    const raca = obter("raca") || null;
    const temperamento = obter("temperamento") || null;
    const sobre = obter("sobre") || null;

    const vacinacaoRaw = obter("vacinacaoEmDia");
    const vacinacaoEmDia = vacinacaoRaw === "true" || vacinacaoRaw === "1" || vacinacaoRaw === "sim" ? true : false;

    const existe = await Animal.findOne({ where: { nome, especie } });
    if (existe) {
      erros.push({ linha: i + 1, motivo: `Animal duplicado (nome: ${nome}, espécie: ${especie}).` });
      continue;
    }

    const dados = {
      nome: nome.trim(),
      especie: especie.trim(),
      status: status.trim() || "Disponível",
      idade: idadeVal,
      porte: porte.trim() || null,
      raca,
      peso: pesoVal ?? null,
      castracao,
      vacinacaoEmDia,
      imagem: null,
      temperamento,
      sobre,
      dispararNewsletter: false,
      criadoPor,
    };

    const erroValidacao = validarAnimal(dados);
    if (erroValidacao) {
      erros.push({ linha: i + 1, motivo: erroValidacao });
      continue;
    }

    await Animal.create(dados);
    importados++;
  }

  return { importados, ignorados, erros };
}
