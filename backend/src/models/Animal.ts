import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

import sequelize from "../config/database.js";

export class AnimalModel extends Model<
  InferAttributes<AnimalModel>,
  InferCreationAttributes<AnimalModel>
> {
  declare id: CreationOptional<number>;
  declare especie: string;
  declare status: CreationOptional<string>;
  declare nome: string;
  declare idade: number | null;
  declare porte: string | null;
  declare raca: string | null;
  declare peso: number | string | null;
  declare castracao: string | null;
  declare vacinacaoEmDia: CreationOptional<boolean>;
  declare imagem: string | null;
  declare temperamento: string | null;
  declare sobre: string | null;
  declare dispararNewsletter: CreationOptional<boolean>;
  declare criadoPor: number | null;
  declare criadoEm: CreationOptional<Date>;
}

AnimalModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    especie: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Disponível",
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    idade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    porte: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    raca: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    peso: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    castracao: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    vacinacaoEmDia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "vacinacao_em_dia",
    },
    imagem: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    temperamento: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sobre: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dispararNewsletter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "disparar_newsletter",
    },
    criadoPor: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "criado_por",
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
    tableName: "animais",
    timestamps: false,
  }
);

export async function adicionarCamposComplementares(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const colunas = await queryInterface.describeTable("animais");
  const novasColunas = {
    raca: { type: DataTypes.STRING(255), allowNull: true },
    peso: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    castracao: { type: DataTypes.STRING(50), allowNull: true },
    vacinacao_em_dia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    imagem: { type: DataTypes.STRING(500), allowNull: true },
  };

  for (const [coluna, definicao] of Object.entries(novasColunas)) {
    if (!(coluna in colunas)) {
      await queryInterface.addColumn("animais", coluna, definicao);
    }
  }
}

export default AnimalModel;
