import type { Pet } from "../types/pet";
import { imagemDoAnimal } from "../lib/animalFallback";
import { api } from "./api";

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
  sexo: string | null;
  situacaoSaude: string | null;
  prioridadeApadrinhamento: boolean;
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
  | "sexo"
  | "situacaoSaude"
  | "prioridadeApadrinhamento"
>;

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
      sexo:
        animal.sexo?.toUpperCase() === "M" || animal.sexo?.toUpperCase() === "F"
          ? (animal.sexo.toUpperCase() as "M" | "F")
          : undefined,
      situacaoSaude: animal.situacaoSaude ?? undefined,
      prioridadeApadrinhamento: animal.prioridadeApadrinhamento,
    },
  };
}

export const animaisApi = {
  listar: async (): Promise<Animal[]> => {
    const { data } = await api.get<Animal[]>("/api/animais");
    return data;
  },

  listarPublicos: async (): Promise<Pet[]> => {
    const { data } = await api.get<AnimalPublico[]>("/api/animais/publicos");
    return data.map(paraPet);
  },

  buscar: (id: number): Promise<Animal> => {
    if (!Number.isInteger(id) || id < 1) {
      return Promise.reject(new Error("ID do animal inválido."));
    }
    return api.get<Animal>(`/api/animais/${id}`).then((r) => r.data);
  },

  criar: (dados: NovoAnimal): Promise<Animal> =>
    api.post<Animal>("/api/animais", dados).then((r) => r.data),

  enviarImagem: (arquivo: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("imagem", arquivo);
    return api
      .post<{ url: string }>("/api/upload/animal", form)
      .then((r) => r.data);
  },

  atualizar: (id: number, dados: NovoAnimal): Promise<Animal> => {
    if (!Number.isInteger(id) || id < 1) {
      return Promise.reject(new Error("ID do animal inválido."));
    }
    return api.put<Animal>(`/api/animais/${id}`, dados).then((r) => r.data);
  },

  excluir: (id: number): Promise<void> => {
    if (!Number.isInteger(id) || id < 1) {
      return Promise.reject(new Error("ID do animal inválido."));
    }
    return api.delete(`/api/animais/${id}`).then(() => undefined);
  },

  importarCSV: (file: File): Promise<{ importados: number }> => {
    const fd = new FormData();
    fd.append("file", file);
    return api
      .post<{ importados: number }>("/api/animais/importar-csv", fd)
      .then((r) => r.data);
  },
};