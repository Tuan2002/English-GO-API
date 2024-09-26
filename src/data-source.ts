import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "./constants/env";

const AppDataSource = new DataSource({
  type: "postgres",
  host: ENV.DB_HOST || "localhost",
  port: Number(ENV.DB_PORT) || 5432,
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  synchronize: true,
  logging: false,
});

export default AppDataSource;
