import Sequelize from "sequelize";
import { dbconfig } from "../database/dbConfig.js";
import UserModel from "./UserModel.js";

const sequelize = new Sequelize(
  dbconfig.DB_NAME,
  dbconfig.DB_USER,
  dbconfig.DB_PASSWORD,
  {
    host: dbconfig.DB_HOST,
    dialect: dbconfig.dialect,
    pool: {
      max: dbconfig.pool.max,
      min: dbconfig.pool.min,
      acquire: dbconfig.pool.acquire,
      idle: dbconfig.pool.idle,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = UserModel(sequelize, Sequelize);

export { db };
