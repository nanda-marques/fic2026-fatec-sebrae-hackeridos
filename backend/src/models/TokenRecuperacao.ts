import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

import sequelize from "../config/database.js";
import Administrador from "./Administrador.js";

export class TokenRecuperacao extends Model<
  InferAttributes<TokenRecuperacao>,
  InferCreationAttributes<TokenRecuperacao>
> {
  declare id: CreationOptional<number>;
  declare adminId: number;
  declare tokenHash: string;
  declare usado: CreationOptional<boolean>;
  declare expiraEm: Date;
  declare criadoEm: CreationOptional<Date>;
}

TokenRecuperacao.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
     type: DataTypes.INTEGER,
     allowNull: false,
     field: "admin_id",
     references: { model: Administrador, key: "id" },
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "token_hash",
    },
    usado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "usado",
    },
    expiraEm: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expira_em",
    },
    criadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "criado_em",
    },
  },
  {
    sequelize,
    tableName: "tokens_recuperacao",
    timestamps: false,
  }
);

Administrador.hasMany(TokenRecuperacao, {
  foreignKey: "adminId",
  as: "tokensRecuperacao",
  onDelete: "CASCADE",
});

TokenRecuperacao.belongsTo(Administrador, {
  foreignKey: "adminId",
  as: "administrador",
  onDelete: "CASCADE",
});

export default TokenRecuperacao;
