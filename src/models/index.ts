import { Sequelize, DataTypes } from "sequelize";
import { dbconfig } from "../database/dbConfig";
import UserModel from "./UserModel";
import EventModel from "./EventsModel";

const sequelize = new Sequelize(
  dbconfig.DB_NAME!,
  dbconfig.DB_USER!,
  dbconfig.DB_PASSWORD!,
  {
    host: dbconfig.DB_HOST!,
    dialect: dbconfig.dialect,
    pool: {
      max: dbconfig.pool.max,
      min: dbconfig.pool.min,
      acquire: dbconfig.pool.acquire,
      idle: dbconfig.pool.idle,
    },
  }
);

interface Database {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  user: ReturnType<typeof UserModel>;
  events: ReturnType<typeof EventModel>;
}

const db: Database = {
  Sequelize,
  sequelize,
  user: UserModel(sequelize, DataTypes),
  events: EventModel(sequelize, DataTypes),
};

export { db };
