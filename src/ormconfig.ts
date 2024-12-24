import { DataSource } from "typeorm";
import { ENV } from "./constants/env";

const dataSource = new DataSource({
    type: "postgres",
    host: ENV.DB_HOST || "localhost",
    port: Number(ENV.DB_PORT) || 5432,
    username: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_NAME,
    entities: [__dirname + '/entity/**/*.{js,ts}'],
    migrations: [__dirname + '/migrations/**/*.{js,ts}'],
    migrationsTableName: "Migrations",
    migrationsRun: false,
    synchronize: false,
    poolSize: 10,
    logging: ["query", "error", "info", "warn"],
});

export default dataSource;