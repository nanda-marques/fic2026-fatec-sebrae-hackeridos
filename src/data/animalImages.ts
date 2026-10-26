import amora from "../assets/images/pets/amora.png";
import barney from "../assets/images/pets/barney.png";
import bela from "../assets/images/pets/bela.png";
import bobi from "../assets/images/pets/bobi.png";
import lili from "../assets/images/pets/lili.png";
import mel from "../assets/images/pets/mel.png";
import mingau from "../assets/images/pets/mingau.png";
import rex from "../assets/images/pets/rex.png";
import simba from "../assets/images/pets/simba.png";

const imagensPorNome: Record<string, string> = {
  amora,
  barney,
  bela,
  bobi,
  lili,
  mel,
  mingau,
  rex,
  simba,
};

function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

export function imagemDoAnimal(nome: string): string {
  return imagensPorNome[normalizarNome(nome)] ?? amora;
}
