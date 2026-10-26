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
  fotos: string[];
  idadeEstimada?: string;
  peso?: string;
  castrado?: string;
  cor?: string;
  temperamento?: string;
  sobre?: string;
  vacinacaoEmDia?: boolean;
  historico?: ItemHistorico[];
}

export interface Pet {
  id: number;
  nome: string;
  tipo: string;
  imagem: string;            
  raca?: string;
  idade?: string;
  anos?: number;
  porte?: string;
  sexo?: "M" | "F";
  tags?: string[];
  descricao?: string;
  disponivelAdocao?: boolean;
  detalhes?: DetalhesPet;
}