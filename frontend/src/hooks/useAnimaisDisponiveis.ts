import { useEffect, useState } from "react";

import { animaisApi } from "../services/animaisApi";
import type { Pet } from "../types/pet";

interface AnimaisDisponiveis {
  animais: Pet[];
  carregando: boolean;
  erro: string;
}

export function useAnimaisDisponiveis(): AnimaisDisponiveis {
  const [animais, setAnimais] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    animaisApi
      .listarPublicos()
      .then((dados) => {
        if (ativo) setAnimais(dados);
      })
      .catch((erroApi: unknown) => {
        if (ativo) {
          setErro(
            erroApi instanceof Error
              ? erroApi.message
              : "Não foi possível carregar os animais."
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { animais, carregando, erro };
}
