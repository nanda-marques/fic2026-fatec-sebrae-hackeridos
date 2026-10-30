export type TipoHistorico =
  | "vacinacao"
  | "vermifugacao"
  | "castracao"
  | "microchip";

export interface ItemHistorico {
  tipo: TipoHistorico;
  titulo: string;
  texto: string;
}

export interface DetalhesPet {
  /** Galeria do pop-up. Se não houver, o pop-up usa só a foto principal do animal. */
  fotos?: string[];
  idadeEstimada?: string;
  porte?: "Pequeno" | "Médio" | "Grande";
  peso?: string;
  castrado?: string;
  cor?: string;
  temperamento?: string;
  sobre?: string;
  vacinacaoEmDia?: boolean;
  historico?: ItemHistorico[];
  sexo?: "M" | "F";
  situacaoSaude?: string;
  prioridadeApadrinhamento?: boolean;
}

export interface Pet {
  id: number;
  nome: string;
  tipo: "Cão" | "Gato";
  imagem: string;
  raca?: string;
  idade?: string;
  anos?: number;
  porte?: string;
  tags?: string[];
  descricao?: string;
  disponivelAdocao?: boolean;
  detalhes?: DetalhesPet;
  sexo?: string;
  situacaoSaude?: string;
  prioridadeApadrinhamento?: boolean;
}