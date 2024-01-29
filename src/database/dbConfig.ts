import "dotenv/config";
import { Dialect } from "sequelize";

interface DbConfig {
  DB_HOST?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  dialect: Dialect;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const dbconfig: DbConfig = {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export { dbconfig };
