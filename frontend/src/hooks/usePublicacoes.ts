import { useQuery } from "@tanstack/react-query";

import { publicacoesApi } from "../services/publicacoesApi";

// Retorna todas as publicações publicadas. 
export function usePublicacoes() {
  return useQuery({
    queryKey: ["publicacoes", "publicadas"],
    queryFn: () => publicacoesApi.listarPublicadas(),
  });
}


export function useCampanhasDestaque() {
  return useQuery({
    queryKey: ["publicacoes", "campanhas-destaque"],
    queryFn: async () => {
      const conteudos = await publicacoesApi.listarPublicadas();
      return conteudos
        .filter(
          (conteudo) =>
            conteudo.destaque || conteudo.urgente
        )
        .sort(
          (a, b) =>
            Number(b.urgente) - Number(a.urgente) ||
            Number(b.destaque) - Number(a.destaque) ||
            b.criadoEm.localeCompare(a.criadoEm)
        )
    },
  });
}