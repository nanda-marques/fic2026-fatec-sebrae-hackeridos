import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

import Administrador from "../models/Administrador.js";
import Cargo from "../models/Cargo.js";
import ImagemPerfil from "../models/ImagemPerfil.js";
import { HttpError } from "../middlewares/error.middleware.js";

function sanitize(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const uploadController = {
  async signedUrl(req: Request, res: Response): Promise<any> {
    try {
      const u = req.usuario;
      if (!u) return res.status(401).json({ error: "Não autenticado." });

      const path = req.query.path as string;
      const bucket = (req.query.bucket as string) || "container-perfis";

      if (!path) return res.status(400).json({ error: "path obrigatório" });

      // Whitelist de buckets
      const BUCKETS_PERMITIDOS = [
        "container-perfis",
        "container-animais",
        "container-posts",
      ];
      if (!BUCKETS_PERMITIDOS.includes(bucket)) {
        return res.status(400).json({ error: "Bucket inválido." });
      }

      // Bucket de perfis: valida acesso
      if (bucket === "container-perfis") {
        const ehProprioArquivo = path.startsWith(`admins/${u.id}/`);

        if (!ehProprioArquivo) {
          // Só permite ver foto de outro admin se tiver permissão "admins"
          const administrador = await Administrador.findByPk(u.id, {
            include: [{ model: Cargo, as: "cargoRef" }],
          });

          if (
            !administrador ||
            !administrador.ativo ||
            administrador.status !== "ativo"
          ) {
            return res.status(403).json({ error: "Acesso negado." });
          }

          const cargo = administrador.get("cargoRef") as Cargo | undefined;
          if (!cargo?.podeGerenciarAdmins) {
            return res.status(403).json({ error: "Acesso negado." });
          }
        }
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60);

      if (error) return res.status(502).json({ error: error.message });
      return res.json({ url: data.signedUrl });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async uploadPerfil(req: Request, res: Response): Promise<void> {
  const u = req.usuario;
  if (!u) throw new HttpError(401, "Não autenticado.");
  if (!req.file) throw new HttpError(400, "Nenhum ficheiro enviado.");

  const fileName = `admins/${u.id}/${Date.now()}_${sanitize(
    req.file.originalname
  )}`;

  const { error } = await supabase.storage
    .from("container-perfis")
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true,
    });

    if (error) throw new HttpError(502, `Supabase: ${error.message}`);
    await ImagemPerfil.upsert({
      idAdministradores: u.id,
      url: fileName,
    });

    res.json({ mensagem: "Foto atualizada.", path: fileName });
  },

  async uploadImagemPublicacao(req: Request, res: Response): Promise<void> {
    const usuario = req.usuario;
    const file = req.file;
    if (!usuario) throw new HttpError(401, "Não autenticado.");
    if (!file) throw new HttpError(400, "Nenhuma imagem enviada.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      throw new HttpError(400, "Use uma imagem JPG, PNG ou WebP.");
    }

    const bucket =
      process.env.SUPABASE_BUCKET_POSTS ??
      process.env.SUPABASE_BUCKET_posts ??
      "container-posts";
    const fileName = `publicacoes/${usuario.id}/${Date.now()}_${sanitize(
      file.originalname
    )}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) throw new HttpError(502, `Supabase: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    res.status(201).json({ url: data.publicUrl });
  },

  async uploadImagemAnimal(req: Request, res: Response): Promise<void> {
    const usuario = req.usuario;
    const file = req.file;
    if (!usuario) throw new HttpError(401, "Não autenticado.");
    if (!file) throw new HttpError(400, "Nenhuma imagem enviada.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      throw new HttpError(400, "Use uma imagem JPG, PNG ou WebP.");
    }

    const bucket =
      process.env.SUPABASE_BUCKET_ANIMALS ??
      process.env.SUPABASE_BUCKET_animals ??
      "container-animais";
    const fileName = `animais/${usuario.id}/${Date.now()}_${sanitize(
      file.originalname
    )}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) throw new HttpError(502, `Supabase: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    res.status(201).json({ url: data.publicUrl });
  },
};