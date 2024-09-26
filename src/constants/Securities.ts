import "dotenv/config";
export const Securities = {
  SALTS: Number(process.env.HASH_SALTS) ?? 10,
  REDIS_EXPIRATION: Number(process.env.REDIS_EXPIRATION) ?? 60, // Unit: seconds
  DEFAULT_PASSWORD_PREFIX: process.env.DEFAULT_PASSWORD_PREFIX ?? "NCC_VINH",
  MEDIA_PATH: process.env.MEDIA_PATH ?? "/uploads",
};
