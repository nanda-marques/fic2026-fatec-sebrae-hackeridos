export interface Animal {
 nome: string;
  especie: string;
  status?: string;
  idade?: number | null;
  porte?: string | null;
  raca?: string | null;
  peso?: number | null;
  castracao?: string | null;
  vacinacaoEmDia?: boolean;
  imagem?: string | null;
  temperamento?: string | null;
  sobre?: string | null;
  dispararNewsletter?: boolean;
  sexo?: string | null;
  situacaoSaude?: string | null;
  prioridadeApadrinhamento?: boolean;
}

export type AnimalInput = Pick<Animal, "nome" | "especie"> &
  Partial<
    Pick<
      Animal,
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
    >
  >;