import { useQuery } from "@tanstack/react-query";
import { animaisApi } from "../services/animaisApi";
import type { Pet } from "../types/pet";

export function usePets() {
  return useQuery<Pet[]>({
    queryKey: ["pets", "publicos"],
    queryFn: () => animaisApi.listarPublicos(),
  });
}

export function usePet(id: number) {
  return useQuery<Pet | undefined>({
    queryKey: ["pets", "publicos", id],
    queryFn: async () => {
      const pets = await animaisApi.listarPublicos();
      return pets.find((p) => p.id === id);
    },
    enabled: Number.isInteger(id) && id > 0,
  });
}