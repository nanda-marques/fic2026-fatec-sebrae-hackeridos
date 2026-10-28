import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import Administrador from "../models/Administrador.js";
import Cargo from "../models/Cargo.js";
import HistoricoSolicitacaoAdmin from "../models/HistoricoSolicitacaoAdmin.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { exigirPermissaoGerenciarAdmins } from "../middlewares/admin.middleware.js";
import { pathFotoDe } from "../helpers/perfil.helper.js";

const router = Router();

// GET /api/admin/me
router.get(
  "/me",
  autenticar,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.usuario!.id;
      const admin = await Administrador.findByPk(adminId, {
        include: [{ model: Cargo, as: "cargoRef" }],
      });
      if (!admin) {
        res.status(404).json({ mensagem: "Administrador não encontrado." });
        return;
      }
      const cargoRef = admin.get("cargoRef") as Cargo | undefined;
      res.json({
        id: admin.id,
        nomeCompleto: admin.nomeCompleto,
        email: admin.email,
        cargo: cargoRef?.nomeCargo ?? null,
        ativo: admin.ativo,
        criadoEm: admin.criadoEm,
        fotoPath: await pathFotoDe(admin.id),
      });
    } catch (erro: unknown) {
      console.error("Erro ao buscar perfil:", erro);
      res.status(500).json({ mensagem: "Erro ao buscar perfil." });
    }
  }
);

// PUT /api/admin/me
interface CorpoPerfil {
  nomeCompleto?: string;
  email?: string;
}

router.put(
  "/me",
  autenticar,
  async (
    req: Request<unknown, unknown, CorpoPerfil>,
    res: Response
  ): Promise<void> => {
    try {
      const adminId = req.usuario!.id;
      const { nomeCompleto, email } = req.body;

      const admin = await Administrador.findByPk(adminId);
      if (!admin) {
        res.status(404).json({ mensagem: "Administrador não encontrado." });
        return;
      }

      if (nomeCompleto !== undefined) {
        if (!nomeCompleto.trim()) {
          res.status(400).json({ mensagem: "Nome não pode ficar vazio." });
          return;
        }
        admin.nomeCompleto = nomeCompleto.trim();
      }

      if (email !== undefined) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          res.status(400).json({ mensagem: "E-mail inválido." });
          return;
        }
        if (email !== admin.email) {
          const existe = await Administrador.findOne({ where: { email } });
          if (existe) {
            res.status(409).json({ mensagem: "Este e-mail já está em uso." });
            return;
          }
          admin.email = email;
        }
      }

      await admin.save();
      res.json({
        mensagem: "Perfil atualizado com sucesso.",
        usuario: {
          id: admin.id,
          nomeCompleto: admin.nomeCompleto,
          email: admin.email,
        },
      });
    } catch (erro: unknown) {
      console.error("Erro ao atualizar perfil:", erro);
      res.status(500).json({ mensagem: "Erro ao atualizar perfil." });
    }
  }
);

// PUT /api/admin/senha
interface CorpoSenha {
  senhaAtual?: string;
  novaSenha?: string;
}

router.put(
  "/senha",
  autenticar,
  async (
    req: Request<unknown, unknown, CorpoSenha>,
    res: Response
  ): Promise<void> => {
    try {
      const adminId = req.usuario!.id;
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        res.status(400).json({ mensagem: "Preencha senha atual e nova senha." });
        return;
      }
      if (novaSenha.length < 8) {
        res.status(400).json({
          mensagem: "A nova senha deve ter pelo menos 8 caracteres.",
        });
        return;
      }
      if (senhaAtual === novaSenha) {
        res.status(400).json({
          mensagem: "A nova senha deve ser diferente da atual.",
        });
        return;
      }

      const admin = await Administrador.findByPk(adminId);
      if (!admin) {
        res.status(404).json({ mensagem: "Administrador não encontrado." });
        return;
      }

      const ok = await bcrypt.compare(senhaAtual, admin.senhaHash);
      if (!ok) {
        res.status(401).json({ mensagem: "Senha atual incorreta." });
        return;
      }

      admin.senhaHash = await bcrypt.hash(novaSenha, 10);
      await admin.save();

      res.json({ mensagem: "Senha alterada com sucesso." });
    } catch (erro: unknown) {
      console.error("Erro ao alterar senha:", erro);
      res.status(500).json({ mensagem: "Erro ao alterar senha." });
    }
  }
);

// GET /api/admin/pendentes
router.get(
  "/pendentes",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  async (_req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (erro: unknown) {
      console.error("Erro ao listar cadastros pendentes:", erro);
      res.status(500).json({
        mensagem: "Erro ao listar cadastros pendentes.",
      });
    }
  }
);

// PATCH /api/admin/:id/aprovar
router.patch(
  "/:id/aprovar",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID de administrador inválido." });
        return;
      }

      const admin = await Administrador.findByPk(id);

      if (!admin) {
        res.status(404).json({ mensagem: "Administrador não encontrado." });
        return;
      }

      if (admin.status !== "pendente") {
        res.status(409).json({
          mensagem: "Este cadastro não está pendente de aprovação.",
        });
        return;
      }

      const cargoRef = await Cargo.findByPk(admin.cargo);

      if (!cargoRef) {
        res.status(500).json({
          mensagem: "Cargo da solicitação não encontrado.",
        });
        return;
      }

      const responsavelId = req.usuario!.id;
      const responsavel = await Administrador.findByPk(responsavelId);

      if (!responsavel) {
        res.status(401).json({
          mensagem: "Administrador responsável não encontrado.",
        });
        return;
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
    } catch (erro: unknown) {
      console.error("Erro ao aprovar cadastro:", erro);
      res.status(500).json({ mensagem: "Erro ao aprovar cadastro." });
    }
  }
);

// PATCH /api/admin/:id/rejeitar
router.patch(
  "/:id/rejeitar",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID de administrador inválido." });
        return;
      }

      const admin = await Administrador.findByPk(id);

      if (!admin) {
        res.status(404).json({ mensagem: "Administrador não encontrado." });
        return;
      }

      if (admin.status !== "pendente") {
        res.status(409).json({
          mensagem: "Este cadastro não está pendente de decisão.",
        });
        return;
      }

      const cargoRef = await Cargo.findByPk(admin.cargo);

      if (!cargoRef) {
        res.status(500).json({
          mensagem: "Cargo da solicitação não encontrado.",
        });
        return;
      }

      const responsavelId = req.usuario!.id;
      const responsavel = await Administrador.findByPk(responsavelId);

      if (!responsavel) {
        res.status(401).json({
          mensagem: "Administrador responsável não encontrado.",
        });
        return;
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
    } catch (erro: unknown) {
      console.error("Erro ao rejeitar cadastro:", erro);
      res.status(500).json({ mensagem: "Erro ao rejeitar cadastro." });
    }
  }
);

// GET /api/admin/historico-solicitacoes
router.get(
  "/historico-solicitacoes",
  autenticar,
  exigirPermissaoGerenciarAdmins,
  async (_req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (erro: unknown) {
      console.error("Erro ao buscar histórico de solicitações:", erro);
      res.status(500).json({
        mensagem: "Erro ao buscar histórico de solicitações.",
      });
    }
  }
);

export default router;