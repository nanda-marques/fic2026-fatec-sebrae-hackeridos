import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../config/database.js";

export class InscritoNewsletter extends Model<
  InferAttributes<InscritoNewsletter>,
  InferCreationAttributes<InscritoNewsletter>
> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare email: string;
  declare ativo: CreationOptional<boolean>;
  declare criadoEm: CreationOptional<Date>;
}

InscritoNewsletter.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "inscritos_newsletter",
    timestamps: false,
  }
);

export default InscritoNewsletter;