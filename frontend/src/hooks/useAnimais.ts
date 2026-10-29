import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { animaisApi } from "../services/animaisApi";
import type { NovoAnimal } from "../services/animaisApi";

const KEY_ADMIN = ["animais", "admin"] as const;
const KEY_PUBLICO = ["animais", "publicos"] as const;

function invalidarAnimais(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY_ADMIN });
  qc.invalidateQueries({ queryKey: KEY_PUBLICO });
}

export function useAnimais() {
  return useQuery({
    queryKey: KEY_ADMIN,
    queryFn: () => animaisApi.listar(),
  });
}

export function useCriarAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoAnimal) => animaisApi.criar(dados),
    onSuccess: () => invalidarAnimais(qc),
  });
}

export function useAtualizarAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: NovoAnimal }) =>
      animaisApi.atualizar(id, dados),
    onSuccess: () => invalidarAnimais(qc),
  });
}

export function useExcluirAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => animaisApi.excluir(id),
    onSuccess: () => invalidarAnimais(qc),
  });
}

export function useUploadImagemAnimal() {
  return useMutation({
    mutationFn: (arquivo: File) => animaisApi.enviarImagem(arquivo),
  });
}

export function useImportarCSVAnimais() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => animaisApi.importarCSV(file),
    onSuccess: () => invalidarAnimais(qc),
  });
}