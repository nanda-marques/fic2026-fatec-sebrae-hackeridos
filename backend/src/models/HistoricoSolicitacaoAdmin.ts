import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

import sequelize from "../config/database.js";

export type DecisaoSolicitacao = "aprovado" | "rejeitado";

class HistoricoSolicitacaoAdmin extends Model<
  InferAttributes<HistoricoSolicitacaoAdmin>,
  InferCreationAttributes<HistoricoSolicitacaoAdmin>
> {
  declare id: CreationOptional<number>;

  declare solicitanteId: number;
  declare solicitanteNome: string;
  declare solicitanteEmail: string;
  declare cargoSolicitado: string;

  declare decisao: DecisaoSolicitacao;

  declare administradorId: number;
  declare administradorNome: string;

  declare decididoEm: CreationOptional<Date>;
}

HistoricoSolicitacaoAdmin.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    solicitanteId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "solicitante_id",
    },
    solicitanteNome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "solicitante_nome",
    },
    solicitanteEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "solicitante_email",
    },
    cargoSolicitado: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "cargo_solicitado",
    },
    decisao: {
      type: DataTypes.ENUM("aprovado", "rejeitado"),
      allowNull: false,
    },
    administradorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "administrador_id",
    },
    administradorNome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "administrador_nome",
    },
    decididoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "decidido_em",
    },
  },
  {
    sequelize,
    tableName: "historico_solicitacoes_admin",
    timestamps: false,
  }
);

export default HistoricoSolicitacaoAdmin;