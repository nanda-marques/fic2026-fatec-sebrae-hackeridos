import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import Administrador from "../models/Administrador.js";
import Cargo from "../models/Cargo.js";
import HistoricoSolicitacaoAdmin from "../models/HistoricoSolicitacaoAdmin.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { adminParaUsuario } from "../types/auth.types.js";
import { pathFotoDe } from "../helpers/perfil.helper.js";

export const adminController = {
  // GET /api/admin/me
  async buscarPerfil(req: Request, res: Response): Promise<void> {
    const u = req.usuario;
    if (!u) throw new HttpError(401, "Não autenticado.");

    const admin = await Administrador.findByPk(u.id, {
      include: [{ model: Cargo, as: "cargoRef" }],
    });
    if (!admin) throw new HttpError(404, "Administrador não encontrado.");

    const cargoRef = admin.get("cargoRef") as Cargo | undefined;

    res.json({
      ...adminParaUsuario(admin, cargoRef),
      fotoPath: await pathFotoDe(admin.id),
    });
  },

  // PUT /api/admin/me
  async atualizarPerfil(req: Request, res: Response): Promise<void> {
    const u = req.usuario;
    if (!u) throw new HttpError(401, "Não autenticado.");

    const { nomeCompleto, email } = req.body as {
      nomeCompleto?: string;
      email?: string;
    };

    const admin = await Administrador.findByPk(u.id);
    if (!admin) throw new HttpError(404, "Administrador não encontrado.");

    if (email && email !== admin.email) {
      const existe = await Administrador.findOne({ where: { email } });
      if (existe) throw new HttpError(409, "E-mail já cadastrado.");
    }

    if (nomeCompleto?.trim()) admin.nomeCompleto = nomeCompleto.trim();
    if (email?.trim()) admin.email = email.trim();
    await admin.save();

    const cargoRef = await Cargo.findByPk(admin.cargo);

    res.json({
      mensagem: "Perfil atualizado com sucesso.",
      usuario: adminParaUsuario(admin, cargoRef),
    });
  },

  // PUT /api/admin/senha
  async alterarSenha(req: Request, res: Response): Promise<void> {
    const u = req.usuario;
    if (!u) throw new HttpError(401, "Não autenticado.");

    const { senhaAtual, novaSenha } = req.body as {
      senhaAtual?: string;
      novaSenha?: string;
    };

    if (!senhaAtual || !novaSenha) {
      throw new HttpError(400, "Senha atual e nova senha são obrigatórias.");
    }
    if (novaSenha.length < 8) {
      throw new HttpError(400, "A nova senha deve ter pelo menos 8 caracteres.");
    }

    const admin = await Administrador.findByPk(u.id);
    if (!admin) throw new HttpError(404, "Administrador não encontrado.");

    const ok = await bcrypt.compare(senhaAtual, admin.senhaHash);
    if (!ok) throw new HttpError(401, "Senha atual incorreta.");

    admin.senhaHash = await bcrypt.hash(novaSenha, 10);
    await admin.save();

    res.json({ mensagem: "Senha alterada com sucesso." });
  },

  // GET /api/admin/pendentes
  async listarPendentes(_req: Request, res: Response): Promise<void> {
    const pendentes = await Administrador.findAll({
      where: { status: "pendente" },
      include: [{ model: Cargo, as: "cargoRef" }],
      attributes: [
        "id",
        "nomeCompleto",
        "email",
        "cargo",
        "status",
        "criadoEm",
      ],
      order: [["criadoEm", "ASC"]],
    });

    res.json(
      pendentes.map((admin) => {
        const cargoRef = admin.get("cargoRef") as Cargo | undefined;

        return {
          id: admin.id,
          nomeCompleto: admin.nomeCompleto,
          email: admin.email,
          cargoId: admin.cargo,
          cargo: cargoRef?.nomeCargo ?? null,
          status: admin.status,
          criadoEm: admin.criadoEm,
        };
      })
    );
  },

  // PATCH /api/admin/:id/aprovar
  async aprovar(req: Request, res: Response): Promise<void> {
    const u = req.usuario;
    if (!u) throw new HttpError(401, "Não autenticado.");

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, "ID de administrador inválido.");
    }

    const admin = await Administrador.findByPk(id);
    if (!admin) throw new HttpError(404, "Administrador não encontrado.");
    if (admin.status !== "pendente") {
      throw new HttpError(409, "Este cadastro não está pendente de aprovação.");
    }

    const cargoRef = await Cargo.findByPk(admin.cargo);
    if (!cargoRef) {
      throw new HttpError(500, "Cargo da solicitação não encontrado.");
    }

    const responsavel = await Administrador.findByPk(u.id);
    if (!responsavel) {
      throw new HttpError(401, "Administrador responsável não encontrado.");
    }

    admin.status = "ativo";
    admin.ativo = true;
    await admin.save();

    await HistoricoSolicitacaoAdmin.create({
      solicitanteId: admin.id,
      solicitanteNome: admin.nomeCompleto,
      solicitanteEmail: admin.email,
      cargoSolicitado: cargoRef.nomeCargo,
      decisao: "aprovado",
      administradorId: responsavel.id,
      administradorNome: responsavel.nomeCompleto,
    });

    res.json({
      mensagem: "Cadastro aprovado com sucesso.",
      administrador: {
        id: admin.id,
        nomeCompleto: admin.nomeCompleto,
        email: admin.email,
        cargo: admin.cargo,
        status: admin.status,
        ativo: admin.ativo,
      },
    });
  },

  // PATCH /api/admin/:id/rejeitar
  async rejeitar(req: Request, res: Response): Promise<void> {
    const u = req.usuario;
    if (!u) throw new HttpError(401, "Não autenticado.");

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, "ID de administrador inválido.");
    }

    const admin = await Administrador.findByPk(id);
    if (!admin) throw new HttpError(404, "Administrador não encontrado.");
    if (admin.status !== "pendente") {
      throw new HttpError(409, "Este cadastro não está pendente de decisão.");
    }

    const cargoRef = await Cargo.findByPk(admin.cargo);
    if (!cargoRef) {
      throw new HttpError(500, "Cargo da solicitação não encontrado.");
    }

    const responsavel = await Administrador.findByPk(u.id);
    if (!responsavel) {
      throw new HttpError(401, "Administrador responsável não encontrado.");
    }

    admin.status = "inativo";
    admin.ativo = false;
    await admin.save();

    await HistoricoSolicitacaoAdmin.create({
      solicitanteId: admin.id,
      solicitanteNome: admin.nomeCompleto,
      solicitanteEmail: admin.email,
      cargoSolicitado: cargoRef.nomeCargo,
      decisao: "rejeitado",
      administradorId: responsavel.id,
      administradorNome: responsavel.nomeCompleto,
    });

    res.json({
      mensagem: "Cadastro rejeitado.",
      administrador: {
        id: admin.id,
        nomeCompleto: admin.nomeCompleto,
        status: admin.status,
        ativo: admin.ativo,
      },
    });
  },

  // GET /api/admin/historico-solicitacoes
  async listarHistorico(_req: Request, res: Response): Promise<void> {
    const historico = await HistoricoSolicitacaoAdmin.findAll({
      order: [["decididoEm", "DESC"]],
      limit: 5,
      attributes: [
        "id",
        "solicitanteId",
        "solicitanteNome",
        "solicitanteEmail",
        "cargoSolicitado",
        "decisao",
        "administradorId",
        "administradorNome",
        "decididoEm",
      ],
    });

    res.json(historico);
  },
};