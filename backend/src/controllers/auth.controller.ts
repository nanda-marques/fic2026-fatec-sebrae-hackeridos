import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Administrador from "../models/Administrador.js";
import Cargo from "../models/Cargo.js";
import ImagemPerfil from "../models/ImagemPerfil.js";
import { supabase } from "../config/supabase.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { obterJwtSecret } from "../middlewares/auth.middleware.js";

import {
  permissoesDe,
  adminParaUsuario,
  type CorpoCadastro,
  type CorpoLogin,
  type PayloadToken,
} from "../types/auth.types.js";

async function pathFotoDe(adminId: number): Promise<string | null> {
  const img = await ImagemPerfil.findOne({
    where: { idAdministradores: adminId },
  });

  return img?.url ?? null;
}

function sanitize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const authController = {
  // POST /api/auth/cadastro
  async cadastrar(
    req: Request<unknown, unknown, CorpoCadastro>,
    res: Response
  ): Promise<void> {
    const { nome, sobrenome, email, cargo, senha } = req.body;

    if (
      !nome?.trim() ||
      !sobrenome?.trim() ||
      !email?.trim() ||
      !cargo ||
      !senha
    ) {
      throw new HttpError(400, "Preencha todos os campos obrigatórios.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, "E-mail inválido.");
    }

    if (senha.length < 8) {
      throw new HttpError(
        400,
        "A senha deve ter pelo menos 8 caracteres."
      );
    }

    // Verifica se o cargo escolhido existe
    const cargoRef = await Cargo.findOne({
      where: { nomeCargo: cargo },
    });

    if (!cargoRef) {
      throw new HttpError(400, "Cargo inválido.");
    }

    // Verifica se o e-mail já está cadastrado
    const existe = await Administrador.findOne({
      where: { email: email.trim() },
    });

    if (existe) {
      throw new HttpError(409, "Este e-mail já está cadastrado.");
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria a conta aguardando aprovação
    const admin = await Administrador.create({
      nomeCompleto: `${nome.trim()} ${sobrenome.trim()}`.trim(),
      email: email.trim(),
      senhaHash,
      cargo: cargoRef.id,
      status: "pendente",
      ativo: false,
    });

    // Upload da foto de perfil no Supabase
    let pathFoto: string | null = null;

    if (req.file) {
      const fileName = `admins/${admin.id}/${Date.now()}_${sanitize(
        req.file.originalname
      )}`;

      const { error: upErr } = await supabase.storage
        .from("container-perfis")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (upErr) {
        // Remove a conta se o upload da foto falhar
        await admin.destroy();

        throw new HttpError(
          502,
          `Erro ao subir foto: ${upErr.message}`
        );
      }

      try {
        await ImagemPerfil.create({
          idAdministradores: admin.id,
          url: fileName,
        });

        pathFoto = fileName;
      } catch (error) {
        // Remove a conta se não conseguir registrar a foto
        await supabase.storage
          .from("container-perfis")
          .remove([fileName]);

        await admin.destroy();

        throw error;
      }
    }

    res.status(201).json({
      mensagem:
        "Cadastro realizado com sucesso! Sua conta está aguardando aprovação.",
      usuario: {
        ...adminParaUsuario(admin, cargoRef),
        fotoPath: pathFoto,
      },
    });
  },

  // POST /api/auth/login
  async login(
    req: Request<unknown, unknown, CorpoLogin>,
    res: Response
  ): Promise<void> {
    const { email, senha } = req.body;

    if (!email?.trim() || !senha) {
      throw new HttpError(
        400,
        "E-mail e senha são obrigatórios."
      );
    }

    // Busca o usuário e o cargo associado
    const admin = await Administrador.findOne({
      where: { email: email.trim() },
      include: [{ model: Cargo, as: "cargoRef" }],
    });

    if (!admin) {
      throw new HttpError(401, "E-mail ou senha incorretos.");
    }

    // Verifica a senha uma única vez
    const senhaValida = await bcrypt.compare(
      senha,
      admin.senhaHash
    );

    if (!senhaValida) {
      throw new HttpError(401, "E-mail ou senha incorretos.");
    }

    // Bloqueia contas que aguardam aprovação
    if (admin.status === "pendente") {
      throw new HttpError(
        403,
        "Sua conta está aguardando aprovação de um administrador."
      );
    }

    // Bloqueia contas inativas ou rejeitadas
    if (admin.status !== "ativo" || !admin.ativo) {
      throw new HttpError(
        403,
        "Sua conta não está ativa. Entre em contato com um administrador."
      );
    }

    const cargoRef = admin.get("cargoRef") as Cargo | undefined;

    // Dados que serão incluídos no token
    const payload: PayloadToken = {
      id: admin.id,
      email: admin.email,
      cargo: cargoRef?.nomeCargo ?? String(admin.cargo),
    };

    const token = jwt.sign(payload, obterJwtSecret(), {
      expiresIn: "8h",
    });

    res.json({
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: {
        ...adminParaUsuario(admin, cargoRef),
        permissoes: permissoesDe(cargoRef ?? null),
        fotoPath: await pathFotoDe(admin.id),
      },
    });
  },

  // GET /api/auth/me
  async me(req: Request, res: Response): Promise<void> {
    const u = req.usuario;

    if (!u) {
      throw new HttpError(401, "Não autenticado.");
    }

    const admin = await Administrador.findByPk(u.id, {
      include: [{ model: Cargo, as: "cargoRef" }],
    });

    // Impede acesso se a conta não estiver ativa
    if (!admin || admin.status !== "ativo" || !admin.ativo) {
      throw new HttpError(401, "Sessão inválida.");
    }

    const cargoRef = admin.get("cargoRef") as Cargo | undefined;

    res.json({
      usuario: {
        ...adminParaUsuario(admin, cargoRef),
        permissoes: permissoesDe(cargoRef ?? null),
        fotoPath: await pathFotoDe(admin.id),
      },
    });
  },
};
