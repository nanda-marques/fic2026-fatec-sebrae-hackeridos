import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export class ConteudoNewsletter extends Model {
  declare public id: number;
  declare public conteudo_id: number | null;
  declare public animal_id: number | null;
  declare public status: string;
  declare public adicionado_em: Date;
  declare public enviado_em: Date | null;
}

ConteudoNewsletter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conteudo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'conteudo_id', 
    },
    animal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'animal_id',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pendente',
    },
    adicionado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    enviado_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'conteudo_newsletter',
    timestamps: false,
  }
);