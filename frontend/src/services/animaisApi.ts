import type { Pet } from "../types/pet";
import { imagemDoAnimal } from "../data/animalImages";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Animal {
  id: number;
  nome: string;
  especie: string;
  status: string;
  idade: number | null;
  porte: string | null;
  raca: string | null;
  peso: number | string | null;
  castracao: string | null;
  vacinacaoEmDia: boolean;
  imagem: string | null;
  temperamento: string | null;
  sobre: string | null;
  dispararNewsletter: boolean;
  criadoPor: number | null;
  criadoEm: string;
}

type AnimalPublico = Omit<Animal, "dispararNewsletter" | "criadoPor">;

export type NovoAnimal = Pick<
  Animal,
  | "nome"
  | "especie"
  | "status"
  | "idade"
  | "porte"
  | "raca"
  | "peso"
  | "castracao"
  | "vacinacaoEmDia"
  | "imagem"
  | "temperamento"
  | "sobre"
  | "dispararNewsletter"
>;

interface ErroApi {
  erro?: string;
  message?: string;
  mensagem?: string;
}

type OpcoesRequisicao = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function requisicao<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    ...(opcoes.body && !(opcoes.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.headers,
  };

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers,
  });

  if (resposta.status === 204 || resposta.status === 205) {
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} em ${caminho}`);
    }
    return undefined as T;
  }

  const texto = await resposta.text();
  let dados: unknown = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    const erro = dados as ErroApi | string | null;
    const mensagem =
      typeof erro === "string"
        ? erro
        : erro?.erro ?? erro?.mensagem ?? erro?.message ?? `Erro ${resposta.status}`;
    throw new Error(mensagem);
  }

  return dados as T;
}

function paraPet(animal: AnimalPublico): Pet {
  const especieNormalizada = animal.especie
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
  const tipo: "Gato" | "Cão" =
    especieNormalizada.includes("felino") ||
    especieNormalizada.includes("gato")
      ? "Gato"
      : "Cão";
  const imagem = animal.imagem || imagemDoAnimal(animal.nome);
  const idade =
    animal.idade === null
      ? undefined
      : `${animal.idade} ${animal.idade === 1 ? "ano" : "anos"}`;

  return {
    id: animal.id,
    nome: animal.nome,
    tipo,
    imagem,
    idade,
    anos: animal.idade ?? undefined,
    porte: animal.porte ?? undefined,
    raca: animal.raca ?? undefined,
    tags: animal.temperamento
      ? animal.temperamento
          .split(/[,;|]/)
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    descricao: animal.sobre ?? undefined,
    disponivelAdocao: animal.status === "Disponível",
    detalhes: {
      fotos: [imagem],
      idadeEstimada: idade,
      peso: animal.peso == null ? undefined : `${animal.peso} kg`,
      castrado: animal.castracao ?? undefined,
      vacinacaoEmDia: animal.vacinacaoEmDia,
      temperamento: animal.temperamento ?? undefined,
      sobre: animal.sobre ?? undefined,
    },
  };
}

export const animaisApi = {
  listar: (): Promise<Animal[]> => requisicao<Animal[]>("/api/animais"),

  listarPublicos: async (): Promise<Pet[]> => {
    const animais = await requisicao<AnimalPublico[]>("/api/animais/publicos");
    return animais.map(paraPet);
  },

  buscar: (id: number): Promise<Animal> => {
    if (!Number.isInteger(id) || id < 1) {
      return Promise.reject(new Error("ID do animal inválido."));
    }
    return requisicao<Animal>(`/api/animais/${id}`);
  },

  criar: (dados: NovoAnimal): Promise<Animal> =>
    requisicao<Animal>("/api/animais", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  enviarImagem: (arquivo: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("imagem", arquivo);
    return requisicao<{ url: string }>("/api/upload/animal", {
      method: "POST",
      body: form,
    });
  },

  atualizar: (id: number, dados: NovoAnimal): Promise<Animal> => {
    if (!Number.isInteger(id) || id < 1) {
      return Promise.reject(new Error("ID do animal inválido."));
    }
    return requisicao<Animal>(`/api/animais/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir: (id: number): Promise<void> => {
    if (!Number.isInteger(id) || id < 1) {
      return Promise.reject(new Error("ID do animal inválido."));
    }
    return requisicao<void>(`/api/animais/${id}`, { method: "DELETE" });
  },

  importarCSV: (file: File): Promise<{ importados: number }> => {
    const fd = new FormData();
    fd.append("file", file);
    return requisicao<{ importados: number }>("/api/animais/importar-csv", {
      method: "POST",
      body: fd,
    });
  },
};
