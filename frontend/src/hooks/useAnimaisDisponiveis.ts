import { useQuery } from "@tanstack/react-query";

import { animaisApi } from "../services/animaisApi";
import type { Pet } from "../types/pet";

interface AnimaisDisponiveis {
  animais: Pet[];
  carregando: boolean;
  erro: string;
}

export function useAnimaisDisponiveis(): AnimaisDisponiveis {
  const { data, isLoading, error } = useQuery({
    queryKey: ["animais", "publicos"],
    queryFn: () => animaisApi.listarPublicos(),
  });

  return {
    animais: data ?? [],
    carregando: isLoading,
    erro:
      error instanceof Error
        ? error.message
        : error
          ? "Não foi possível carregar os animais."
          : "",
  };
}