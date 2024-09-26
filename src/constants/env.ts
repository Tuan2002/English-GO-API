import "dotenv/config";
export const ENV = {
  APP_PORT: process.env.APP_PORT || 5555,
  SECRET_KEY: process.env.SECRET_KEY || "secret",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h",
  APP_ORIGIN: process.env.APP_ORIGIN || "http://localhost:3000",

  DB_USERNAME: process.env.DB_USERNAME || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "quyen",
  DB_NAME: process.env.DB_NAME || "recruitment",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_DIALECT: process.env.DB_DIALECT || "postgres",
  DB_POOL_MAX: process.env.DB_POOL_MAX,
  DB_POOL_MIN: process.env.DB_POOL_MIN,
  DB_POOL_ACQUIRE: process.env.DB_POOL_ACQUIRE,
  DB_POOL_IDLE: process.env.DB_POOL_IDLE,

  PASSWORD_SALT: process.env.PASSWORD_SALT || 10,
  AUTH_MODE: process.env.AUTH_MODE || "COOKIE",
};
