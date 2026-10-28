import ImagemPerfil from "../models/ImagemPerfil.js";

// busca o path da foto de perfil do admin
export async function pathFotoDe(adminId: number): Promise<string | null> {
  const img = await ImagemPerfil.findOne({
    where: { idAdministradores: adminId },
  });
  return img?.url ?? null;
}