import "dotenv/config";
import { Sequelize } from "sequelize";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ${nome} não definida.`);
  return valor;
}

const sequelize = new Sequelize(
  obrigatoria("DB_NAME"),
  obrigatoria("DB_USER"),
  obrigatoria("DB_PASSWORD"),
  {
    host: obrigatoria("DB_HOST"),
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        rejectUnauthorized: true
      } as any
    },
    logging: false,
    define: {
      underscored: true,
    },
  }
);

export default sequelize;