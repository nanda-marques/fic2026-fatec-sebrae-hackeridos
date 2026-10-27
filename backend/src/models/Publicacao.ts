import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

import sequelize from "../config/database.js";
import Administrador from "./Administrador.js";
import type {
  CategoriaConteudo,
  StatusPublicacao,
} from "../types/publicacao.js";

export class PublicacaoModel extends Model<
  InferAttributes<PublicacaoModel>,
  InferCreationAttributes<PublicacaoModel>
> {
  declare id: CreationOptional<number>;
  declare categoria: CategoriaConteudo;
  declare status: CreationOptional<StatusPublicacao>;
  declare titulo: string;
  declare descricaoConteudo: string;
  declare imagem: string | null;
  declare autor: string | null;
  declare resumo: string | null;
  declare destaque: CreationOptional<boolean>;
  declare urgente: CreationOptional<boolean>;
  declare dataEventoCampanha: Date | null;
  declare localEventoCampanha: string | null;
  declare urlArrecadacao: string | null;
  declare urlVideo: string | null;
  // Mantido no mapeamento do banco; a integração de newsletter será implementada depois.
  declare dispararNewsletter: CreationOptional<boolean>;
  declare criadoPor: number | null;
  declare criadoEm: CreationOptional<Date>;
  declare atualizadoEm: CreationOptional<Date>;
}

PublicacaoModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [["noticia", "evento", "campanha", "publicacao"]],
      },
    },
    status: {
      type: DataTypes.ENUM("rascunho", "publicado", "agendado", "arquivado"),
      allowNull: false,
      defaultValue: "rascunho",
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descricaoConteudo: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "descricao_conteudo",
    },
    imagem: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    autor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    resumo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    destaque: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    urgente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    dataEventoCampanha: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "data_evento_campanha",
    },
    localEventoCampanha: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "local_evento_campanha",
    },
    urlArrecadacao: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "url_arrecadacao",
    },
    urlVideo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "url_video",
    },
    // Coluna reservada para a futura integração de newsletter.
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
      references: { model: Administrador, key: "id" },
      onDelete: "SET NULL",
    },
    criadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "criado_em",
    },
    atualizadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "atualizado_em",
    },
  },
  {
    sequelize,
    tableName: "conteudos",
    timestamps: false,
  }
);

Administrador.hasMany(PublicacaoModel, {
  foreignKey: "criadoPor",
  as: "conteudosCriados",
  onDelete: "SET NULL",
});
PublicacaoModel.belongsTo(Administrador, {
  foreignKey: "criadoPor",
  as: "criador",
  onDelete: "SET NULL",
});

export default PublicacaoModel;
