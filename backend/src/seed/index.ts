import { seedCargos } from "./cargos.js";

export async function runSeeds(): Promise<void> {
  await seedCargos();

  console.log("Seeds executados com sucesso.");
}